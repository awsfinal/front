import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations, getLanguage, setLanguage as saveLanguage } from '../utils/translations';
import { findNearestSubwayStation, formatDistance as formatSubwayDistance, lineColors } from '../data/subwayStations';

// CSS 애니메이션을 위한 스타일 추가
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 스타일 태그를 head에 추가
if (!document.querySelector('#main-animations')) {
  const style = document.createElement('style');
  style.id = 'main-animations';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

// 칼만필터 클래스
class KalmanFilter {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = { lat: 0, lng: 0 };
    this.P = { lat: 8000, lng: 8000 };
    this.Q = { lat: 25, lng: 25 };
    this.initialized = false;
    this.count = 0;
  }
    
  update(measurement) {
    this.count++;
      
    if (!this.initialized) {
      this.x.lat = measurement.latitude;
      this.x.lng = measurement.longitude;
      this.initialized = true;
      return {
        latitude: measurement.latitude,
        longitude: measurement.longitude,
        accuracy: measurement.accuracy
      };
    }
    
    const R = {
      lat: Math.max(measurement.accuracy / 3, 30),
      lng: Math.max(measurement.accuracy / 3, 30)
    };
    
    const x_pred = { lat: this.x.lat, lng: this.x.lng };
    const P_pred = { lat: this.P.lat + this.Q.lat, lng: this.P.lng + this.Q.lng };
    
    const K = {
      lat: P_pred.lat / (P_pred.lat + R.lat),
      lng: P_pred.lng / (P_pred.lng + R.lng)
    };
    
    this.x.lat = x_pred.lat + K.lat * (measurement.latitude - x_pred.lat);
    this.x.lng = x_pred.lng + K.lng * (measurement.longitude - x_pred.lng);
    
    this.P.lat = (1 - K.lat) * P_pred.lat;
    this.P.lng = (1 - K.lng) * P_pred.lng;
    
    return {
      latitude: this.x.lat,
      longitude: this.x.lng,
      accuracy: Math.sqrt(this.P.lat + this.P.lng)
    };
  }
}

