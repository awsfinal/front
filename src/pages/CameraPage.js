import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // 카메라 연동 비활성화
  const [error, setError] = useState(null);

  useEffect(() => {
    // 카메라 연동 일시 비활성화
    // startCamera();
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

  const handleCapture = () => {
    // 카메라 연동 비활성화 상태에서는 시뮬레이션
    console.log('촬영 시뮬레이션');
    alert('사진이 촬영되었습니다! AI가 문화재를 분석 중입니다...');
    
    // 예시로 경회루 상세 페이지로 이동
    navigate('/detail/gyeonghoeru');
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
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'none' // 카메라 연동 비활성화
          }}
        />

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
          gap: '60px', // 간격을 좁힘 (기존 space-between에서 center + gap으로 변경)
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
              backgroundColor: '#87CEEB', // 연한 하늘색 (3.png와 유사)
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
