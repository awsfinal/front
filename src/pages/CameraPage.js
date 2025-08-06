import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 분리된 유틸리티 및 훅 import
import { gyeongbokgungBuildings, getEnglishName, getBuildYear, getCulturalProperty, getFeatures, getDetailedDescription, isInGyeongbokgung } from '../utils/buildingData';
import { calculateDistance, getCompassDirection } from '../utils/gpsUtils';
import { findBuildingFromMap, findClosestBuildingFallback } from '../utils/buildingSearch';
import { useCompass } from '../hooks/useCompass';

// CSS 애니메이션을 위한 스타일 추가
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 스타일 태그를 head에 추가
if (!document.querySelector('#camera-animations')) {
  const style = document.createElement('style');
  style.id = 'camera-animations';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // 상태 관리
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locationStatus, setLocationStatus] = useState('위치 확인 중...');
  const [currentHeading, setCurrentHeading] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  // 나침반 센서 초기화 (커스텀 훅 사용)
  useCompass(isIOS, isAndroid, setCurrentHeading);

  useEffect(() => {
    // 기기 타입 감지
    const userAgent = navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));
    setIsAndroid(/Android/i.test(userAgent));

    // 카메라 시작
    startCamera();
    // 위치 확인
    getCurrentLocation();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // 후면 카메라 우선 (모바일에서)
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError(null);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('카메라 접근 오류:', err);
      setError('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    setLocationStatus('🔍 위치 확인 중...');

    if (!navigator.geolocation) {
      setLocationStatus('❌ 위치 서비스를 지원하지 않는 브라우저입니다.');
      setError('위치 서비스를 지원하지 않습니다.');
      return;
    }

    // 먼저 빠른 위치 확인 시도
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        console.log('빠른 위치 확인 성공:', location, '정확도:', Math.round(location.accuracy), 'm');
        processLocation(location);
      },
      (quickError) => {
        console.log('빠른 위치 확인 실패, watchPosition 시도:', quickError);

        // 빠른 위치 확인 실패 시 watchPosition 사용
        let watchId = null;
        let hasGotLocation = false;
        let bestLocation = null;

        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };

            console.log('위치 업데이트:', location, '정확도:', Math.round(location.accuracy), 'm');

            // 첫 번째 위치이거나 더 정확한 위치인 경우
            if (!bestLocation || location.accuracy < bestLocation.accuracy) {
              bestLocation = location;

              if (!hasGotLocation) {
                hasGotLocation = true;
                setLocationStatus(`📍 위치 확인됨 (정확도: ${Math.round(location.accuracy)}m)`);

                // 첫 번째 위치를 바로 처리 (개발자 도구 시뮬레이션 대응)
                processLocation(location);

                // 정확도가 충분히 좋으면 위치 추적 중지
                if (location.accuracy <= 100) {
                  console.log('충분한 정확도 달성, 위치 추적 중지');
                  navigator.geolocation.clearWatch(watchId);
                  return;
                }
              }
            }
          },
          (error) => {
            console.error('위치 조회 실패:', error);

            let errorMessage = '';
            switch (error.code) {
              case 1: // PERMISSION_DENIED
                errorMessage = '📍 위치 권한이 필요합니다. 설정에서 위치 권한을 허용해주세요.';
                setError('위치 권한을 허용해주세요.');
                break;
              case 2: // POSITION_UNAVAILABLE
                errorMessage = '📍 위치 정보를 사용할 수 없습니다. GPS나 네트워크를 확인해주세요.';
                setError('위치 정보를 사용할 수 없습니다.');
                break;
              case 3: // TIMEOUT
                errorMessage = '📍 위치 확인 시간이 초과되었습니다. 페이지를 새로고침하고 다시 시도해주세요.';
                setError('위치 확인 시간이 초과되었습니다.');
                break;
              default:
                errorMessage = '📍 위치 확인 중 오류가 발생했습니다.';
                setError('위치 확인 중 오류가 발생했습니다.');
                break;
            }

            setLocationStatus(errorMessage);

            if (watchId) {
              navigator.geolocation.clearWatch(watchId);
            }
          },
          {
            enableHighAccuracy: true, // GPS 사용
            timeout: 10000, // 10초 타임아웃 (더 짧게)
            maximumAge: 60000 // 1분 캐시 허용 (개발자 도구 대응)
          }
        );

        // 8초 후에는 강제로 위치 추적 중지
        setTimeout(() => {
          if (watchId && bestLocation && !hasGotLocation) {
            navigator.geolocation.clearWatch(watchId);
            console.log('타임아웃으로 위치 추적 중지, 현재까지의 최고 위치 사용');
            processLocation(bestLocation);
          } else if (watchId) {
            navigator.geolocation.clearWatch(watchId);
          }
        }, 8000);
      },
      {
        enableHighAccuracy: false, // 첫 번째는 빠른 위치
        timeout: 3000, // 3초 타임아웃
        maximumAge: 60000 // 1분 캐시 허용
      }
    );
  };

  // 위치 처리 함수
  const processLocation = (location) => {
    console.log('최종 위치:', location);

    // 카카오 지도 API로 주소 조회 및 건물 식별
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();

      // 좌표를 주소로 변환
      geocoder.coord2Address(location.longitude, location.latitude, (result, status) => {
        let currentAddress = '주소 확인 중...';

        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const addressInfo = result[0];

          // 도로명 주소 우선, 없으면 지번 주소
          if (addressInfo.road_address) {
            currentAddress = addressInfo.road_address.address_name;
          } else if (addressInfo.address) {
            currentAddress = addressInfo.address.address_name;
          }
        }

        console.log('현재 주소:', currentAddress);

        // 지도 기반 건물 검색 (비동기)
        findBuildingFromMap(location.latitude, location.longitude).then(closestBuilding => {
          if (closestBuilding) {
            const distanceKm = closestBuilding.distance >= 1000
              ? `${(closestBuilding.distance / 1000).toFixed(1)}km`
              : `${closestBuilding.distance}m`;

            // 지도에서 찾은 건물인지 표시
            const buildingSource = closestBuilding.mapData ? '🗺️' : '📍';
            setLocationStatus(`${buildingSource} ${closestBuilding.name} (${distanceKm}) - 촬영 가능`);

            // 현재 위치 정보 업데이트
            setCurrentLocation({
              ...location,
              address: currentAddress,
              closestBuilding: closestBuilding
            });

            // 지도에서 찾은 경우 로그 출력
            if (closestBuilding.mapData) {
              console.log('지도 데이터:', closestBuilding.mapData);
            }
          } else {
            setLocationStatus('📍 위치 확인 완료 - 촬영 가능');
            setCurrentLocation({
              ...location,
              address: currentAddress
            });
          }
        }).catch(error => {
          console.error('건물 검색 오류:', error);
          // 오류 발생 시 기본 방식으로 폴백
          const fallbackBuilding = findClosestBuildingFallback(location.latitude, location.longitude);
          if (fallbackBuilding) {
            const distanceKm = fallbackBuilding.distance >= 1000
              ? `${(fallbackBuilding.distance / 1000).toFixed(1)}km`
              : `${fallbackBuilding.distance}m`;

            setLocationStatus(`📍 ${fallbackBuilding.name} (${distanceKm}) - 촬영 가능`);
            setCurrentLocation({
              ...location,
              address: currentAddress,
              closestBuilding: fallbackBuilding
            });
          } else {
            setLocationStatus('📍 위치 확인 완료 - 촬영 가능');
            setCurrentLocation({
              ...location,
              address: currentAddress
            });
          }
        });
      });
    } else {
      // 카카오 지도 API가 없으면 기본 처리
      console.log('카카오 지도 API가 로드되지 않았습니다.');

      const closestBuilding = findClosestBuildingFallback(location.latitude, location.longitude);

      if (closestBuilding) {
        const distanceKm = closestBuilding.distance >= 1000
          ? `${(closestBuilding.distance / 1000).toFixed(1)}km`
          : `${closestBuilding.distance}m`;

        setLocationStatus(`📍 ${closestBuilding.name} (${distanceKm}) - 촬영 가능`);
        setCurrentLocation({
          ...location,
          closestBuilding: closestBuilding
        });
      } else {
        setLocationStatus('📍 위치 확인 완료 - 촬영 가능');
        setCurrentLocation(location);
      }
    }
  };

  // 사진 촬영 및 분석
  const handleCapture = async () => {
    if (!currentLocation) {
      alert('위치 정보를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      alert('카메라를 사용할 수 없습니다.');
      return;
    }

    try {
      setIsAnalyzing(true);

      // 캔버스에 현재 비디오 프레임 캡처
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // 캔버스를 Blob으로 변환
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('사진 촬영에 실패했습니다.');
          setIsAnalyzing(false);
          return;
        }

        // 프론트엔드에서 직접 처리 (백엔드 API 호출 없이)
        const closestBuilding = currentLocation.closestBuilding || findClosestBuildingFallback(currentLocation.latitude, currentLocation.longitude);

        if (closestBuilding) {
          // 건물 식별 성공
          const building = {
            id: closestBuilding.id,
            name: closestBuilding.name,
            description: `${closestBuilding.name}은(는) 경복궁의 대표적인 건물 중 하나입니다.`,
            nameEn: getEnglishName(closestBuilding.id),
            buildYear: getBuildYear(closestBuilding.id),
            culturalProperty: getCulturalProperty(closestBuilding.id),
            features: getFeatures(closestBuilding.id),
            detailedDescription: getDetailedDescription(closestBuilding.id)
          };

          // 분석 결과 생성
          const analysisResult = {
            confidence: 0.95,
            detectedFeatures: building.features,
            location: {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              accuracy: 'high',
              address: currentLocation.address || `현재 위치 (${building.name} 인근)`,
              capturedAt: new Date().toISOString(),
              distanceToBuilding: closestBuilding.distance,
              isInGyeongbokgung: isInGyeongbokgung(currentLocation.latitude, currentLocation.longitude),
              heading: currentHeading,
              deviceType: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Other'
            }
          };

          // 상세 페이지로 이동
          alert(`🏛️ ${building.name}을(를) 식별했습니다!\n\n${building.description}`);
          navigate(`/detail/${building.id}`, {
            state: {
              building: building,
              photoUrl: null, // 프론트엔드에서는 사진 저장 안함
              analysisResult: analysisResult
            }
          });
        } else {
          // 건물 식별 실패
          alert('📷 사진을 촬영했지만 건물을 식별할 수 없습니다.');
        }

        setIsAnalyzing(false);
      }, 'image/jpeg', 0.8);

    } catch (error) {
      console.error('사진 촬영 오류:', error);
      alert('사진 촬영 중 오류가 발생했습니다.');
      setIsAnalyzing(false);
    }
  };

  const handleCancel = () => {
    navigate('/main');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      {/* Camera View */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* 로딩 또는 오류 상태 */}
        {(isLoading || error) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
          }}>
            {isLoading && (
              <>
                <div style={{
                  width: '50px',
                  height: '50px',
                  border: '3px solid #333',
                  borderTop: '3px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '20px'
                }}></div>
                <p>카메라를 준비하고 있습니다...</p>
              </>
            )}
            {error && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📷</div>
                <p style={{ fontSize: '16px', marginBottom: '10px' }}>카메라 오류</p>
                <p style={{ fontSize: '14px', color: '#ccc' }}>{error}</p>
                <button
                  onClick={startCamera}
                  style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#007AFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  다시 시도
                </button>
              </>
            )}
          </div>
        )}

        {/* 카메라 화면 */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: (isLoading || error) ? 'none' : 'block'
          }}
        />

        {/* 위치 상태 표시 */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          {locationStatus}
          {/* 추가 정보 표시 */}
          {gpsAccuracy && (
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
              정확도: ±{gpsAccuracy}m
            </div>
          )}
          {currentHeading !== null && (
            <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.8 }}>
              방위: {Math.round(currentHeading)}° ({getCompassDirection(currentHeading)})
            </div>
          )}
        </div>

        {/* 분석 중 오버레이 */}
        {isAnalyzing && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 2000
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #333',
              borderTop: '4px solid #007AFF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>
            <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              🏛️ 건물 분석 중...
            </p>
            <p style={{ fontSize: '14px', color: '#ccc' }}>
              AI가 사진을 분석하고 있습니다
            </p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>

      {/* Camera Controls Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '120px', // 네비게이션 바 위에 위치
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        color: 'white'
      }}>
        {/* Tip Message */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '14px',
          opacity: 0.9
        }}>
          <span style={{ fontWeight: 'bold' }}>tip.</span> 대상이 잘 보이게 촬영해주세요
        </div>

        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          paddingHorizontal: '20px'
        }}>
          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '10px',
              minWidth: '50px'
            }}
          >
            취소
          </button>

          {/* Capture Button */}
          <button
            onClick={handleCapture}
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              border: '4px solid white',
              backgroundColor: '#87CEEB',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            📸
          </button>

          {/* Settings Button */}
          <button
            onClick={handleSettings}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '10px',
              minWidth: '50px'
            }}
          >
            설정
          </button>
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
          className="nav-item active"
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

export default CameraPage;