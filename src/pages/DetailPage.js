import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// 경복궁 건물 데이터 (CameraPage와 동일)
const gyeongbokgungBuildings = {
  gyeonghoeru: {
    id: 'gyeonghoeru',
    name: '경회루',
    nameEn: 'Gyeonghoeru Pavilion',
    description: '경복궁의 대표적인 누각으로, 연못 위에 세워진 아름다운 건물입니다.',
    detailedDescription: '경회루는 조선 태종 12년(1412)에 창건되어 임진왜란 때 소실된 후 고종 4년(1867)에 중건된 2층 누각입니다. 국왕이 신하들과 연회를 베풀거나 외국 사신을 접대하던 곳으로, 경복궁에서 가장 아름다운 건물 중 하나로 꼽힙니다.',
    coordinates: { lat: 37.5788, lng: 126.9770 },
    images: ['/image/gyeonghoeru1.jpg', '/image/gyeonghoeru2.jpg'],
    buildYear: '1412년 (태종 12년)',
    culturalProperty: '국보 제224호',
    features: ['2층 누각', '연못 위 건물', '왕실 연회장']
  },
  geunjeongjeon: {
    id: 'geunjeongjeon',
    name: '근정전',
    nameEn: 'Geunjeongjeon Hall',
    description: '경복궁의 정전으로, 조선 왕조의 공식적인 국가 행사가 열리던 곳입니다.',
    detailedDescription: '근정전은 경복궁의 중심 건물로, 조선시대 왕이 신하들의 조회를 받거나 국가의 중요한 행사를 치르던 정전입니다. 현재의 건물은 고종 때 중건된 것으로, 조선 왕조의 권위와 위엄을 상징하는 대표적인 건축물입니다.',
    coordinates: { lat: 37.5796, lng: 126.9770 },
    images: ['/image/geunjeongjeon1.jpg', '/image/geunjeongjeon2.jpg'],
    buildYear: '1395년 (태조 4년)',
    culturalProperty: '국보 제223호',
    features: ['정전', '왕의 집무실', '국가 행사장']
  },
  gyeongseungjeon: {
    id: 'gyeongseungjeon',
    name: '경성전',
    nameEn: 'Gyeongseungjeon Hall',
    description: '왕이 일상적인 정무를 보던 편전 건물입니다.',
    detailedDescription: '경성전은 근정전 북쪽에 위치한 편전으로, 왕이 평상시 정무를 처리하던 공간입니다. 근정전보다 작고 실용적인 구조로 되어 있어 일상적인 업무에 적합했습니다.',
    coordinates: { lat: 37.5794, lng: 126.9768 },
    images: ['/image/gyeongseungjeon1.jpg'],
    buildYear: '1395년 (태조 4년)',
    culturalProperty: '보물',
    features: ['편전', '일상 정무', '실무 공간']
  },
  sajeongjeon: {
    id: 'sajeongjeon',
    name: '사정전',
    nameEn: 'Sajeongjeon Hall',
    description: '왕이 일상적인 정무를 보던 편전으로, 근정전보다 작고 실용적인 건물입니다.',
    detailedDescription: '사정전은 왕이 평상시 정무를 보던 편전으로, 근정전이 공식적인 국가 행사를 위한 공간이라면 사정전은 일상적인 업무를 처리하던 실무 공간이었습니다.',
    coordinates: { lat: 37.5801, lng: 126.9770 },
    images: ['/image/sajeongjeon1.jpg'],
    buildYear: '1395년 (태조 4년)',
    culturalProperty: '보물 제1759호',
    features: ['편전', '일상 정무', '실무 공간']
  },
  gangnyeongjeon: {
    id: 'gangnyeongjeon',
    name: '강녕전',
    nameEn: 'Gangnyeongjeon Hall',
    description: '조선시대 왕의 침전으로 사용된 건물입니다.',
    detailedDescription: '강녕전은 조선시대 왕이 거처하던 침전으로, 왕의 사적인 생활 공간이었습니다. 현재의 건물은 고종 때 중건된 것입니다.',
    coordinates: { lat: 37.5804, lng: 126.9775 },
    images: ['/image/gangnyeongjeon1.jpg'],
    buildYear: '1395년 (태조 4년)',
    culturalProperty: '보물 제1760호',
    features: ['왕의 침전', '사적 공간', '생활 공간']
  },
  gyotaejeon: {
    id: 'gyotaejeon',
    name: '교태전',
    nameEn: 'Gyotaejeon Hall',
    description: '조선시대 왕비의 침전으로 사용된 건물입니다.',
    detailedDescription: '교태전은 조선시대 왕비가 거처하던 침전으로, 왕비의 사적인 생활 공간이었습니다. 아름다운 꽃담으로도 유명합니다.',
    coordinates: { lat: 37.5807, lng: 126.9775 },
    images: ['/image/gyotaejeon1.jpg'],
    buildYear: '1395년 (태조 4년)',
    culturalProperty: '보물 제1761호',
    features: ['왕비의 침전', '꽃담', '여성 공간']
  }
};

