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
  const [currentGPS, setCurrentGPS] = useState(null);
  const [gpsReadings, setGpsReadings] = useState([]);
  const [isInitialGPSComplete, setIsInitialGPSComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locationStatus, setLocationStatus] = useState('위치 확인 중...');
  const [currentHeading, setCurrentHeading] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  

  // 나침반 센서 초기화 (커스텀 훅 사용)
  useCompass(isIOS, isAndroid, setCurrentHeading);

  useEffect(() => {
    // 기기 타입 감지
    const userAgent = navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));
    setIsAndroid(/Android/i.test(userAgent));

    // 카메라 시작
    startCamera();
    
    // MainPage에서 GPS 데이터 가져오기
    const savedGPS = localStorage.getItem('mainPageGPS');
    if (savedGPS) {
      const gpsData = JSON.parse(savedGPS);
      setCurrentGPS(gpsData);
      setIsInitialGPSComplete(true);
      setLocationStatus(''); // 상태 메시지 숨김
    } else {
      setLocationStatus('❌ GPS 데이터가 없습니다. 메인페이지로 돌아가세요.');
    }

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
            <p>카메라를 준비하고 있습니다...</p>
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
                방위: {Math.round(currentHeading)}° ({getCompassDirection(currentHeading)})
              </div>
            )}
          </div>
        )}

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
              🏛️ 문화재 인식 중...
            </p>
            <p style={{ fontSize: '14px', color: '#ccc' }}>
              잠시만 기다려주세요
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
          <span style={{ fontWeight: 'bold' }}>tip.</span> {!isInitialGPSComplete ? 'GPS 평균 좌표 측정 중입니다...' : isIOS ? 'GPS 정확도를 위해 실외에서 촬영하세요' : isAndroid ? '위치 권한을 허용하고 실외에서 촬영하세요' : '대상이 잘 보이게 촬영해주세요'}
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
              left: 'calc(16.67% - 25px)', // 스탬프 중심과 일치
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '10px',
              width: '50px',
              textAlign: 'center',
              transform: 'translateY(-10px)' // 10px 위로 이동
            }}
          >
            취소
          </button>

          {/* Capture Button - 사진찍기와 일직선 */}
          <button
            onClick={handleCapture}
            disabled={!isInitialGPSComplete}
            style={{
              position: 'absolute',
              left: 'calc(50% - 33px)', // 사진찍기 중심과 일치 + 2px 오른쪽
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
              transform: 'translateY(-10px)' // 10px 위로 이동
            }}
          >
            📸
          </button>

          {/* Retake Button - 설정과 일직선 */}
          <button
            onClick={handleRetake}
            style={{
              position: 'absolute',
              right: 'calc(16.67% - 30px)', // 설정 중심과 일치
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '16px', // 취소와 동일한 폰트 크기
              cursor: 'pointer',
              padding: '10px 5px',
              width: '60px',
              textAlign: 'center',
              whiteSpace: 'nowrap', // 줄바꿈 방지
              transform: 'translateY(-10px)' // 10px 위로 이동
            }}
          >
            재촬영
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