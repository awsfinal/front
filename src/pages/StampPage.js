import React from 'react';
import { useNavigate } from 'react-router-dom';

function StampPage() {
  const navigate = useNavigate();

  const stampData = [
    { 
      id: 1, 
      name: '경회루', 
      collected: true, 
      image: '/heritage/gyeonghoeru.jpg',
      position: { top: '35%', left: '45%' } // 서울 북부
    },
    { 
      id: 2, 
      name: '광화문', 
      collected: false, 
      image: '/heritage/gwanghwamun.jpg',
      position: { top: '60%', left: '70%' } // 경상도 지역
    },
    { 
      id: 3, 
      name: '민속박물관', 
      collected: true, 
      image: '/heritage/folk_museum.jpg',
      position: { top: '75%', left: '25%' } // 전라도 지역
    }
  ];

  const collectedCount = stampData.filter(stamp => stamp.collected).length;

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0
      }}>
        <button 
          onClick={() => navigate('/main')}
          style={{
            position: 'absolute',
            left: '20px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#333'
          }}
        >
          ←
        </button>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>스탬프 수집</span>
      </div>

      {/* Progress */}
      <div style={{ 
        padding: '15px 20px', 
        textAlign: 'center', 
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        flexShrink: 0
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
          {collectedCount} / {stampData.length}
        </div>
        <div style={{ color: '#666', marginBottom: '10px', fontSize: '14px' }}>
          수집한 스탬프
        </div>
        <div style={{ 
          width: '100%', 
          height: '6px', 
          background: '#e0e0e0', 
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${(collectedCount / stampData.length) * 100}%`,
            height: '100%',
            background: '#4CAF50',
            transition: 'width 0.3s'
          }}></div>
        </div>
      </div>

      {/* Map with Stamps */}
      <div style={{ 
        flex: 1,
        padding: '15px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          position: 'relative',
          flex: 1,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: 'white'
        }}>
          {/* Background Map */}
          <img 
            src="/image/korea_map.png" 
            alt="한국 지도"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
            onError={(e) => {
              e.target.style.background = '#f0f0f0';
              e.target.style.display = 'flex';
              e.target.style.alignItems = 'center';
              e.target.style.justifyContent = 'center';
              e.target.innerHTML = '지도 로딩 중...';
            }}
          />

          {/* Stamps positioned on map */}
          {stampData.map(stamp => (
            <div 
              key={stamp.id}
              style={{
                position: 'absolute',
                top: stamp.position.top,
                left: stamp.position.left,
                transform: 'translate(-50%, -50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: stamp.collected ? '3px solid #4CAF50' : '3px solid #ccc',
                overflow: 'hidden',
                cursor: stamp.collected ? 'pointer' : 'default',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                background: stamp.collected ? 'white' : '#f0f0f0'
              }}
              onClick={() => stamp.collected && navigate(`/detail/${stamp.id}`)}
            >
              {stamp.collected && stamp.image ? (
                <img 
                  src={stamp.image} 
                  alt={stamp.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {stamp.collected && stamp.image ? (
                <div 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: '#4CAF50',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ✓
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stamp.collected ? '#4CAF50' : '#999',
                  fontSize: stamp.collected ? '14px' : '12px',
                  fontWeight: 'bold'
                }}>
                  {stamp.collected ? '✓' : '📷'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={{ 
          textAlign: 'center', 
          color: '#666',
          marginTop: '15px',
          flexShrink: 0
        }}>
          <p style={{ fontSize: '12px', lineHeight: '1.4', margin: 0 }}>
            문화재를 촬영하면 지도에 스탬프가 활성화됩니다<br/>
            수집한 스탬프를 터치하면 상세 정보를 볼 수 있어요
          </p>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="nav-bar">
        <div 
          className="nav-item active"
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

export default StampPage;
