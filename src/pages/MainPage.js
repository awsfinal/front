import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const kalmanFilterRef = useRef(null);
  const [gpsInterval, setGpsInterval] = useState(null);
  
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
    
    // GPS 수집 시작
    startGPSCollection();
    
    // 컴포넌트 언마운트 시 GPS 중지
    return () => {
      stopContinuousGPSTracking();
    };
  }, []);
  
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
      const possibleIPs = [
        '192.168.0.100',
        '192.168.1.100',
        '10.0.0.100',
        window.location.hostname,
        'localhost',
        '127.0.0.1'
      ];
      
      for (const ip of possibleIPs) {
        const url = `http://${ip}:5003/api/gps`;
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

  // 서울 관광지 데이터
  const allHeritageData = [
    { id: 'gangsong', name: '간송옛집', lat: 37.5756500, lng: 126.9990370, address: '서울시 성북구 성북로 102-11', image: getS3ImageUrl('간송옛집') },
    { id: 'gyeongbokgung', name: '경복궁', lat: 37.5796010, lng: 126.9770350, address: '서울시 종로구 사직로 161', image: getS3ImageUrl('경복궁') },
    { id: 'gyeonghuigung', name: '경희궁', lat: 37.5715050, lng: 126.9694020, address: '서울시 종로구 새문안로 45', image: getS3ImageUrl('경희궁') },
    { id: 'gwanghwamun', name: '광화문', lat: 37.5759830, lng: 126.9768110, address: '서울시 종로구 세종대로 172', image: getS3ImageUrl('광화문') },
    { id: 'national_museum', name: '국립중앙박물관', lat: 37.5241130, lng: 126.9802590, address: '서울시 용산구 서빙고로 137', image: getS3ImageUrl('국립중앙박물관') },
    { id: 'namsan_tower', name: '남산타워', lat: 37.5512090, lng: 126.9882280, address: '서울시 용산구 남산공원길 105', image: getS3ImageUrl('남산타워') },
    { id: 'deoksugung', name: '덕수궁', lat: 37.5658340, lng: 126.9751240, address: '서울시 중구 세종대로 99', image: getS3ImageUrl('덕수궁') },
    { id: 'ttukseom', name: '뚝섬', lat: 37.5309820, lng: 127.0709640, address: '서울시 성동구 자동차시장길 49', image: getS3ImageUrl('뚝섬') },
    { id: 'lotte_tower', name: '롯데타워', lat: 37.5125910, lng: 127.1025490, address: '서울시 송파구 올림픽로 300', image: getS3ImageUrl('롯데타워') },
    { id: 'myeongdong_cathedral', name: '명동성당', lat: 37.5636920, lng: 126.9865340, address: '서울시 중구 명동길 74', image: getS3ImageUrl('명동성당') },
    { id: 'banpo_island', name: '새빛둥둥섬', lat: 37.5258220, lng: 127.0724620, address: '서울시 서초구 신반포로 11', image: getS3ImageUrl('새빛둥둥섬') },
    { id: 'seodaemun_park', name: '서대문독립공원', lat: 37.5741140, lng: 126.9586390, address: '서울시 서대문구 통일로 251', image: getS3ImageUrl('서대문독립공원') },
    { id: 'seodaemun_prison', name: '서대문형무소', lat: 37.5735460, lng: 126.9575230, address: '서울시 서대문구 통일로 251', image: getS3ImageUrl('서대문형무소') },
    { id: 'seoul_forest', name: '서울숲', lat: 37.5442890, lng: 127.0370130, address: '서울시 성동구 뚝섬로 273', image: getS3ImageUrl('서울숲') },
    { id: 'seoul_station', name: '서울역', lat: 37.5553620, lng: 126.9706420, address: '서울시 중구 한강대로 405', image: getS3ImageUrl('서울역') },
    { id: 'seokchon_lake', name: '석촌호수', lat: 37.5098140, lng: 127.1033380, address: '서울시 송파구 잠실동 47', image: getS3ImageUrl('석촌호수') },
    { id: 'childrens_grand_park', name: '어린이대공원', lat: 37.5481300, lng: 127.0814060, address: '서울시 광진구 능동로 216', image: getS3ImageUrl('어린이대공원') },
    { id: 'yeonsan_tomb', name: '연산군묘', lat: 37.6191770, lng: 127.0647980, address: '서울시 도봉구 방학동 산1-1', image: getS3ImageUrl('연산군묘') },
    { id: 'arts_center', name: '예술의전당', lat: 37.4790540, lng: 127.0118640, address: '서울시 서초구 남부순환로 2406', image: getS3ImageUrl('예술의전당') },
    { id: 'olympic_park', name: '올림픽공원', lat: 37.5199970, lng: 127.1244360, address: '서울시 송파구 올림픽로 424', image: getS3ImageUrl('올림픽공원') },
    { id: 'war_memorial', name: '전쟁기념관', lat: 37.5346020, lng: 126.9779640, address: '서울시 용산구 이태원로 29', image: getS3ImageUrl('전쟁기념관') },
    { id: 'jongmyo', name: '종묘', lat: 37.5747710, lng: 126.9942700, address: '서울시 종로구 종로 157', image: getS3ImageUrl('종묘') },
    { id: 'changgyeonggung', name: '창경궁', lat: 37.5795730, lng: 126.9954760, address: '서울시 종로구 창경궁로 185', image: getS3ImageUrl('창경궁') },
    { id: 'changnyeong_palace', name: '창녕위궁재사', lat: 37.5749800, lng: 126.9863500, address: '서울시 종로구 인사동길 30-1', image: getS3ImageUrl('창녕위궁재사') },
    { id: 'changdeokgung', name: '창덕궁', lat: 37.5797220, lng: 126.9910140, address: '서울시 종로구 율곡로 99', image: getS3ImageUrl('창덕궁') },
    { id: 'national_cemetery', name: '현충원', lat: 37.5020980, lng: 126.9752550, address: '서울시 동작구 현충로 210', image: getS3ImageUrl('현충원') }
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

  // GPS 기반 가까운 관광지 계산
  const getNearbyHeritage = () => {
    if (!currentGPS) return allHeritageData.slice(0, 3);

    const heritageWithDistance = allHeritageData.map(heritage => {
      const distance = calculateDistance(
        currentGPS.latitude,
        currentGPS.longitude,
        heritage.lat,
        heritage.lng
      );
      return {
        ...heritage,
        distance: distance,
        formattedDistance: formatDistance(distance)
      };
    });

    return heritageWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
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
              로딩중
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              GPS 정보를 처리하고 있습니다...
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
        <div style={{ 
          fontSize: '14px', 
          color: '#007AFF',
          cursor: 'pointer',
          padding: '5px 10px',
          borderRadius: '15px',
          border: '1px solid #007AFF'
        }}>
          🌐 한국어
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
              📍 GPS 좌표 (칼만필터 적용)
            </div>
            <div style={{ fontSize: '12px', color: '#333' }}>
              위도: {currentGPS.latitude.toFixed(7)}
            </div>
            <div style={{ fontSize: '12px', color: '#333' }}>
              경도: {currentGPS.longitude.toFixed(7)}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
              정확도: {Math.round(currentGPS.accuracy)}m | 측정: {currentGPS.measurementCount}번 | 실시간 업데이트
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
            <div style={{ fontSize: '11px' }}>Help</div>
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
            <div style={{ fontSize: '11px' }}>공용화장실</div>
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
            <div style={{ fontSize: '11px' }}>약국</div>
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
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>💬</div>
            <div style={{ fontSize: '11px' }}>커뮤니티</div>
          </div>
        </div>

        {/* Tourism News */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', margin: '0 0 20px 0' }}>
            관광지 소식
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
                onClick={() => navigate(`/detail/${heritage.id}`)}
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
                    {heritage.name}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginBottom: '3px'
                  }}>
                    📍 {heritage.address}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#007AFF',
                    fontWeight: '500'
                  }}>
                    현재 위치에서 {heritage.formattedDistance || '계산 중...'}
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
          <span>스탬프</span>
        </div>
        <div 
          className="nav-item"
          onClick={() => {
            if (!isGPSReady) {
              alert('로딩중입니다. 잠시만 기다려주세요.');
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
          <span>사진찍기</span>
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
          <span>설정</span>
        </div>
      </div>
    </div>
  );
}

export default MainPage;