function MainPage() {
  const navigate = useNavigate();
  const [currentGPS, setCurrentGPS] = useState(null);
  const [isGPSReady, setIsGPSReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [nearbyTouristSpots, setNearbyTouristSpots] = useState([]);
  const kalmanFilterRef = useRef(null);
  const [gpsInterval, setGpsInterval] = useState(null);
  const [language, setLanguage] = useState('ko');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  const t = translations[language];
  
  const getKalmanFilter = () => {
    if (!kalmanFilterRef.current) {
      kalmanFilterRef.current = new KalmanFilter();
    }
    return kalmanFilterRef.current;
  };

  useEffect(() => {
    // 기기 타입 감지
    const userAgent = navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));
    setIsAndroid(/Android/i.test(userAgent));
    
    // 언어 설정 가져오기
    const savedLanguage = getLanguage();
    setLanguage(savedLanguage);
    
    // GPS 수집 시작
    startGPSCollection();
    
    // 컴포넌트 언마운트 시 GPS 중지
    return () => {
      stopContinuousGPSTracking();
    };
  }, []);

  // GPS 업데이트 시 관광지 API 호출
  useEffect(() => {
    if (currentGPS && isGPSReady) {
      console.log('🔄 GPS 업데이트됨, 관광지 API 호출');
      fetchNearbyTouristSpots(currentGPS.latitude, currentGPS.longitude);
    }
  }, [currentGPS, isGPSReady]);
  
  const startGPSCollection = async () => {
    if (!navigator.geolocation) {
      setIsLoading(false);
      return;
    }
    
    getKalmanFilter().reset();
    
    for (let i = 0; i < 10; i++) {
      try {
        const position = await getSingleGPSReading();
        const measurement = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        const filteredResult = getKalmanFilter().update(measurement);
        
        const finalGPS = {
          latitude: parseFloat(filteredResult.latitude.toFixed(7)),
          longitude: parseFloat(filteredResult.longitude.toFixed(7)),
          accuracy: filteredResult.accuracy,
          timestamp: Date.now(),
          deviceType: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Other',
          captureTime: new Date().toISOString(),
          measurementCount: i + 1
        };
        
        setCurrentGPS(finalGPS);
        
        // 정확도 50m 이하면 초기 수집 완료 및 실시간 업데이트 시작
        if (filteredResult.accuracy <= 50) {
          localStorage.setItem('mainPageGPS', JSON.stringify(finalGPS));
          setIsGPSReady(true);
          setIsLoading(false);
          await sendGPSToBackend(finalGPS);
          startContinuousGPSTracking(); // 실시간 GPS 업데이트 시작
          return;
        }
        
        await sendGPSToBackend(finalGPS);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`GPS 측정 ${i+1} 실패:`, error);
      }
    }
    
    // 10번 측정 후에도 50m 이하가 안되면 마지막 값 사용
    if (currentGPS) {
      localStorage.setItem('mainPageGPS', JSON.stringify(currentGPS));
      setIsGPSReady(true);
      startContinuousGPSTracking(); // 실시간 GPS 업데이트 시작
    }
    setIsLoading(false);
  };
  
  const getSingleGPSReading = () => {
    return new Promise((resolve, reject) => {
      const gpsOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      
      if (isIOS) {
        setTimeout(() => {
          navigator.geolocation.getCurrentPosition(resolve, reject, gpsOptions);
        }, 100);
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, gpsOptions);
      }
    });
  };
  
  // 실시간 GPS 업데이트 시작
  const startContinuousGPSTracking = () => {
    const interval = setInterval(async () => {
      try {
        const position = await getSingleGPSReading();
        const measurement = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        // 칼만필터 적용
        const filteredResult = getKalmanFilter().update(measurement);
        
        const updatedGPS = {
          latitude: parseFloat(filteredResult.latitude.toFixed(7)),
          longitude: parseFloat(filteredResult.longitude.toFixed(7)),
          accuracy: filteredResult.accuracy,
          timestamp: Date.now(),
          deviceType: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Other',
          captureTime: new Date().toISOString(),
          measurementCount: getKalmanFilter().count
        };
        
        setCurrentGPS(updatedGPS);
        localStorage.setItem('mainPageGPS', JSON.stringify(updatedGPS));
        await sendGPSToBackend(updatedGPS);
        
      } catch (error) {
        console.error('GPS 실시간 업데이트 실패:', error);
      }
    }, 5000); // 5초마다 업데이트
    
    setGpsInterval(interval);
  };
  
  // GPS 업데이트 중지
  const stopContinuousGPSTracking = () => {
    if (gpsInterval) {
      clearInterval(gpsInterval);
      setGpsInterval(null);
    }
  };

  const sendGPSToBackend = async (gpsData) => {
    try {
      // 동적 API URL 생성
      // ngrok 환경에서는 GPS API 호출 비활성화 (503 오류 방지)
      if (window.location.hostname.includes('ngrok') || window.location.hostname.includes('tunnel')) {
        console.log('🚫 ngrok 환경에서는 GPS API 호출을 건너뜁니다.');
        return null;
      }

      const possibleURLs = [
        'http://localhost:5006/api/gps',
        'http://127.0.0.1:5006/api/gps'
      ];
      
      for (const url of possibleURLs) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(gpsData)
          });
          
          if (response.ok) {
            const result = await response.json();
            return result;
          }
        } catch (error) {
          // 연결 실패 시 다음 IP 시도
        }
      }
    } catch (error) {
      console.error('백엔드 전송 오류:', error);
    }
  };

  // S3 이미지 URL 생성 함수
  const getS3ImageUrl = (name) => {
    const url = `https://myturn9.s3.amazonaws.com/Cultural%20Heritage/${encodeURIComponent(name)}.jpg`;
    console.log(`S3 URL 생성: ${name} -> ${url}`);
    return url;
  };

  // 서울 관광지 데이터 (다국어 지원)
  const allHeritageData = [
    { id: 'gangsong', name: '간송옛집', nameEn: 'Gansong Art Museum', lat: 37.5756500, lng: 126.9990370, address: '서울시 성북구 성북로 102-11', addressEn: 'Seoul, Seongbuk-gu, Seongbuk-ro 102-11', image: getS3ImageUrl('간송옛집') },
    { id: 'gyeongbokgung', name: '경복궁', nameEn: 'Gyeongbokgung Palace', lat: 37.5796010, lng: 126.9770350, address: '서울시 종로구 사직로 161', addressEn: 'Seoul, Jongno-gu, Sajik-ro 161', image: getS3ImageUrl('경복궁') },
    { id: 'gyeonghuigung', name: '경희궁', nameEn: 'Gyeonghuigung Palace', lat: 37.5715050, lng: 126.9694020, address: '서울시 종로구 새문안로 45', addressEn: 'Seoul, Jongno-gu, Saemunan-ro 45', image: getS3ImageUrl('경희궁') },
    { id: 'gwanghwamun', name: '광화문', nameEn: 'Gwanghwamun Gate', lat: 37.5759830, lng: 126.9768110, address: '서울시 종로구 세종대로 172', addressEn: 'Seoul, Jongno-gu, Sejong-daero 172', image: getS3ImageUrl('광화문') },
    { id: 'national_museum', name: '국립중앙박물관', nameEn: 'National Museum of Korea', lat: 37.5241130, lng: 126.9802590, address: '서울시 용산구 서빙고로 137', addressEn: 'Seoul, Yongsan-gu, Seobinggo-ro 137', image: getS3ImageUrl('국립중앙박물관') },
    { id: 'namsan_tower', name: '남산타워', nameEn: 'N Seoul Tower', lat: 37.5512090, lng: 126.9882280, address: '서울시 용산구 남산공원길 105', addressEn: 'Seoul, Yongsan-gu, Namsan Park-gil 105', image: getS3ImageUrl('남산타워') },
    { id: 'deoksugung', name: '덕수궁', nameEn: 'Deoksugung Palace', lat: 37.5658340, lng: 126.9751240, address: '서울시 중구 세종대로 99', addressEn: 'Seoul, Jung-gu, Sejong-daero 99', image: getS3ImageUrl('덕수궁') },
    { id: 'ttukseom', name: '뚝섬', nameEn: 'Ttukseom', lat: 37.5309820, lng: 127.0709640, address: '서울시 성동구 자동차시장길 49', addressEn: 'Seoul, Seongdong-gu, Jadongcha Market-gil 49', image: getS3ImageUrl('뚝섬') },
    { id: 'lotte_tower', name: '롯데타워', nameEn: 'Lotte World Tower', lat: 37.5125910, lng: 127.1025490, address: '서울시 송파구 올림픽로 300', addressEn: 'Seoul, Songpa-gu, Olympic-ro 300', image: getS3ImageUrl('롯데타워') },
    { id: 'myeongdong_cathedral', name: '명동성당', nameEn: 'Myeongdong Cathedral', lat: 37.5636920, lng: 126.9865340, address: '서울시 중구 명동길 74', addressEn: 'Seoul, Jung-gu, Myeongdong-gil 74', image: getS3ImageUrl('명동성당') },
    { id: 'banpo_island', name: '새빛둥둥섬', nameEn: 'Saevit Floating Island', lat: 37.5258220, lng: 127.0724620, address: '서울시 서초구 신반포로 11', addressEn: 'Seoul, Seocho-gu, Sinbanpo-ro 11', image: getS3ImageUrl('새빛둥둥섬') },
    { id: 'seodaemun_park', name: '서대문독립공원', nameEn: 'Seodaemun Independence Park', lat: 37.5741140, lng: 126.9586390, address: '서울시 서대문구 통일로 251', addressEn: 'Seoul, Seodaemun-gu, Tongil-ro 251', image: getS3ImageUrl('서대문독립공원') },
    { id: 'seodaemun_prison', name: '서대문형무소', nameEn: 'Seodaemun Prison History Hall', lat: 37.5735460, lng: 126.9575230, address: '서울시 서대문구 통일로 251', addressEn: 'Seoul, Seodaemun-gu, Tongil-ro 251', image: getS3ImageUrl('서대문형무소') },
    { id: 'seoul_forest', name: '서울숲', nameEn: 'Seoul Forest', lat: 37.5442890, lng: 127.0370130, address: '서울시 성동구 뚝섬로 273', addressEn: 'Seoul, Seongdong-gu, Ttukseom-ro 273', image: getS3ImageUrl('서울숲') },
    { id: 'seoul_station', name: '서울역', nameEn: 'Seoul Station', lat: 37.5553620, lng: 126.9706420, address: '서울시 중구 한강대로 405', addressEn: 'Seoul, Jung-gu, Hangang-daero 405', image: getS3ImageUrl('서울역') },
    { id: 'seokchon_lake', name: '석촌호수', nameEn: 'Seokchon Lake', lat: 37.5098140, lng: 127.1033380, address: '서울시 송파구 잠실동 47', addressEn: 'Seoul, Songpa-gu, Jamsil-dong 47', image: getS3ImageUrl('석촌호수') },
    { id: 'childrens_grand_park', name: '어린이대공원', nameEn: 'Seoul Children\'s Grand Park', lat: 37.5481300, lng: 127.0814060, address: '서울시 광진구 능동로 216', addressEn: 'Seoul, Gwangjin-gu, Neungdong-ro 216', image: getS3ImageUrl('어린이대공원') },
    { id: 'yeonsan_tomb', name: '연산군묘', nameEn: 'Tomb of Prince Yeonsan', lat: 37.6191770, lng: 127.0647980, address: '서울시 도봉구 방학동 산1-1', addressEn: 'Seoul, Dobong-gu, Banghak-dong San 1-1', image: getS3ImageUrl('연산군묘') },
    { id: 'arts_center', name: '예술의전당', nameEn: 'Seoul Arts Center', lat: 37.4790540, lng: 127.0118640, address: '서울시 서초구 남부순환로 2406', addressEn: 'Seoul, Seocho-gu, Nambu Sunhwan-ro 2406', image: getS3ImageUrl('예술의전당') },
    { id: 'olympic_park', name: '올림픽공원', nameEn: 'Olympic Park', lat: 37.5199970, lng: 127.1244360, address: '서울시 송파구 올림픽로 424', addressEn: 'Seoul, Songpa-gu, Olympic-ro 424', image: getS3ImageUrl('올림픽공원') },
    { id: 'war_memorial', name: '전쟁기념관', nameEn: 'War Memorial of Korea', lat: 37.5346020, lng: 126.9779640, address: '서울시 용산구 이태원로 29', addressEn: 'Seoul, Yongsan-gu, Itaewon-ro 29', image: getS3ImageUrl('전쟁기념관') },
    { id: 'jongmyo', name: '종묘', nameEn: 'Jongmyo Shrine', lat: 37.5747710, lng: 126.9942700, address: '서울시 종로구 종로 157', addressEn: 'Seoul, Jongno-gu, Jongno 157', image: getS3ImageUrl('종묘') },
    { id: 'changgyeonggung', name: '창경궁', nameEn: 'Changgyeonggung Palace', lat: 37.5795730, lng: 126.9954760, address: '서울시 종로구 창경궁로 185', addressEn: 'Seoul, Jongno-gu, Changgyeonggung-ro 185', image: getS3ImageUrl('창경궁') },
    { id: 'changnyeong_palace', name: '창녕위궁재사', nameEn: 'Changnyeong Palace Shrine', lat: 37.5749800, lng: 126.9863500, address: '서울시 종로구 인사동길 30-1', addressEn: 'Seoul, Jongno-gu, Insadong-gil 30-1', image: getS3ImageUrl('창녕위궁재사') },
    { id: 'changdeokgung', name: '창덕궁', nameEn: 'Changdeokgung Palace', lat: 37.5797220, lng: 126.9910140, address: '서울시 종로구 율곡로 99', addressEn: 'Seoul, Jongno-gu, Yulgok-ro 99', image: getS3ImageUrl('창덕궁') },
    { id: 'national_cemetery', name: '현충원', nameEn: 'Seoul National Cemetery', lat: 37.5020980, lng: 126.9752550, address: '서울시 동작구 현충로 210', addressEn: 'Seoul, Dongjak-gu, Hyeonchung-ro 210', image: getS3ImageUrl('현충원') }
  ];

  // 두 좌표 간의 거리 계산 (km 단위)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 거리 포맷팅
  const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  };

  // 관광공사 API에서 가까운 관광지 가져오기
  const fetchNearbyTouristSpots = async (latitude, longitude) => {
    try {
      console.log('🏛️ 관광공사 API로 가까운 관광지 조회 시작');
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5007';
      const response = await fetch(`${apiUrl}/api/tourist-spots/nearby?latitude=${latitude}&longitude=${longitude}&limit=3`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log(`✅ 관광공사 API 응답: ${result.data.length}개 관광지`);
          
          // 관광지 데이터를 기존 형식에 맞게 변환
          const formattedSpots = result.data.map(spot => ({
            id: spot.contentId,
            name: spot.title,
            nameEn: spot.title, // 영문명이 없으면 한글명 사용
            lat: parseFloat(spot.mapY),
            lng: parseFloat(spot.mapX),
            address: spot.addr1 || '주소 정보 없음',
            addressEn: spot.addr1 || 'No address available',
            image: spot.firstImage || '/image/default-heritage.jpg',
            distance: spot.distance,
            formattedDistance: formatDistance(spot.distance),
            isApiData: true // API에서 가져온 데이터임을 표시
          }));
          
          setNearbyTouristSpots(formattedSpots);
          return formattedSpots;
        }
      }
      
      console.log('❌ 관광공사 API 호출 실패, 기본 데이터 사용');
      return null;
    } catch (error) {
      console.error('❌ 관광공사 API 오류:', error);
      return null;
    }
  };

  // GPS 기반 가까운 관광지 계산 (관광공사 API만 사용)
  const getNearbyHeritage = () => {
    // 관광공사 API 데이터만 사용
    if (nearbyTouristSpots.length > 0) {
      return nearbyTouristSpots.slice(0, 3);
    }

    // API 데이터가 없으면 빈 배열 반환 (기존 하드코딩 데이터 사용 안함)
    return [];
  };

  const heritageData = getNearbyHeritage();

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: 'white', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 로딩 모달 */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            textAlign: 'center',
            minWidth: '200px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #007AFF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 15px'
            }}></div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
              {t.loading}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {t.gpsProcessing}
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/image/jjikgeo_icon.png" 
            alt="찍지오"
            style={{ 
              width: '45px', 
              height: '45px', 
              objectFit: 'cover'
            }}
            onError={(e) => {
              // 이미지 로드 실패시 기본 스타일로 대체
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{ 
            width: '45px', 
            height: '45px', 
            background: '#007AFF', 
            borderRadius: '8px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            찍지오
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div 
            style={{ 
              fontSize: '14px', 
              color: '#007AFF',
              cursor: 'pointer',
              padding: '5px 10px',
              borderRadius: '15px',
              border: '1px solid #007AFF',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              minWidth: '80px',
              justifyContent: 'center'
            }}
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            🌐 {t.language}
          </div>
          {showLanguageDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #007AFF',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: '100px'
            }}>
              <div 
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: language === 'ko' ? '#f0f8ff' : 'white'
                }}
                onClick={() => {
                  setLanguage('ko');
                  saveLanguage('ko');
                  setShowLanguageDropdown(false);
                }}
              >
                🇰🇷 한국어
              </div>
              <div 
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  backgroundColor: language === 'en' ? '#f0f8ff' : 'white'
                }}
                onClick={() => {
                  setLanguage('en');
                  saveLanguage('en');
                  setShowLanguageDropdown(false);
                }}
              >
                🇺🇸 English
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        padding: '20px 20px 10px 20px', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Top Images */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginBottom: '25px',
          flexShrink: 0
        }}>
          <img 
            src="/image/banner_building.png" 
            alt="이벤트 1"
            style={{ 
              flex: 1,
              height: '100px',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
            onError={(e) => {
              e.target.style.background = '#f0f0f0';
              e.target.style.display = 'flex';
              e.target.style.alignItems = 'center';
              e.target.style.justifyContent = 'center';
              e.target.innerHTML = '이미지1';
            }}
          />
          <img 
            src="/image/banner_logo.png" 
            alt="찍지오"
            style={{ 
              flex: 1,
              height: '100px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            onError={(e) => {
              e.target.style.background = '#f0f0f0';
              e.target.style.display = 'flex';
              e.target.style.alignItems = 'center';
              e.target.style.justifyContent = 'center';
              e.target.innerHTML = '찍지오';
            }}
          />
          <img 
            src="/image/banner_person.png" 
            alt="사람 사진"
            style={{ 
              flex: 1,
              height: '100px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            onError={(e) => {
              e.target.style.background = '#f0f0f0';
              e.target.style.display = 'flex';
              e.target.style.alignItems = 'center';
              e.target.style.justifyContent = 'center';
              e.target.innerHTML = '사람사진';
            }}
          />
        </div>

        {/* GPS 좌표 표시 */}
        {currentGPS && isGPSReady && (
          <div style={{
            backgroundColor: '#f0f8ff',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '1px solid #007AFF',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#007AFF', marginBottom: '5px' }}>
              📍 {t.gpsCoordinates}
            </div>
            <div style={{ fontSize: '12px', color: '#333' }}>
              {t.latitude}: {currentGPS.latitude.toFixed(7)}
            </div>
            <div style={{ fontSize: '12px', color: '#333' }}>
              {t.longitude}: {currentGPS.longitude.toFixed(7)}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
              {t.accuracy}: {Math.round(currentGPS.accuracy)}m | {t.measurement}: {currentGPS.measurementCount}{t.times} | {t.realTimeUpdate}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          marginBottom: '25px',
          flexShrink: 0
        }}>
          <div 
            className="card" 
            style={{ 
              flex: 1,
              textAlign: 'center', 
              cursor: 'pointer',
              padding: '12px 8px',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>❓</div>
            <div style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{t.help}</div>
          </div>
          <div 
            className="card" 
            style={{ 
              flex: 1,
              textAlign: 'center', 
              cursor: 'pointer',
              padding: '12px 8px',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onClick={() => navigate('/toilet')}
          >
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>🚻</div>
            <div style={{ fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', lineHeight: '1.2' }}>{t.publicToilet}</div>
          </div>
          <div 
            className="card" 
            style={{ 
              flex: 1,
              textAlign: 'center', 
              cursor: 'pointer',
              padding: '12px 8px',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>💊</div>
            <div style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{t.pharmacy}</div>
          </div>
          <div 
            className="card" 
            style={{ 
              flex: 1,
              textAlign: 'center', 
              cursor: 'pointer',
              padding: '12px 8px',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onClick={() => navigate('/community')}
          >
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>💬</div>
            <div style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>{t.community}</div>
          </div>
        </div>

        {/* Tourism News */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', margin: '0 0 20px 0' }}>
            {t.tourismNews}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px' }}>
            {heritageData.map(heritage => (
              <div 
                key={heritage.id}
                style={{
                  background: '#faf3f3',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  // API에서 가져온 관광지 데이터인지 확인
                  if (heritage.isApiData) {
                    // API 데이터인 경우 새로운 상세 페이지로 이동
                    console.log('🏛️ API 관광지 클릭:', heritage.name, heritage.id);
                    navigate(`/tourist-spot/${heritage.id}`);
                  } else {
                    // 기존 하드코딩된 데이터인 경우 기존 상세 페이지로 이동
                    console.log('🏛️ 기존 관광지 클릭:', heritage.name, heritage.id);
                    navigate(`/detail/${heritage.id}`);
                  }
                }}
              >
                {/* Left Image */}
                <div style={{ flexShrink: 0 }}>
                  <img 
                    src={heritage.image} 
                    alt={heritage.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                    onLoad={() => {
                      console.log(`✅ 이미지 로드 성공: ${heritage.name}`);
                    }}
                    onError={(e) => {
                      console.error(`❌ 이미지 로드 실패: ${heritage.name}`);
                      console.error(`실패 URL: ${e.target.src}`);
                      
                      // 다른 URL 형식 시도
                      if (!e.target.dataset.retry) {
                        e.target.dataset.retry = '1';
                        const newUrl = `https://s3.amazonaws.com/myturn9/Cultural Heritage/${heritage.name}.jpg`;
                        console.log(`폴백 URL 시도: ${newUrl}`);
                        e.target.src = newUrl;
                        return;
                      }
                      
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      background: '#f0f0f0',
                      display: 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: '10px',
                      borderRadius: '8px'
                    }}
                  >
                    이미지
                  </div>
                </div>

                {/* Right Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '3px',
                    color: '#333'
                  }}>
                    {language === 'ko' ? heritage.name : heritage.nameEn}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginBottom: '3px'
                  }}>
                    📍 {language === 'ko' ? heritage.address : heritage.addressEn}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#007AFF',
                    fontWeight: '500'
                  }}>
                    {t.currentLocation} {heritage.formattedDistance || (language === 'ko' ? '계산 중...' : 'Calculating...')}
                    {currentGPS && (() => {
                      const nearestStation = findNearestSubwayStation(currentGPS.latitude, currentGPS.longitude, 1)[0];
                      if (nearestStation) {
                        return (
                          <span style={{ marginLeft: '8px' }}>
                            • 🚇 {language === 'ko' ? nearestStation.name : nearestStation.nameEn} {formatSubwayDistance(nearestStation.distance)}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="nav-bar">
        <div 
          className="nav-item"
          onClick={() => navigate('/stamp')}
          style={{ cursor: 'pointer' }}
        >
          <div 
            className="nav-icon" 
            style={{ backgroundImage: 'url(/image/rubber-stamp.png)' }}
          ></div>
          <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{t.stamp}</span>
        </div>
        <div 
          className="nav-item"
          onClick={() => {
            if (!isGPSReady) {
              alert(t.loadingWait);
              return;
            }
            navigate('/camera');
          }}
          style={{ cursor: 'pointer' }}
        >
          <div 
            className="nav-icon" 
            style={{ backgroundImage: 'url(/image/nav_camera.png)' }}
          ></div>
          <span style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{t.camera}</span>
        </div>
        <div 
          className="nav-item"
          onClick={() => navigate('/settings')}
          style={{ cursor: 'pointer' }}
        >
          <div 
            className="nav-icon" 
            style={{ backgroundImage: 'url(/image/settings.png)' }}
          ></div>
          <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{t.settings}</span>
        </div>
      </div>
    </div>
  );
}

export default MainPage;