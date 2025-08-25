import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations, getLanguage } from '../utils/translations';

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
  const [currentGPS, setCurrentGPS] = useState(null);
  const [gpsReadings, setGpsReadings] = useState([]);
  const [isInitialGPSComplete, setIsInitialGPSComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locationStatus, setLocationStatus] = useState('위치 확인 중...');
  const [currentHeading, setCurrentHeading] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [language, setLanguage] = useState('ko');
  
  const t = translations[language];
  

  // 나침반 센서 초기화 (커스텀 훅 사용)
  useCompass(isIOS, isAndroid, setCurrentHeading);

  useEffect(() => {
    // 기기 타입 감지
    const userAgent = navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));
    setIsAndroid(/Android/i.test(userAgent));
    
    // 언어 설정 가져오기
    const savedLanguage = getLanguage();
    setLanguage(savedLanguage);

    // 카메라 시작
    startCamera();
    
    // GPS 초기화 (즉시 기본값 설정하여 버튼 활성화)
    console.log('🔍 카메라 페이지 GPS 초기화 시작...');
    
    // 즉시 기본 위치 설정하여 촬영 버튼 활성화
    const defaultGPS = {
      latitude: 37.5788,
      longitude: 126.9770,
      accuracy: 100,
      timestamp: new Date().toISOString(),
      isDefault: true
    };
    
    setCurrentGPS(defaultGPS);
    setIsInitialGPSComplete(true);
    setLocationStatus('📍 기본 위치 사용 (경복궁)');
    console.log('✅ 기본 위치 즉시 설정 - 촬영 버튼 활성화:', defaultGPS);
    
    // 강제로 촬영 버튼 활성화 확인 (여러 번 시도)
    const ensureButtonActive = () => {
      setTimeout(() => {
        console.log('🔄 촬영 버튼 활성화 상태 확인:', isInitialGPSComplete);
        if (!isInitialGPSComplete) {
          console.log('⚠️ GPS 초기화 재시도');
          setIsInitialGPSComplete(true);
          setCurrentGPS(defaultGPS);
        }
      }, 500);
      
      setTimeout(() => {
        setIsInitialGPSComplete(true);
        console.log('🔄 촬영 버튼 강제 활성화');
      }, 1500);
    };
    
    ensureButtonActive();
    
    // 백그라운드에서 더 정확한 GPS 시도
    setTimeout(() => {
      initializeGPS();
    }, 2000);

    return () => {
      stopCamera();
    };
  }, []);

  // GPS 초기화 함수
  const initializeGPS = () => {
    console.log('🔍 GPS 초기화 시작...');
    
    // 1. MainPage GPS 데이터 확인
    const mainPageGPS = localStorage.getItem('mainPageGPS');
    if (mainPageGPS) {
      try {
        const gpsData = JSON.parse(mainPageGPS);
        if (gpsData.latitude && gpsData.longitude) {
          setCurrentGPS(gpsData);
          setIsInitialGPSComplete(true);
          setLocationStatus('');
          console.log('✅ MainPage GPS 데이터 사용:', gpsData);
          return;
        }
      } catch (error) {
        console.warn('⚠️ MainPage GPS 데이터 파싱 실패:', error);
      }
    }

    // 2. CameraPage GPS 데이터 확인
    const cameraPageGPS = localStorage.getItem('cameraPageGPS');
    if (cameraPageGPS) {
      try {
        const gpsData = JSON.parse(cameraPageGPS);
        if (gpsData.latitude && gpsData.longitude) {
          setCurrentGPS(gpsData);
          setIsInitialGPSComplete(true);
          setLocationStatus('');
          console.log('✅ CameraPage GPS 데이터 사용:', gpsData);
          return;
        }
      } catch (error) {
        console.warn('⚠️ CameraPage GPS 데이터 파싱 실패:', error);
      }
    }

    // 3. 기본 위치 즉시 설정 (경복궁)
    console.log('⚠️ 저장된 GPS 데이터 없음. 기본 위치 사용...');
    const defaultGPS = {
      latitude: 37.5788,
      longitude: 126.9770,
      accuracy: 100,
      timestamp: new Date().toISOString(),
      isDefault: true
    };
    
    setCurrentGPS(defaultGPS);
    setIsInitialGPSComplete(true);
    setLocationStatus('📍 기본 위치 사용 (경복궁)');
    console.log('✅ 기본 위치 설정 완료:', defaultGPS);

    // 4. 백그라운드에서 실제 GPS 획득 시도
    setTimeout(() => {
      getCurrentLocation();
    }, 1000);
  };

  // 직접 GPS 위치 획득
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('❌ GPS를 지원하지 않는 기기입니다');
      return;
    }

    setLocationStatus('📍 GPS 위치 확인 중...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gpsData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        
        setCurrentGPS(gpsData);
        setIsInitialGPSComplete(true);
        setLocationStatus('');
        console.log('✅ 직접 GPS 획득 완료:', gpsData);
        
        // localStorage에 저장
        localStorage.setItem('cameraPageGPS', JSON.stringify(gpsData));
      },
      (error) => {
        console.error('❌ GPS 획득 실패:', error);
        setLocationStatus('❌ GPS 위치를 확인할 수 없습니다');
        
        // 기본 위치 사용 (경복궁)
        const defaultGPS = {
          latitude: 37.5788,
          longitude: 126.9770,
          accuracy: 100,
          timestamp: new Date().toISOString(),
          isDefault: true
        };
        
        setCurrentGPS(defaultGPS);
        setIsInitialGPSComplete(true);
        setLocationStatus('📍 기본 위치 사용 (경복궁)');
        console.log('⚠️ 기본 위치 사용:', defaultGPS);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };



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

  const [gpsInterval, setGpsInterval] = useState(null);

  // GPS 체크 중지
  const stopGPSTracking = () => {
    if (gpsInterval) {
      clearInterval(gpsInterval);
      setGpsInterval(null);
    }
  };

  // 백엔드로 GPS 데이터 전송 (휴대폰 대응)
  const sendGPSToBackend = async (gpsData) => {
    try {
      // 여러 IP 주소 시도 (실제 PC IP로 변경 필요)
      const possibleIPs = [
        '192.168.0.100',  // 일반적인 공유기 IP 대역
        '192.168.1.100',  // 다른 일반적인 IP 대역
        '10.0.0.100',     // 또 다른 사설 IP 대역
        window.location.hostname,
        'localhost',
        '127.0.0.1'
      ];
      
      console.log('📱 휴대폰에서 백엔드 연결 시도...');
      console.log('📍 전송할 GPS 데이터:', JSON.stringify(gpsData, null, 2));
      
      for (const ip of possibleIPs) {
        const url = `http://${ip}:5003/api/gps`;
        try {
          console.log(`🔗 시도 중: ${url}`);
          
          const response = await fetch(url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(gpsData)
          });
          
          console.log(`📶 ${url} 응답 상태:`, response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ 백엔드 전송 성공:', result);
            return result;
          } else {
            const errorText = await response.text();
            console.warn(`⚠️ ${url} 오류 응답:`, errorText);
          }
        } catch (error) {
          console.warn(`❌ ${url} 연결 실패:`, error.name, error.message);
        }
      }
      
      console.error('❌ 모든 백엔드 URL 연결 실패');
      console.log('📝 백엔드 서버가 실행 중인지 확인하고, PC의 실제 IP 주소를 possibleIPs 배열에 추가하세요.');
      
    } catch (error) {
      console.error('❌ 백엔드 전송 오류:', error);
    }
  };

  // 사진 촬영 및 분석
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    try {
      setIsAnalyzing(true);
      
      console.log('📸 촬영 버튼 클릭');
      
      console.log('📸 사진 촬영 시작');

      // 캔버스에 현재 비디오 프레임 캡처
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // 2초 후 자연스럽게 경회루 페이지로 이동
      setTimeout(() => {
        console.log('📍 DetailPage로 전달할 GPS 데이터:', currentGPS);
        console.log('🚫 DetailPage 이동 - GPS 업데이트 중지');
        stopGPSTracking();
        setIsAnalyzing(false);
        navigate('/detail/gyeonghoeru', { state: { gpsData: currentGPS } });
      }, 2000);

    } catch (error) {
      console.error('사진 촬영 오류:', error);
      setIsAnalyzing(false);
    }
  };

  const handleCancel = () => {
    navigate('/main');
  };

  const handleRetake = async () => {
    console.log('🔄 재촬영 - 상태 초기화');
    
    setIsAnalyzing(false);
    setError(null);
    
    // MainPage GPS 데이터 다시 로드
    const savedGPS = localStorage.getItem('mainPageGPS');
    if (savedGPS) {
      const gpsData = JSON.parse(savedGPS);
      setCurrentGPS(gpsData);
      setIsInitialGPSComplete(true);
      setLocationStatus(''); // 상태 메시지 숨김
    }
    
    await startCamera();
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#000',
      position: 'fixed',
      width: '100%',
      top: 0,
      left: 0
    }}>
      {/* Camera View */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* 로딩 상태 */}
        {isLoading && (
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
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #333',
              borderTop: '3px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>
            <p>{t.preparingCamera}</p>
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
            display: isLoading ? 'none' : 'block'
          }}
        />

        {/* 위치 상태 표시 */}
        {locationStatus && (
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
            {currentHeading !== null && (
              <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.8 }}>
                {t.direction}: {Math.round(currentHeading)}° ({getCompassDirection(currentHeading)})
              </div>
            )}
          </div>
        )}

        {/* 분석 중 오버레이 */}
        {isAnalyzing && (
          <div style={{
            position: 'fixed',
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
            zIndex: 2000,
            overflow: 'hidden'
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
              🏛️ {t.recognizingHeritage}
            </p>
            <p style={{ fontSize: '14px', color: '#ccc' }}>
              {t.pleaseWait}
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
        bottom: '60px',
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        color: 'white'
      }}>
        {/* Tip Message */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '14px',
          opacity: 0.9,
          padding: '0 20px'
        }}>
          <span style={{ fontWeight: 'bold' }}>tip.</span> {!isInitialGPSComplete ? t.tipGpsMeasuring : isIOS ? t.tipIOS : isAndroid ? t.tipAndroid : t.tipDefault}
        </div>

        {/* Control Buttons - 네비게이션 바와 일직선 정렬 */}
        <div style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '70px',
          alignItems: 'center'
        }}>
          {/* Cancel Button - 스탬프와 일직선 */}
          <button
            onClick={handleCancel}
            style={{
              position: 'absolute',
              left: language === 'en' ? 'calc(16.67% - 29px)' : 'calc(16.67% - 25px)',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '10px',
              width: '50px',
              textAlign: 'center',
              transform: 'translateY(-10px)'
            }}
          >
            {t.cancel}
          </button>

          {/* Capture Button - 사진찍기와 일직선 */}
          <button
            onClick={handleCapture}
            disabled={!isInitialGPSComplete}
            style={{
              position: 'absolute',
              left: language === 'en' ? 'calc(50% - 38px)' : 'calc(50% - 34px)',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              border: '4px solid white',
              backgroundColor: isInitialGPSComplete ? '#87CEEB' : '#ccc',
              cursor: isInitialGPSComplete ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              opacity: isInitialGPSComplete ? 1 : 0.5,
              transform: 'translateY(-10px)'
            }}
          >
            📸
          </button>

          {/* Retake Button - 설정과 일직선 */}
          <button
            onClick={handleRetake}
            style={{
              position: 'absolute',
              right: 'calc(16.67% - 30px)',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '10px 5px',
              width: '60px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              transform: 'translateY(-10px)'
            }}
          >
            {t.retake}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="nav-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '414px',
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0'
      }}>
        <div
          className="nav-item"
          onClick={() => navigate('/stamp')}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="nav-icon"
            style={{ backgroundImage: 'url(/image/rubber-stamp.png)' }}
          ></div>
          <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{language === 'ko' ? '찍고갈래' : 'go & take'}</span>
        </div>
        <div
          className="nav-item active"
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

export default CameraPage;