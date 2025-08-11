import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function HeritagePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [heritage, setHeritage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiContent, setAiContent] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    fetchHeritageInfo();
  }, [id]);

  const fetchHeritageInfo = async () => {
    try {
      setLoading(true);
      
      // 백엔드 API에서 문화재 정보 가져오기
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5003';
      const response = await fetch(`${apiUrl}/api/building/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHeritage(data.building);
        } else {
          throw new Error('문화재 정보를 찾을 수 없습니다.');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('문화재 정보 조회 오류:', error);
      setError('문화재 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateAISection = async (sectionType) => {
    if (!heritage) return;

    try {
      setAiLoading(prev => ({ ...prev, [sectionType]: true }));
      console.log(`🤖 AI ${sectionType} 생성 시작:`, heritage.name);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5003';
      const response = await fetch(`${apiUrl}/api/philosophy/${heritage.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildingName: heritage.name,
          locationInfo: {
            address: heritage.location || '서울특별시',
            latitude: heritage.coordinates?.lat || 37.5665,
            longitude: heritage.coordinates?.lng || 126.9780
          },
          userContext: {
            deviceType: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
            timestamp: new Date().toISOString(),
            requestedSection: sectionType // 요청한 섹션 정보 추가
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ AI ${sectionType} 생성 완료:`, data);

      if (data.success && data.content) {
        setAiContent(prev => ({
          ...prev,
          [sectionType]: data.content[sectionType]
        }));
      } else {
        throw new Error(data.error || 'AI 콘텐츠 생성 실패');
      }
    } catch (error) {
      console.error(`❌ AI ${sectionType} 생성 오류:`, error);
      setError(`AI ${sectionType} 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setAiLoading(prev => ({ ...prev, [sectionType]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #007AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>문화재 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && !heritage) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏛️</div>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>문화재 정보 오류</p>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/main')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

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
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
          {heritage?.name || '문화재 정보'}
        </span>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}>
        {heritage && (
          <>
            {/* Heritage Image and Basic Info */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: '0 0 120px' }}>
                  <img
                    src={heritage.images?.[0] || '/heritage/default.jpg'}
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
                    🏛️
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#333' }}>
                    {heritage.name}
                  </h2>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    🏛️ {heritage.nameEn}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    📅 {heritage.buildYear}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    🏆 {heritage.culturalProperty}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                {heritage.description}
              </div>
            </div>

            {/* AI Content Selection */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#333' }}>
                🤖 AI 문화재 해석
              </h3>

              {/* Section Selection Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {[
                  { key: 'philosophy', icon: '🏛️', title: '건축 철학', color: '#f8f9ff', borderColor: '#e0e8f0' },
                  { key: 'history', icon: '📜', title: '역사적 맥락', color: '#fff8e1', borderColor: '#ffe0b2' },
                  { key: 'culture', icon: '🎭', title: '문화적 가치', color: '#f3e5f5', borderColor: '#e1bee7' },
                  { key: 'modern', icon: '🔮', title: '현대적 해석', color: '#e8f5e8', borderColor: '#c8e6c9' }
                ].map((section) => (
                  <button
                    key={section.key}
                    onClick={() => generateAISection(section.key)}
                    disabled={aiLoading[section.key]}
                    style={{
                      padding: '15px 12px',
                      backgroundColor: aiContent[section.key] ? section.color : 'white',
                      border: `2px solid ${section.borderColor}`,
                      borderRadius: '12px',
                      cursor: aiLoading[section.key] ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      minHeight: '80px',
                      justifyContent: 'center',
                      opacity: aiLoading[section.key] ? 0.7 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {aiLoading[section.key] ? (
                      <>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #f3f3f3',
                          borderTop: '2px solid #8B5CF6',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{ fontSize: '12px' }}>생성 중...</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '20px' }}>{section.icon}</span>
                        <span>{section.title}</span>
                        {aiContent[section.key] && (
                          <span style={{ fontSize: '12px', color: '#28a745' }}>✅ 완료</span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* Generated Content Display */}
              {Object.keys(aiContent).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {aiContent.philosophy && (
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#f8f9ff',
                      borderRadius: '8px',
                      border: '1px solid #e0e8f0'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
                        🏛️ 건축 철학
                      </h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                        {aiContent.philosophy}
                      </p>
                    </div>
                  )}

                  {aiContent.history && (
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#fff8e1',
                      borderRadius: '8px',
                      border: '1px solid #ffe0b2'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
                        📜 역사적 맥락
                      </h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                        {aiContent.history}
                      </p>
                    </div>
                  )}

                  {aiContent.culture && (
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#f3e5f5',
                      borderRadius: '8px',
                      border: '1px solid #e1bee7'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
                        🎭 문화적 가치
                      </h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                        {aiContent.culture}
                      </p>
                    </div>
                  )}

                  {aiContent.modern && (
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#e8f5e8',
                      borderRadius: '8px',
                      border: '1px solid #c8e6c9'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
                        🔮 현대적 해석
                      </h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                        {aiContent.modern}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {Object.keys(aiContent).length === 0 && !Object.values(aiLoading).some(loading => loading) && (
                <div style={{
                  textAlign: 'center',
                  padding: '30px 20px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    위의 버튼을 클릭하여<br />
                    {heritage.name}에 대한 AI 해석을 확인해보세요.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px'
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
                onClick={() => navigate(`/detail/${heritage.id}`)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                📖 상세 정보
              </button>
            </div>
          </>
        )}
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

export default HeritagePage;