function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    // location.state에서 건물 정보가 전달된 경우 (카메라에서 온 경우)
    if (location.state && location.state.building) {
      setBuilding(location.state.building);
      setCapturedPhoto(location.state.photoUrl);
      setAnalysisResult(location.state.analysisResult);
      setLoading(false);
    } else {
      // API에서 건물 정보 가져오기
      fetchBuildingInfo();
    }
  }, [id, location.state]);

  const fetchBuildingInfo = () => {
    try {
      setLoading(true);

      // 프론트엔드에서 직접 건물 정보 조회
      const buildingData = gyeongbokgungBuildings[id];

      if (buildingData) {
        setBuilding(buildingData);
      } else {
        setError('건물 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('건물 정보 조회 오류:', error);
      setError('건물 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
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
          <p>건물 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !building) {
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
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>건물 정보 오류</p>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            {error || '건물 정보를 찾을 수 없습니다.'}
          </p>
          <button
            onClick={() => navigate('/camera')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            카메라로 돌아가기
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
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{building.name}</span>
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}>
        {/* 촬영된 사진 표시 (있는 경우) */}
        {capturedPhoto && (
          <div style={{
            marginBottom: '20px',
            flexShrink: 0
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', justifyContent: 'center' }}>
                <span style={{ fontSize: '20px' }}>📸</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>촬영된 사진</span>
              </div>
              <img
                src={`${process.env.REACT_APP_API_URL || ''}${capturedPhoto}`}
                alt="촬영된 사진"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              {analysisResult && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                  <div>신뢰도: {Math.round(analysisResult.confidence * 100)}%</div>
                  {analysisResult.location && (
                    <div style={{ marginTop: '5px' }}>
                      촬영 시간: {new Date(analysisResult.location.capturedAt).toLocaleString('ko-KR')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 촬영 위치 정보 표시 (있는 경우) */}
        {analysisResult && analysisResult.location && (
          <div style={{
            marginBottom: '20px',
            flexShrink: 0
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>📍</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>촬영 위치 정보</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* 주소 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontSize: '14px', flexShrink: 0, color: '#666' }}>🏠</span>
                  <span style={{ fontSize: '14px', color: '#333', lineHeight: '1.4' }}>
                    {analysisResult.location.address}
                  </span>
                </div>

                {/* GPS 좌표 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', flexShrink: 0, color: '#666' }}>🌐</span>
                  <span style={{ fontSize: '14px', color: '#333' }}>
                    {analysisResult.location.latitude.toFixed(6)}, {analysisResult.location.longitude.toFixed(6)}
                  </span>
                </div>

                {/* 건물과의 거리 */}
                {analysisResult.location.distanceToBuilding && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', flexShrink: 0, color: '#666' }}>📏</span>
                    <span style={{ fontSize: '14px', color: '#333' }}>
                      {building.name}에서 약 {analysisResult.location.distanceToBuilding}m
                    </span>
                  </div>
                )}

                {/* 위치 정확도 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', flexShrink: 0, color: '#666' }}>🎯</span>
                  <span style={{ fontSize: '14px', color: '#333' }}>
                    위치 정확도: {analysisResult.location.accuracy === 'high' ? '높음' : '보통'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Building Image and Info Section */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexShrink: 0
        }}>
          {/* Building Image */}
          <div style={{ flex: '0 0 120px' }}>
            <img
              src={building.images && building.images[0] ? building.images[0] : '/image/default-building.jpg'}
              alt={building.name}
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

          {/* Building Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* English Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>🏛️</span>
              <span style={{ fontSize: '14px', color: '#666' }}>{building.nameEn}</span>
            </div>

            {/* Build Year */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>📅</span>
              <span style={{ fontSize: '14px', color: '#666' }}>{building.buildYear}</span>
            </div>

            {/* Cultural Property */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>🏆</span>
              <span style={{ fontSize: '14px', color: '#666' }}>{building.culturalProperty}</span>
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
            경복궁 입장료: 성인 3,000원, 청소년 1,500원
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
              {building.detailedDescription}
            </p>

            {/* 건물 특징 표시 */}
            {building.features && building.features.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  주요 특징
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {building.features.map((feature, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#f0f8ff',
                        color: '#007AFF',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: '1px solid #e0e8f0'
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                  title: building.name,
                  text: building.description,
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
