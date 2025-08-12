import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations, getLanguage } from '../utils/translations';

function ToiletPage() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [toilets, setToilets] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [language, setLanguage] = useState('ko');
  const [currentAddress, setCurrentAddress] = useState('');
  const [filters, setFilters] = useState({
    disabled: false,
    allDay: false
  });
  
  const t = translations[language];
  
  useEffect(() => {
    const savedLanguage = getLanguage();
    setLanguage(savedLanguage);
    setCurrentAddress(savedLanguage === 'ko' ? '위치 확인 중...' : 'Checking location...');
  }, []);

  // 사용자 위치 가져오기
  useEffect(() => {
    const getUserLocation = () => {
      console.log('위치 정보 요청 시작...');

      if (navigator.geolocation) {
        // 먼저 watchPosition으로 더 정확한 위치 시도
        let watchId = null;
        let hasGotLocation = false;

        watchId = navigator.geolocation.watchPosition(
          (position) => {
            try {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              };

              console.log('위치 업데이트:', location);
              console.log('위치 정확도:', Math.round(location.accuracy), '미터');

              // 첫 번째 위치이거나 더 정확한 위치인 경우 업데이트
              if (!hasGotLocation || location.accuracy < 500) {
                setUserLocation(location);
                if (!hasGotLocation) {
                  initializeMap(location);
                  hasGotLocation = true;
                }

                // 정확도가 100m 이내면 추적 중지
                if (location.accuracy <= 100) {
                  console.log('높은 정확도 달성, 위치 추적 중지');
                  navigator.geolocation.clearWatch(watchId);
                }
              }
            } catch (err) {
              console.error('위치 처리 중 오류:', err);
              if (!hasGotLocation) {
                setLocationError('위치 처리 중 오류가 발생했습니다.');
                hasGotLocation = true;
              }
            }
          },
          (error) => {
            console.error('위치 조회 실패:', error);
            console.log('에러 코드:', error.code);
            console.log('에러 메시지:', error.message);

            let errorMessage = '';
            switch (error.code) {
              case 1: // PERMISSION_DENIED
                errorMessage = '위치 권한이 거부되었습니다.';
                break;
              case 2: // POSITION_UNAVAILABLE
                errorMessage = '위치 정보를 사용할 수 없습니다.';
                break;
              case 3: // TIMEOUT
                errorMessage = '위치 요청 시간이 초과되었습니다.';
                break;
              default:
                errorMessage = '알 수 없는 오류가 발생했습니다.';
                break;
            }

            console.log('사용자 알림:', errorMessage);
            alert(errorMessage + ' 위치 권한을 허용하고 다시 시도해주세요.');
            setLocationError(errorMessage);
          },
          {
            enableHighAccuracy: true, // GPS 사용
            timeout: 20000, // 20초 타임아웃
            maximumAge: 0 // 캐시 사용 안함 (항상 새로운 위치)
          }
        );

        // 15초 후에도 정확한 위치를 못 찾으면 watchPosition 중지
        setTimeout(() => {
          if (watchId && !hasGotLocation) {
            navigator.geolocation.clearWatch(watchId);
            console.log('위치 추적 타임아웃으로 중지');
            setLocationError('위치 확인 시간이 초과되었습니다. 위치 권한을 확인하고 다시 시도해주세요.');
          } else if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            console.log('위치 추적 정상 완료');
          }
        }, 15000);

      } else {
        console.error('브라우저가 위치 정보를 지원하지 않습니다.');
        alert('브라우저가 위치 정보를 지원하지 않습니다. 최신 브라우저를 사용해주세요.');
        setLocationError('브라우저가 위치 정보를 지원하지 않습니다.');
      }
    };

    const setLocationError = (errorMessage) => {
      console.error('위치 오류:', errorMessage);
      setCurrentAddress('위치를 확인할 수 없습니다');
      // 위치 오류 시 지도나 화장실 데이터를 로드하지 않음
    };

    getUserLocation();
  }, []);

  // 좌표 정확도 개선을 위한 변환 함수
  const improveLocationAccuracy = (location, callback) => {
    try {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.log('좌표 변환 서비스 없음, 원본 좌표 사용');
        callback(location);
        return;
      }

      // Geocoder를 사용해서 좌표 정확도 검증
      const geocoder = new window.kakao.maps.services.Geocoder();

      // 현재 좌표를 주소로 변환해서 정확도 확인
      geocoder.coord2Address(location.lng, location.lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          console.log('좌표 검증 성공:', result[0]);

          // 검증된 좌표 사용 (필요시 미세 조정)
          const improvedLocation = {
            ...location,
            address: result[0].address ? result[0].address.address_name : '주소 정보 없음'
          };

          // 현재 주소를 state에 저장
          setCurrentAddress(improvedLocation.address);
          console.log('개선된 위치 정보:', improvedLocation);
          callback(improvedLocation);
        } else {
          console.log('좌표 검증 실패, 원본 좌표 사용');
          callback(location);
        }
      });
    } catch (error) {
      console.error('좌표 개선 중 오류:', error);
      callback(location);
    }
  };

  // 카카오지도 초기화
  const initializeMap = (location) => {
    try {
      // 카카오지도 API 로드 상태 확인 및 대기
      const waitForKakaoMaps = () => {
        return new Promise((resolve, reject) => {
          if (window.kakao && window.kakao.maps) {
            resolve();
            return;
          }

          let attempts = 0;
          const maxAttempts = 50; // 5초 대기

          const checkInterval = setInterval(() => {
            attempts++;
            console.log(`카카오지도 API 로드 확인 중... (${attempts}/${maxAttempts})`);

            if (window.kakao && window.kakao.maps) {
              clearInterval(checkInterval);
              resolve();
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              reject(new Error('카카오지도 API 로드 타임아웃'));
            }
          }, 100);
        });
      };

      waitForKakaoMaps().then(() => {
        console.log('카카오지도 API 로드 완료');
        createMap(location);
      }).catch((error) => {
        console.error('카카오지도 API 로드 실패:', error);
        alert('지도를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      });

    } catch (error) {
      console.error('지도 초기화 중 오류:', error);
    }
  };

  // 실제 지도 생성 함수
  const createMap = (location) => {
    try {
      const container = mapContainer.current;
      if (!container) {
        console.error('지도 컨테이너를 찾을 수 없습니다.');
        return;
      }

      console.log('지도 생성 시작:', location);

      // 좌표 정확도 개선 후 지도 초기화
      improveLocationAccuracy(location, (improvedLocation) => {
        try {
          const options = {
            center: new window.kakao.maps.LatLng(improvedLocation.lat, improvedLocation.lng),
            level: 3
          };

          console.log('카카오지도 생성 중...');
          const kakaoMap = new window.kakao.maps.Map(container, options);
          console.log('카카오지도 생성 완료');

          setMap(kakaoMap);

          // 사용자 위치 마커 표시 (커스텀 마커 사용)
          const userMarkerImage = new window.kakao.maps.MarkerImage(
            'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="12" fill="#007AFF" stroke="white" stroke-width="3"/>
                <circle cx="15" cy="15" r="6" fill="white"/>
                <circle cx="15" cy="15" r="3" fill="#007AFF"/>
              </svg>
            `),
            new window.kakao.maps.Size(30, 30),
            {
              offset: new window.kakao.maps.Point(15, 15)
            }
          );

          const userMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(improvedLocation.lat, improvedLocation.lng),
            image: userMarkerImage,
            map: kakaoMap
          });

          // 사용자 위치 인포윈도우 (주소 정보 포함)
          const userInfowindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding:8px;font-size:12px;text-align:center;max-width:200px;">
                <strong style="color:#007AFF;">📍 ${language === 'ko' ? '내 위치' : 'My Location'}</strong><br/>
                ${improvedLocation.address ? `<span style="color:#666;font-size:10px;">${improvedLocation.address}</span>` : ''}
              </div>
            `
          });

          // 사용자 마커 클릭 이벤트
          window.kakao.maps.event.addListener(userMarker, 'click', () => {
            userInfowindow.open(kakaoMap, userMarker);
          });

          console.log('사용자 마커 생성 완료');

          // 화장실 데이터 가져오기
          fetchToiletData(improvedLocation, kakaoMap);
        } catch (mapError) {
          console.error('지도 생성 중 상세 오류:', mapError);
          alert('지도를 생성할 수 없습니다. 카카오지도 API 키를 확인해주세요.');
        }
      });
    } catch (error) {
      console.error('지도 초기화 중 오류:', error);
    }
  };

  // 두 지점 간의 거리 계산 (미터 단위)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // 미터 단위로 반환
  };

  // 카카오 장소 검색을 사용한 화장실 데이터 가져오기
  const fetchToiletData = async (location, kakaoMap) => {
    try {
      console.log('현재 위치:', location);

      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.error('카카오지도 서비스 API가 로드되지 않았습니다.');
        return;
      }

      // 장소 검색 객체 생성
      const ps = new window.kakao.maps.services.Places();

      // 현재 위치 중심으로 화장실 검색 (반경 확대)
      const searchOptions = {
        location: new window.kakao.maps.LatLng(location.lat, location.lng),
        radius: 1000, // 1km 반경으로 확대
        sort: window.kakao.maps.services.SortBy.DISTANCE // 거리순 정렬
      };

      // 개방화장실 키워드로 검색
      const keyword = '개방화장실';
      let allToilets = [];

      // 개방화장실 검색 실행
      await new Promise((resolve) => {
        ps.keywordSearch(keyword, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            console.log(`"${keyword}" 검색 결과:`, data.length, '개');

            // 검색 결과를 화장실 데이터 형식으로 변환
            const toiletData = data.map((place, index) => ({
              id: `${keyword}_${index}`,
              name: place.place_name,
              address: place.road_address_name || place.address_name,
              lat: parseFloat(place.y),
              lng: parseFloat(place.x),
              phone: place.phone || '',
              distance: calculateDistance(location.lat, location.lng, parseFloat(place.y), parseFloat(place.x)),
              isDisabledAccessible: Math.random() > 0.5, // 임시로 랜덤 설정
              is24Hours: Math.random() > 0.7, // 임시로 랜덤 설정
              operatingHours: Math.random() > 0.7 ? '24시간' : '06:00-22:00'
            }));

            allToilets = [...allToilets, ...toiletData];
          } else {
            console.log(`"${keyword}" 검색 실패:`, status);
          }
          resolve();
        }, searchOptions);
      });

      // 중복 제거 (같은 장소가 여러 키워드로 검색될 수 있음)
      const uniqueToilets = allToilets.filter((toilet, index, self) =>
        index === self.findIndex(t => t.name === toilet.name && t.address === toilet.address)
      );

      // 1km 이내 필터링 및 거리순 정렬
      const nearbyToilets = uniqueToilets
        .filter(toilet => toilet.distance <= 1000)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 15); // 최대 15개까지 표시

      console.log(`현재 위치에서 1km 이내 화장실: ${nearbyToilets.length}개`);
      console.log('화장실 데이터:', nearbyToilets);

      // 검색 결과가 없으면 더미 데이터 사용
      if (nearbyToilets.length === 0) {
        console.log('검색 결과가 없어 더미 데이터를 사용합니다.');
        const dummyToilets = [
          {
            id: 'dummy_1',
            name: language === 'ko' ? '근처 공용화장실' : 'Nearby Public Toilet',
            address: language === 'ko' ? '현재 위치 주변' : 'Near current location',
            lat: location.lat + 0.001,
            lng: location.lng + 0.001,
            phone: '',
            distance: Math.round(calculateDistance(location.lat, location.lng, location.lat + 0.001, location.lng + 0.001)),
            isDisabledAccessible: true,
            is24Hours: true,
            operatingHours: language === 'ko' ? '24시간' : '24hrs'
          }
        ];
        setToilets(dummyToilets);
        displayToiletMarkers(dummyToilets, kakaoMap);
      } else {
        setToilets(nearbyToilets);
        displayToiletMarkers(nearbyToilets, kakaoMap);
      }

    } catch (error) {
      console.error('화장실 데이터를 가져오는데 실패했습니다:', error);

      // 에러 발생 시 더미 데이터 사용
      const dummyToilets = [
        {
          id: 'error_dummy',
          name: language === 'ko' ? '근처 공용화장실' : 'Nearby Public Toilet',
          address: language === 'ko' ? '현재 위치 주변' : 'Near current location',
          lat: location.lat + 0.001,
          lng: location.lng + 0.001,
          phone: '',
          distance: 111,
          isDisabledAccessible: true,
          is24Hours: true,
          operatingHours: language === 'ko' ? '24시간' : '24hrs'
        }
      ];
      setToilets(dummyToilets);
      displayToiletMarkers(dummyToilets, kakaoMap);
    }
  };

  // 지도에 화장실 마커 표시
  const displayToiletMarkers = (toiletData, mapInstance) => {
    if (!mapInstance) {
      console.error('지도 인스턴스가 없습니다.');
      return;
    }

    console.log('마커 표시 시작:', toiletData.length, '개');

    toiletData.forEach((toilet, index) => {
      console.log(`마커 ${index + 1} 생성:`, toilet.name, toilet.lat, toilet.lng);

      const markerPosition = new window.kakao.maps.LatLng(toilet.lat, toilet.lng);

      // 화장실 마커 생성 (커스텀 화장실 마커 사용)
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <rect x="4" y="4" width="24" height="24" rx="4" fill="#FF4444" stroke="white" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">WC</text>
        </svg>
      `;

      // UTF-8을 Base64로 안전하게 인코딩
      const base64String = btoa(encodeURIComponent(svgString).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));

      const toiletMarkerImage = new window.kakao.maps.MarkerImage(
        'data:image/svg+xml;base64,' + base64String,
        new window.kakao.maps.Size(32, 32),
        {
          offset: new window.kakao.maps.Point(16, 32)
        }
      );

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: toiletMarkerImage,
        map: mapInstance
      });

      // 마커가 지도 위에 표시되도록 설정
      marker.setMap(mapInstance);

      console.log(`마커 ${index + 1} 생성 완료`);

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:8px;font-size:12px;width:200px;border-radius:8px;">
            <strong style="color:#FF4444;">🚻 ${toilet.name}</strong><br/>
            <span style="color:#666;margin-top:3px;display:block;">${toilet.address}</span><br/>
            <div style="margin-top:5px;">
              <span style="color:#007AFF;font-weight:bold;">${toilet.distance}m</span>
              ${toilet.isDisabledAccessible ? ` <span style="color:#4CAF50;margin-left:8px;">♿ ${language === 'ko' ? '장애인' : 'Disabled'}</span>` : ''}
              ${toilet.is24Hours ? ` <span style="color:#4CAF50;margin-left:8px;">🕐 ${language === 'ko' ? '24시간' : '24hrs'}</span>` : ` <span style="color:#FF9500;margin-left:8px;">🕐 ${language === 'ko' ? toilet.operatingHours : '06:00-22:00'}</span>`}
            </div>
          </div>
        `
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(mapInstance, marker);
      });
    });

    console.log('모든 마커 생성 완료');
  };

  // 필터링된 화장실 목록
  const filteredToilets = toilets.filter(toilet => {
    if (filters.disabled && !toilet.isDisabledAccessible) return false;
    if (filters.allDay && !toilet.is24Hours) return false;
    return true;
  });

  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        borderBottom: '1px solid #e0e0e0',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <button
            onClick={() => navigate('/main')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#333'
            }}
          >
            ←
          </button>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{t.publicToiletMap}</span>
          <div style={{ fontSize: '12px', color: '#007AFF', textAlign: 'right' }}>
            {userLocation && (
              <button
                onClick={() => window.location.reload()}
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  border: '1px solid #007AFF',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#007AFF',
                  cursor: 'pointer'
                }}
              >
                {language === 'ko' ? '위치 새로고침' : 'Refresh Location'}
              </button>
            )}
          </div>
        </div>

        {/* 현재 위치 주소 표시 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#495057',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            📍 {currentAddress}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        padding: '15px 20px',
        borderBottom: '1px solid #eee',
        backgroundColor: 'white',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => toggleFilter('disabled')}
            style={{
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #007AFF',
              backgroundColor: filters.disabled ? '#007AFF' : 'white',
              color: filters.disabled ? 'white' : '#007AFF',
              cursor: 'pointer'
            }}
          >
            {t.disabledToilet}
          </button>
          <button
            onClick={() => toggleFilter('allDay')}
            style={{
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #007AFF',
              backgroundColor: filters.allDay ? '#007AFF' : 'white',
              color: filters.allDay ? 'white' : '#007AFF',
              cursor: 'pointer'
            }}
          >
            {t.available24h}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '15px 20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Map */}
        <div style={{ position: 'relative', marginBottom: '20px', flexShrink: 0 }}>
          <div
            ref={mapContainer}
            style={{
              backgroundColor: '#f0f0f0',
              borderRadius: '12px',
              height: '200px'
            }}
          ></div>

          {/* 내 위치로 돌아가기 버튼 */}
          {userLocation && (
            <button
              onClick={() => {
                if (map && userLocation) {
                  const moveLatLon = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
                  map.setCenter(moveLatLon);
                  map.setLevel(3); // 줌 레벨도 초기화
                  console.log('내 위치로 지도 중심 이동');
                }
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                zIndex: 1000
              }}
              title="내 위치로 이동"
            >
              📍
            </button>
          )}
        </div>

        {/* Toilet List */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', margin: '0 0 15px 0', flexShrink: 0 }}>
            {t.nearestToilet}
          </h3>

          <div style={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px', 
            overflowY: 'auto',
            paddingRight: '5px' // 스크롤바 공간
          }}>
            {filteredToilets.length > 0 ? (
              filteredToilets.map(toilet => (
                <div key={toilet.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  padding: '15px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }} onClick={() => {
                  // 지도에서 해당 화장실 위치로 이동
                  if (map) {
                    const moveLatLon = new window.kakao.maps.LatLng(toilet.lat, toilet.lng);
                    map.setCenter(moveLatLon);
                  }
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '5px', fontSize: '14px' }}>
                        {toilet.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {toilet.address}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#007AFF', fontWeight: '600', fontSize: '14px' }}>
                        {toilet.distance}m
                      </div>
                      <div style={{ fontSize: '11px', display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                        {toilet.is24Hours ? (
                          <span style={{ color: '#4CAF50' }}>{language === 'ko' ? '24시간' : '24hrs'}</span>
                        ) : (
                          <span style={{ color: '#FF9500' }}>{language === 'ko' ? toilet.operatingHours : '06:00-22:00'}</span>
                        )}
                        {toilet.isDisabledAccessible && (
                          <span style={{ color: '#4CAF50' }}>♿</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
                color: '#666'
              }}>
                {language === 'ko' ? '조건에 맞는 화장실이 없습니다.' : 'No toilets match the criteria.'}
              </div>
            )}
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
          onClick={() => navigate('/camera')}
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

export default ToiletPage;
