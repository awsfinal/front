import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();
  const [nearbyHeritage, setNearbyHeritage] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('위치 확인 중...');
  const [locationError, setLocationError] = useState(null);

  // 주요 문화재 데이터 (큰 문화재들만)
  const majorHeritageData = [
    {
      id: 'gyeongbokgung',
      name: '경복궁',
      nameEn: 'Gyeongbokgung Palace',
      location: '서울시 종로구 사직로 161',
      coordinates: { lat: 37.5788, lng: 126.9770 },
      culturalProperty: '사적 제117호',
      description: '조선왕조 제일의 법궁',
      image: '/heritage/gyeonghoeru.jpg', // 경복궁 대표 이미지로 경회루 사용
      category: 'palace'
    },
    {
      id: 'changdeokgung',
      name: '창덕궁',
      nameEn: 'Changdeokgung Palace',
      location: '서울시 종로구 율곡로 99',
      coordinates: { lat: 37.5794, lng: 126.9910 },
      culturalProperty: '사적 제122호 (유네스코 세계문화유산)',
      description: '조선왕조의 이궁, 유네스코 세계문화유산',
      image: '/heritage/changdeokgung.jpg',
      category: 'palace'
    },
    {
      id: 'deoksugung',
      name: '덕수궁',
      nameEn: 'Deoksugung Palace',
      location: '서울시 중구 세종대로 99',
      coordinates: { lat: 37.5658, lng: 126.9751 },
      culturalProperty: '사적 제124호',
      description: '대한제국의 황궁',
      image: '/heritage/deoksugung.jpg',
      category: 'palace'
    },
    {
      id: 'changgyeonggung',
      name: '창경궁',
      nameEn: 'Changgyeonggung Palace',
      location: '서울시 종로구 창경궁로 185',
      coordinates: { lat: 37.5792, lng: 126.9950 },
      culturalProperty: '사적 제123호',
      description: '조선왕조의 이궁',
      image: '/heritage/changgyeonggung.jpg',
      category: 'palace'
    },
    {
      id: 'jongmyo',
      name: '종묘',
      nameEn: 'Jongmyo Shrine',
      location: '서울시 종로구 종로 157',
      coordinates: { lat: 37.5744, lng: 126.9944 },
      culturalProperty: '사적 제125호 (유네스코 세계문화유산)',
      description: '조선왕조 왕과 왕비의 신주를 모신 사당',
      image: '/heritage/jongmyo.jpg',
      category: 'shrine'
    },
    {
      id: 'namdaemun',
      name: '숭례문 (남대문)',
      nameEn: 'Sungnyemun Gate',
      location: '서울시 중구 세종대로 40',
      coordinates: { lat: 37.5597, lng: 126.9756 },
      culturalProperty: '국보 제1호',
      description: '서울 성곽의 정문',
      image: '/heritage/namdaemun.jpg',
      category: 'gate'
    },
    {
      id: 'dongdaemun',
      name: '흥인지문 (동대문)',
      nameEn: 'Heunginjimun Gate',
      location: '서울시 종로구 종로 288',
      coordinates: { lat: 37.5711, lng: 126.9946 },
      culturalProperty: '보물 제1호',
      description: '서울 성곽의 동문',
      image: '/heritage/dongdaemun.jpg',
      category: 'gate'
    },
    {
      id: 'bulguksa',
      name: '불국사',
      nameEn: 'Bulguksa Temple',
      location: '경북 경주시 불국로 385',
      coordinates: { lat: 35.7898, lng: 129.3320 },
      culturalProperty: '사적 제502호 (유네스코 세계문화유산)',
      description: '신라 불교 예술의 걸작',
      image: '/heritage/bulguksa.jpg',
      category: 'temple'
    },
    {
      id: 'seokguram',
      name: '석굴암',
      nameEn: 'Seokguram Grotto',
      location: '경북 경주시 진현동 999',
      coordinates: { lat: 35.7948, lng: 129.3469 },
      culturalProperty: '국보 제24호 (유네스코 세계문화유산)',
      description: '신라 석굴 예술의 최고봉',
      image: '/heritage/seokguram.jpg',
      category: 'temple'
    },
    {
      id: 'haeinsa',
      name: '해인사',
      nameEn: 'Haeinsa Temple',
      location: '경남 합천군 가야면 해인사길 122',
      coordinates: { lat: 35.8014, lng: 128.0981 },
      culturalProperty: '유네스코 세계문화유산',
      description: '팔만대장경을 보관한 사찰',
      image: '/heritage/haeinsa.jpg',
      category: 'temple'
    }
  ];

  useEffect(() => {
    getCurrentLocationAndFindNearby();
  }, []);

  // 카카오 지도 API로 주소 가져오기
  const getAddressFromCoordinates = (lat, lng) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.coord2Address(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const addressInfo = result[0];
          let address = '주소 확인 중...';

          // 도로명 주소 우선, 없으면 지번 주소
          if (addressInfo.road_address) {
            address = addressInfo.road_address.address_name;
          } else if (addressInfo.address) {
            address = addressInfo.address.address_name;
          }

          console.log('현재 주소:', address);
          setCurrentAddress(address);
        } else {
          console.log('주소 변환 실패');
          setCurrentAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });
    } else {
      console.log('카카오 지도 API가 로드되지 않았습니다.');
      setCurrentAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  // 현재 위치 가져오기 및 가까운 문화재 찾기
  const getCurrentLocationAndFindNearby = () => {
    setCurrentAddress('위치 확인 중...');

    if (!navigator.geolocation) {
      setLocationError('위치 서비스를 지원하지 않는 브라우저입니다.');
      // 기본 위치 (서울 시청) 사용
      const defaultLocation = { lat: 37.5665, lng: 126.9780 };
      setCurrentLocation(defaultLocation);
      getAddressFromCoordinates(defaultLocation.lat, defaultLocation.lng);
      findNearbyHeritage(defaultLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('현재 위치:', location);
        setCurrentLocation(location);
        setLocationError(null);

        // 주소 가져오기
        getAddressFromCoordinates(location.lat, location.lng);

        // 가까운 문화재 찾기
        findNearbyHeritage(location);
      },
      (error) => {
        console.error('위치 조회 실패:', error);
        setLocationError('위치 정보를 가져올 수 없습니다.');

        // 기본 위치 (서울 시청) 사용
        const defaultLocation = { lat: 37.5665, lng: 126.9780 };
        setCurrentLocation(defaultLocation);
        getAddressFromCoordinates(defaultLocation.lat, defaultLocation.lng);
        findNearbyHeritage(defaultLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분 캐시
      }
    );
  };

  // 두 좌표 간의 거리 계산 (km 단위)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
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

  // 카카오 Places API로 장소 사진 검색
  const searchPlaceImages = async (heritage) => {
    return new Promise((resolve) => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        const places = new window.kakao.maps.services.Places();

        // 문화재 이름으로 검색
        places.keywordSearch(heritage.name, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
            const place = result[0];
            console.log(`${heritage.name} 검색 결과:`, place);

            // 카카오에서 제공하는 장소 정보가 있으면 사용
            if (place.place_url) {
              // 실제로는 카카오 API에서 직접 이미지를 제공하지 않으므로
              // 대신 구글 이미지나 다른 방법을 사용해야 합니다
              resolve({
                ...heritage,
                kakaoPlaceId: place.id,
                kakaoPlaceUrl: place.place_url,
                phone: place.phone || '',
                categoryName: place.category_name || ''
              });
            } else {
              resolve(heritage);
            }
          } else {
            console.log(`${heritage.name} 검색 결과 없음`);
            resolve(heritage);
          }
        }, {
          location: new window.kakao.maps.LatLng(heritage.coordinates.lat, heritage.coordinates.lng),
          radius: 1000 // 1km 반경 내에서 검색
        });
      } else {
        resolve(heritage);
      }
    });
  };

  // 구글 이미지 검색 API 대안 (실제로는 서버에서 처리해야 함)
  const getHeritageImageUrl = (heritage) => {
    // 기존 이미지가 있으면 사용
    const existingImages = {
      'gyeongbokgung': '/heritage/gyeonghoeru.jpg',
      'changdeokgung': '/heritage/changdeokgung.jpg',
      'deoksugung': '/heritage/deoksugung.jpg',
      'jongmyo': '/heritage/jongmyo.jpg',
      'namdaemun': '/heritage/namdaemun.jpg',
      'dongdaemun': '/heritage/dongdaemun.jpg'
    };

    if (existingImages[heritage.id]) {
      return existingImages[heritage.id];
    }

    // 위키미디어 Commons API를 사용한 이미지 검색 (무료)
    // 실제로는 서버에서 처리하는 것이 좋습니다
    return `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(heritage.name)}&pithumbsize=300&origin=*`;
  };

  // 위키미디어에서 이미지 가져오기
  const fetchWikimediaImage = async (heritage) => {
    try {
      const response = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(heritage.name)}&pithumbsize=300&origin=*`
      );
      const data = await response.json();
      const pages = data.query?.pages;

      if (pages) {
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        if (page.thumbnail?.source) {
          console.log(`${heritage.name} 위키미디어 이미지 찾음:`, page.thumbnail.source);
          return page.thumbnail.source;
        }
      }
    } catch (error) {
      console.log(`${heritage.name} 위키미디어 이미지 검색 실패:`, error);
    }
    return null;
  };

  // 위키피디아 이미지 가져오기 (개선된 버전)
  const fetchWikipediaImage = async (heritage) => {
    try {
      const title = encodeURIComponent(heritage.name);
      const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=thumbnail|original&pithumbsize=300&pilicense=any&origin=*&titles=${title}`;

      console.log(`🔍 ${heritage.name} 위키피디아 이미지 검색 중...`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      const pages = json.query?.pages;

      if (pages && pages.length > 0) {
        const page = pages[0];
        const thumbnailUrl = page.thumbnail?.source;
        const originalUrl = page.original?.source;

        if (thumbnailUrl) {
          console.log(`✅ ${heritage.name} 위키피디아 이미지 찾음:`, thumbnailUrl);
          return thumbnailUrl;
        } else if (originalUrl) {
          console.log(`✅ ${heritage.name} 위키피디아 원본 이미지 찾음:`, originalUrl);
          return originalUrl;
        }
      }

      console.log(`❌ ${heritage.name} 위키피디아 이미지 없음`);
      return null;
    } catch (error) {
      console.error(`❌ ${heritage.name} 위키피디아 이미지 검색 실패:`, error);
      return null;
    }
  };

  // 기본 이미지 매핑 (로컬 이미지 우선 사용)
  const getHeritageImage = (heritage) => {
    const imageMap = {
      'gyeongbokgung': '/heritage/gyeonghoeru.jpg',
      'changdeokgung': '/heritage/changdeokgung.jpg',
      'deoksugung': '/heritage/deoksugung.jpg',
      'changgyeonggung': '/heritage/changgyeonggung.jpg',
      'jongmyo': '/heritage/jongmyo.jpg',
      'namdaemun': '/heritage/namdaemun.jpg',
      'dongdaemun': '/heritage/dongdaemun.jpg',
      'bulguksa': '/heritage/bulguksa.jpg',
      'seokguram': '/heritage/seokguram.jpg',
      'haeinsa': '/heritage/haeinsa.jpg'
    };

    // 기존 이미지가 있으면 사용
    if (heritage.image && heritage.image !== '/heritage/default.jpg') {
      return heritage.image;
    }

    // 매핑된 이미지가 있으면 사용
    if (imageMap[heritage.id]) {
      return imageMap[heritage.id];
    }

    // 기본 이미지 사용
    return '/heritage/default.jpg';
  };



  // 가까운 문화재 찾기 (기본 이미지만 사용)
  const findNearbyHeritage = (userLocation) => {
    const heritageWithDistance = majorHeritageData.map(heritage => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        heritage.coordinates.lat,
        heritage.coordinates.lng
      );

      return {
        ...heritage,
        distance: distance,
        formattedDistance: formatDistance(distance),
        image: getHeritageImage(heritage) // 기본 이미지 사용
      };
    });

    // 거리순으로 정렬하고 가장 가까운 3개만 선택
    const sortedHeritage = heritageWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    console.log('가까운 문화재 3곳:', sortedHeritage);
    setNearbyHeritage(sortedHeritage);
  };

  // 새로고침 버튼
  const handleRefreshLocation = () => {
    setLocationError(null);
    setNearbyHeritage([]);
    getCurrentLocationAndFindNearby();
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
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

        {/* Nearby Heritage */}
        <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '15px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
              📍 가까운 문화재
            </h2>
            <button
              onClick={handleRefreshLocation}
              style={{
                background: 'none',
                border: '1px solid #007AFF',
                borderRadius: '15px',
                padding: '4px 12px',
                fontSize: '12px',
                color: '#007AFF',
                cursor: 'pointer'
              }}
            >
              🔄 새로고침
            </button>
          </div>

          {/* 위치 상태 표시 */}
          {locationError && (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '15px',
              fontSize: '12px',
              color: '#856404'
            }}>
              ⚠️ {locationError} (기본 위치 사용 중)
            </div>
          )}

          {currentLocation && !locationError && (
            <div style={{
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '15px',
              fontSize: '12px',
              color: '#155724'
            }}>
              ✅ 현재 위치: {currentAddress}
            </div>
          )}

          {/* 문화재 목록 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflow: 'auto',
            maxHeight: 'calc(100vh - 320px)', // 화면 높이에 맞춰 최대 높이 설정 (더 많은 공간)
            paddingRight: '4px', // 스크롤바 공간
            scrollbarWidth: 'thin', // Firefox용 얇은 스크롤바
            scrollbarColor: '#c1c1c1 transparent' // Firefox용 스크롤바 색상
          }}>
            {nearbyHeritage.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
                <p style={{ margin: 0, fontSize: '14px' }}>가까운 문화재를 찾고 있습니다...</p>
              </div>
            ) : (
              nearbyHeritage.map((heritage, index) => (
                <div
                  key={heritage.id}
                  style={{
                    background: index === 0 ? '#e8f5e8' : '#faf3f3',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    gap: '12px',
                    cursor: 'pointer',
                    border: index === 0 ? '2px solid #28a745' : 'none'
                  }}
                  onClick={() => navigate(`/heritage/${heritage.id}`)}
                >
                  {/* Left Image */}
                  <div style={{ flexShrink: 0, position: 'relative' }}>
                    <img
                      src={heritage.image}
                      alt={heritage.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      onError={(e) => {
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
                        fontSize: '24px',
                        borderRadius: '8px'
                      }}
                    >
                      🏛️
                    </div>
                    {/* 순위 표시 */}
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      left: '-5px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: index === 0 ? '#28a745' : index === 1 ? '#ffc107' : '#6c757d',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Right Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '3px',
                      color: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {heritage.name}
                      {index === 0 && <span style={{ fontSize: '12px' }}>🏆</span>}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#666',
                      marginBottom: '2px'
                    }}>
                      📍 {heritage.location}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#666',
                      marginBottom: '3px'
                    }}>
                      🏛️ {heritage.culturalProperty}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: index === 0 ? '#28a745' : '#007AFF',
                      fontWeight: '600'
                    }}>
                      📏 현재 위치에서 {heritage.formattedDistance}
                    </div>
                  </div>
                </div>
              ))
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
          <span>스탬프</span>
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
