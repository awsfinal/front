import React, { useState, useEffect } from 'react';

// CSS 애니메이션을 위한 스타일 추가
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 스타일 태그를 head에 추가
if (!document.querySelector('#philosophy-animations')) {
  const style = document.createElement('style');
  style.id = 'philosophy-animations';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

const PhilosophyModal = ({ isOpen, onClose, buildingId, buildingName }) => {
  const [activeTab, setActiveTab] = useState('philosophy');
  const [content, setContent] = useState({
    philosophy: '',
    history: '',
    culture: '',
    modern: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'philosophy', label: '건축 철학', icon: '🏛️' },
    { id: 'history', label: '역사적 맥락', icon: '📜' },
    { id: 'culture', label: '문화적 가치', icon: '🎭' },
    { id: 'modern', label: '현대적 해석', icon: '🔮' }
  ];

  useEffect(() => {
    if (isOpen && buildingId) {
      fetchPhilosophyContent();
    }
  }, [isOpen, buildingId]);

  const fetchPhilosophyContent = async () => {
    console.log('🏛️ 철학 내용 요청 시작:', buildingName, buildingId);
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';
      const requestUrl = `${apiUrl}/api/philosophy/${buildingId}`;
      
      const requestBody = {
        buildingName: buildingName,
        locationInfo: {
          address: '서울특별시 종로구 사직로 161 (경복궁)',
          latitude: 37.5788,
          longitude: 126.9770
        },
        userContext: {
          deviceType: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
          timestamp: new Date().toISOString()
        }
      };

      console.log('📡 API 요청 URL:', requestUrl);
      console.log('📦 요청 데이터:', requestBody);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📨 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP 오류 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API 응답 데이터:', data);
      
      if (data.success) {
        console.log('🎉 철학 내용 로딩 성공!');
        setContent(data.content);
      } else {
        console.warn('⚠️ API 응답에서 success=false:', data);
        throw new Error(data.error || '철학 내용을 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 철학 내용 로딩 오류:', error);
      console.error('❌ 오류 스택:', error.stack);
      setError(`철학 내용을 불러오는 중 오류가 발생했습니다: ${error.message}`);
      
      // 오류 발생 시 기본 내용 제공
      setContent({
        philosophy: `${buildingName}의 건축 철학을 불러오는 중 오류가 발생했습니다.`,
        history: `${buildingName}의 역사적 맥락을 불러오는 중 오류가 발생했습니다.`,
        culture: `${buildingName}의 문화적 가치를 불러오는 중 오류가 발생했습니다.`,
        modern: `${buildingName}의 현대적 해석을 불러오는 중 오류가 발생했습니다.`
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 철학 내용 요청 완료');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            🏛️ {buildingName} 철학
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #eee',
          backgroundColor: '#f8f9fa'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 8px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#007AFF' : '#666',
                fontSize: '12px',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #007AFF' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflow: 'auto'
        }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#666'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #007AFF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <p>AI가 철학적 해석을 생성하고 있습니다...</p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              color: '#e74c3c',
              padding: '20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <p>{error}</p>
              <button
                onClick={fetchPhilosophyContent}
                style={{
                  marginTop: '16px',
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
            </div>
          ) : (
            <div style={{
              lineHeight: '1.6',
              color: '#333',
              fontSize: '14px'
            }}>
              {content[activeTab] ? (
                <div>
                  {content[activeTab].split('\n').map((paragraph, index) => (
                    <p key={index} style={{ 
                      marginBottom: '12px',
                      textAlign: 'justify'
                    }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  padding: '40px 20px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <p>내용을 불러오는 중입니다...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #eee',
          backgroundColor: '#f8f9fa',
          textAlign: 'center'
        }}>
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: '#666'
          }}>
            🤖 AI가 생성한 철학적 해석입니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhilosophyModal;