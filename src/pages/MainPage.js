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

  // === GPS / 상태 ===
  const [currentGPS, setCurrentGPS] = useState(null);
  const [isGPSReady, setIsGPSReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [nearbyTouristSpots, setNearbyTouristSpots] = useState([]);
  const kalmanFilterRef = useRef(null);
  const [gpsInterval, setGpsInterval] = useState(null);

  // === 언어(i18n): 코드 기반으로 관리(ko/en/ja/zh) ===
  const [language, setLanguage] = useState('ko');
  const t = translations[language];

  // 깃 메인 브랜치의 플래그 드롭다운 UI를 코드 기반으로 통합
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languages = [
    { code: 'ko', name: '한국어', flag: '/image/koera.png' },
    { code: 'en', name: 'English', flag: '/image/usa.png' },
    { code: 'ja', name: '日本語', flag: '/image/japan.png' },
    { code: 'zh', name: '中文', flag: '/image/china.png' }
  ];
  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  const handleLanguageSelect = (lang) => {
    setLanguage(lang.code);
    saveLanguage(lang.code);
    setIsLanguageDropdownOpen(false);
  };

  const handleOutsideClick = (e) => {
    if (isLanguageDropdownOpen && !e.target.closest('.language-dropdown')) {
      setIsLanguageDropdownOpen(false);
    }
  };

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

    // 저장된 언어 불러오기
    const savedLanguage = getLanguage();
    setLanguage(savedLanguage);

    // GPS 수집 시작
    startGPSCollection();

    return () => {
      stopContinuousGPSTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GPS 변경 시 관광지 API 호출
  useEffect(() => {
    if (currentGPS && isGPSReady) {
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

        if (filteredResult.accuracy <= 50) {
          localStorage.setItem('mainPageGPS', JSON.stringify(finalGPS));
          setIsGPSReady(true);
          setIsLoading(false);
          await sendGPSToBackend(finalGPS);
          startContinuousGPSTracking();
          return;
        }

        await sendGPSToBackend(finalGPS);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`GPS 측정 ${i + 1} 실패:`, error);
      }
    }

    if (currentGPS) {
      localStorage.setItem('mainPageGPS', JSON.stringify(currentGPS));
      setIsGPSReady(true);
      startContinuousGPSTracking();
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

  const startContinuousGPSTracking = () => {
    const interval = setInterval(async () => {
      try {
        const position = await getSingleGPSReading();
        const measurement = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
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
    }, 5000);
    setGpsInterval(interval);
  };

  const stopContinuousGPSTracking = () => {
    if (gpsInterval) {
      clearInterval(gpsInterval);
      setGpsInterval(null);
    }
  };

  const sendGPSToBackend = async (gpsData) => {
    try {
      // ngrok 환경에서는 호출 스킵
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
        } catch (_) {
          // 다음 URL 시도
        }
      }
    } catch (error) {
      console.error('백엔드 전송 오류:', error);
    }
  };

  // S3 이미지 URL 생성
  const getS3ImageUrl = (name) =>
    `https://myturn9.s3.amazonaws.com/Cultural%20Heritage/${encodeURIComponent(name)}.jpg`;

  // 서울 관광지 (하드코딩 기본값은 유지하되, API 데이터가 우선)
  const allHeritageData = [
    { id: 'gangsong', name: '간송옛집', nameEn: 'Gansong Art Museum', lat: 37.57565, lng: 126.999037, address: '서울시 성북구 성북로 102-11', addressEn: 'Seoul, Seongbuk-gu, Seongbuk-ro 102-11', image: getS3ImageUrl('간송옛집') },
    // ... (생략: 기존 배열 그대로)
    { id: 'national_cemetery', name: '현충원', nameEn: 'Seoul National Cemetery', lat: 37.502098, lng: 126.975255, address: '서울시 동작구 현충로 210', addressEn: 'Seoul, Dongjak-gu, Hyeonchung-ro 210', image: getS3ImageUrl('현충원') }
  ];

  // 거리 계산 및 포맷
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const formatDistance = (distanceKm) => {
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
    if (distanceKm < 10) return `${distanceKm.toFixed(1)}km`;
    return `${Math.round(distanceKm)}km`;
  };

  // 관광공사 API에서 가까운 관광지 가져오기
  const fetchNearbyTouristSpots = async (latitude, longitude) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5007';
      const response = await fetch(`${apiUrl}/api/tourist-spots/nearby?latitude=${latitude}&longitude=${longitude}&limit=3`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const formattedSpots = result.data.map(spot => ({
            id: spot.contentId,
            name: spot.title,
            nameEn: spot.title,
            lat: parseFloat(spot.mapY),
            lng: parseFloat(spot.mapX),
            address: spot.addr1 || '주소 정보 없음',
            addressEn: spot.addr1 || 'No address available',
            image: spot.firstImage || '/image/default-heritage.jpg',
            distance: spot.distance,
            formattedDistance: formatDistance(spot.distance),
            isApiData: true
          }));
          setNearbyTouristSpots(formattedSpots);
          return formattedSpots;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ 관광공사 API 오류:', error);
      return null;
    }
  };

  // API 데이터만 사용
  const getNearbyHeritage = () => (nearbyTouristSpots.length > 0 ? nearbyTouristSpots.slice(0, 3) : []);
  const heritageData = getNearbyHeritage();

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      onClick={handleOutsideClick}
    >
      {/* 로딩 모달 */}
      {isLoading && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', minWidth: '200px' }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid #f3f3f3',
              borderTop: '3px solid #007AFF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px'
            }} />
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>{t.loading}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{t.gpsProcessing}</div>
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
            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{
            width: '45px', height: '45px', background: '#007AFF', borderRadius: '8px',
            display: 'none', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold'
          }}>
            찍지오
          </div>
        </div>

        {/* 언어 드롭다운 */}
        <div style={{ position: 'relative' }} className="language-dropdown">
          <div
            style={{
              fontSize: '14px',
              color: '#007AFF',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '20px',
              border: '1px solid #007AFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isLanguageDropdownOpen ? '#f0f8ff' : 'white',
              minWidth: '60px',
              justifyContent: 'center'
            }}
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          >
            <img
              src={currentLanguage.flag}
              alt={currentLanguage.name}
              style={{ width: '24px', height: '18px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #ddd' }}
              onError={(e) => {
                const emojiMap = { ko: '🇰🇷', en: '🇺🇸', ja: '🇯🇵', zh: '🇨🇳' };
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
                e.target.nextSibling.textContent = emojiMap[language] || '🌐';
              }}
            />
            <span style={{ fontSize: '18px', display: 'none' }}></span>
            <span style={{
              fontSize: '10px',
              transform: isLanguageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </div>

          {isLanguageDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '5px',
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: '140px',
              overflow: 'hidden'
            }}>
              {languages.map((lang, index) => (
                <div
                  key={lang.code}
                  style={{
                    padding: '12px 15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    backgroundColor: language === lang.code ? '#f0f8ff' : 'white',
                    borderBottom: index < languages.length - 1 ? '1px solid #f0f0f0' : 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => handleLanguageSelect(lang)}
                  onMouseEnter={(e) => {
                    if (language !== lang.code) e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    if (language !== lang.code) e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <img
                    src={lang.flag}
                    alt={lang.name}
                    style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
                    onError={(e) => {
                      const emojiMap = { ko: '🇰🇷', en: '🇺🇸', ja: '🇯🇵', zh: '🇨🇳' };
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'inline';
                      e.target.nextSibling.textContent = emojiMap[lang.code] || '🌐';
                    }}
                  />
                  <span style={{ fontSize: '16px', display: 'none' }}></span>
                  <span style={{ color: language === lang.code ? '#007AFF' : '#333', fontWeight: language === lang.code ? 600 : 'normal' }}>
                    {lang.name}
                  </span>
                  {language === lang.code && (
                    <span style={{ marginLeft: 'auto', color: '#007AFF', fontSize: '12px' }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 20px 10px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Images */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexShrink: 0 }}>
          <img src="/image/banner_building.png" alt="이벤트 1" style={{ flex: 1, height: '100px', objectFit: 'contain', borderRadius: '8px' }} />
          <img src="/image/banner_logo.png" alt="찍지오" style={{ flex: 1, height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
          <img src="/image/banner_person.png" alt="사람 사진" style={{ flex: 1, height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
        </div>

        {/* GPS 좌표 표시 */}
        {currentGPS && isGPSReady && (
          <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #007AFF', flexShrink: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#007AFF', marginBottom: '5px' }}>📍 {t.gpsCoordinates}</div>
            <div style={{ fontSize: '12px', color: '#333' }}>{t.latitude}: {currentGPS.latitude.toFixed(7)}</div>
            <div style={{ fontSize: '12px', color: '#333' }}>{t.longitude}: {currentGPS.longitude.toFixed(7)}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
              {t.accuracy}: {Math.round(currentGPS.accuracy)}m | {t.measurement}: {currentGPS.measurementCount}{t.times} | {t.realTimeUpdate}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexShrink: 0 }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '12px 8px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>❓</div>
            <div style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{t.help}</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '12px 8px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} onClick={() => navigate('/toilet')}>
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>🚻</div>
            <div style={{ fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', lineHeight: '1.2' }}>{t.publicToilet}</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '12px 8px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>💊</div>
            <div style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{t.pharmacy}</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', padding: '12px 8px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} onClick={() => navigate('/community')}>
            <div style={{ fontSize: '18px', marginBottom: '5px' }}>💬</div>
            <div style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>{t.community}</div>
          </div>
        </div>

        {/* Tourism News */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0' }}>{t.tourismNews}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px' }}>
            {heritageData.map(heritage => (
              <div
                key={heritage.id}
                style={{ background: '#faf3f3', borderRadius: '12px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '12px', cursor: 'pointer' }}
                onClick={() => {
                  if (heritage.isApiData) {
                    navigate(`/tourist-spot/${heritage.id}`);
                  } else {
                    navigate(`/detail/${heritage.id}`);
                  }
                }}
              >
                {/* Left Image */}
                <div style={{ flexShrink: 0 }}>
                  <img
                    src={heritage.image}
                    alt={heritage.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                    onError={(e) => {
                      if (!e.target.dataset.retry) {
                        e.target.dataset.retry = '1';
                        e.target.src = `https://s3.amazonaws.com/myturn9/Cultural Heritage/${heritage.name}.jpg`;
                        return;
                      }
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{ width: '60px', height: '60px', background: '#f0f0f0', display: 'none', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '10px', borderRadius: '8px' }}>
                    이미지
                  </div>
                </div>

                {/* Right Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '3px', color: '#333' }}>
                    {language === 'ko' ? heritage.name : heritage.nameEn}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '3px' }}>
                    📍 {language === 'ko' ? heritage.address : heritage.addressEn}
                  </div>
                  <div style={{ fontSize: '12px', color: '#007AFF', fontWeight: 500 }}>
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
        <div className="nav-item" onClick={() => navigate('/stamp')} style={{ cursor: 'pointer' }}>
          <div className="nav-icon" style={{ backgroundImage: 'url(/image/rubber-stamp.png)' }}></div>
          <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{t.stamp}</span>
        </div>
        <div className="nav-item" onClick={() => {
          if (!isGPSReady) {
            alert(t.loadingWait);
            return;
          }
          navigate('/camera');
        }} style={{ cursor: 'pointer' }}>
          <div className="nav-icon" style={{ backgroundImage: 'url(/image/nav_camera.png)' }}></div>
          <span style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{t.camera}</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
          <div className="nav-icon" style={{ backgroundImage: 'url(/image/settings.png)' }}></div>
          <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{t.settings}</span>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
