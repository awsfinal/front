import React from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();

  const heritageData = [
    {
      id: 'gyeonghoeru',
      name: '경회루',
      location: '서울시 종로구 사직로 161',
      distance: '0.5km',
      image: '/heritage/gyeonghoeru.jpg'
    },
    {
      id: 'gwanghwamun',
      name: '광화문',
      location: '서울시 종로구 세종로',
      distance: '1.2km',
      image: '/heritage/gwanghwamun.jpg'
    },
    {
      id: 'folk_museum',
      name: '민속박물관',
      location: '서울시 종로구 삼청로 37',
      distance: '2.1km',
      image: '/heritage/folk_museum.jpg'
    }
  ];

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

        {/* Tourism News */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', margin: '0 0 20px 0' }}>
            관광지 소식
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                    📍 {heritage.location}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#007AFF',
                    fontWeight: '500'
                  }}>
                    현재 위치에서 {heritage.distance}
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
