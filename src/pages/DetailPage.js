import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const heritageDetails = {
    gyeonghoeru: {
      name: '경회루',
      image: '/heritage/gyeonghoeru.jpg',
      location: '서울특별시 종로구 사직로 161',
      hours: '09:00 - 18:00 (월요일 휴관)',
      phone: '02-3700-3900',
      fee: '성인 3,000원, 청소년 1,500원',
      description: '경회루는 조선시대 경복궁 내에 있는 누각으로, 왕이 신하들과 연회를 베풀던 곳입니다. 1412년(태종 12년)에 창건되어 임진왜란 때 소실된 후 1867년(고종 4년)에 재건되었습니다. 경회루는 2층 누각 건물로, 1층은 돌기둥으로 받치고 2층은 온돌방으로 되어 있습니다. 연못 위에 세워진 이 아름다운 누각은 조선 왕실의 연회와 외국 사신 접대 등 중요한 국가 행사가 열리던 곳으로, 한국 전통 건축의 우수성을 보여주는 대표적인 문화재입니다.'
    },
    gwanghwamun: {
      name: '광화문',
      image: '/heritage/gwanghwamun.jpg',
      location: '서울특별시 종로구 세종로',
      hours: '24시간 개방',
      phone: '02-3700-3900',
      fee: '무료',
      description: '광화문은 경복궁의 정문으로, 조선왕조의 법궁인 경복궁의 위엄을 상징하는 문입니다. 1395년(태조 4년) 경복궁 창건과 함께 건립되었으며, "광화(光化)"는 "왕의 큰 덕이 온 나라를 비춘다"는 의미를 담고 있습니다. 현재의 광화문은 2010년에 원래 위치로 복원된 것으로, 조선시대 궁궐 건축의 정수를 보여주는 대표적인 문화재입니다. 매일 정해진 시간에 수문장 교대식이 열려 많은 관광객들이 찾는 명소이기도 합니다.'
    },
    folk_museum: {
      name: '국립민속박물관',
      image: '/heritage/folk_museum.jpg',
      location: '서울특별시 종로구 삼청로 37',
      hours: '09:00 - 18:00 (월요일 휴관)',
      phone: '02-3704-3114',
      fee: '무료',
      description: '국립민속박물관은 한국인의 전통생활문화를 조사·수집·보존·전시하는 대표적인 생활사 박물관입니다. 1946년에 개관하여 70여 년의 역사를 가지고 있으며, 선사시대부터 현대에 이르기까지 한국인의 생활사를 한눈에 볼 수 있는 곳입니다. 한국인의 일생, 한국인의 하루, 한국인의 일년 등 3개의 상설전시실을 통해 우리 조상들의 생활 모습을 생생하게 체험할 수 있으며, 다양한 기획전시와 교육 프로그램도 운영하고 있습니다.'
    }
  };

  const heritage = heritageDetails[id] || heritageDetails['gyeonghoeru'];

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#f5f5f5', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header with Heritage Name */}
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
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{heritage.name}</span>
      </div>

      {/* Content Area */}
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'auto'
      }}>
        {/* Heritage Image and Info Section */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexShrink: 0
        }}>
          {/* Heritage Image */}
          <div style={{ flex: '0 0 120px' }}>
            <img 
              src={heritage.image} 
              alt={heritage.name}
              style={{ 
                width: '120px', 
                height: '120px', 
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
                width: '120px', 
                height: '120px', 
                background: '#f0f0f0',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '12px',
                borderRadius: '8px'
              }}
            >
              이미지 로딩 중...
            </div>
          </div>

          {/* Heritage Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>📍</span>
              <span style={{ fontSize: '14px', color: '#666' }}>{heritage.location}</span>
            </div>

            {/* Operating Hours */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>🕐</span>
              <span style={{ fontSize: '14px', color: '#666' }}>{heritage.hours}</span>
            </div>

            {/* Phone Number */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>📞</span>
              <span style={{ fontSize: '14px', color: '#666' }}>{heritage.phone}</span>
            </div>
          </div>
        </div>

        {/* Entrance Fee Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '20px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <img 
              src="/image/won.png" 
              alt="입장료" 
              style={{ width: '20px', height: '20px', flexShrink: 0 }}
              onError={(e) => { 
                e.target.style.display = 'none'; 
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span style={{ display: 'none', fontSize: '20px' }}>💰</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>입장료</span>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#666',
            lineHeight: '1.4'
          }}>
            {heritage.fee}
          </p>
        </div>

        {/* Description Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '12px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <img 
              src="/image/open-book.png" 
              alt="설명" 
              style={{ width: '20px', height: '20px', flexShrink: 0 }}
              onError={(e) => { 
                e.target.style.display = 'none'; 
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span style={{ display: 'none', fontSize: '20px' }}>📖</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>AI 문화재 설명</span>
          </div>
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            paddingRight: '5px'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: '#333',
              lineHeight: '1.6',
              textAlign: 'justify'
            }}>
              {heritage.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '20px',
          flexShrink: 0 
        }}>
          <button 
            onClick={() => navigate('/camera')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📷 사진 촬영하기
          </button>
          <button 
            onClick={() => {
              // 공유 기능
              if (navigator.share) {
                navigator.share({
                  title: heritage.name,
                  text: heritage.description,
                  url: window.location.href
                });
              } else {
                alert('공유 기능이 지원되지 않는 브라우저입니다.');
              }
            }}
            style={{
              padding: '12px 16px',
              backgroundColor: 'white',
              color: '#007AFF',
              border: '1px solid #007AFF',
              borderRadius: '10px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            📤
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

export default DetailPage;
