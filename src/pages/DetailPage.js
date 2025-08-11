import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PhilosophyModal from '../components/PhilosophyModal';

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
  },
  heumgyeonggak: {
    id: 'heumgyeonggak',
    name: '흠경각',
    nameEn: 'Heumgyeonggak',
    description: '경복궁의 건물 중 하나입니다.',
    detailedDescription: '흠경각은 경복궁 내의 중요한 건물 중 하나로, 조선시대의 건축 양식을 잘 보여주는 문화재입니다. 왕실의 학문과 교육을 담당하던 공간으로 사용되었으며, 특히 천문학과 역법 연구의 중심지 역할을 했습니다. 건물의 이름인 "흠경"은 "하늘을 우러러 공경한다"는 뜻으로, 조선시대 왕실의 학문에 대한 존중과 천문학적 지식의 중요성을 보여줍니다. 현재는 경복궁 복원 과정에서 재건된 건물로, 조선시대 과학 기술의 발전상을 엿볼 수 있는 소중한 문화유산입니다.',
    coordinates: { lat: 37.5797, lng: 126.9765 },
    images: ['/image/default-building.jpg'],
    buildYear: '조선시대',
    culturalProperty: '문화재',
    features: ['전통 건축', '경복궁 건물', '학문 공간', '천문학 연구', '왕실 교육']
  },
  manchunjeon: {
    id: 'manchunjeon',
    name: '만춘전',
    nameEn: 'Manchunjeon Hall',
    description: '조선시대 왕실의 생활 공간으로 사용된 건물입니다.',
    detailedDescription: '만춘전은 조선시대 왕실의 일상 생활과 휴식을 위한 공간으로 사용되었습니다. 아름다운 정원과 함께 조화를 이루며, 왕실 가족들의 사적인 공간이었습니다. 현재는 경복궁의 중요한 문화재로 보존되고 있습니다.',
    coordinates: { lat: 37.579057, lng: 126.977310 },
    images: ['/image/manchunjeon1.jpg'],
    buildYear: '1395년 (태조 4년)',
    culturalProperty: '보물',
    features: ['왕실 생활 공간', '휴식 공간', '정원과 조화']
  },
  gyejodang: {
    id: 'gyejodang',
    name: '계조당',
    nameEn: 'Gyejodang Hall',
    description: '조선시대 왕실의 중요한 건물 중 하나입니다.',
    detailedDescription: '계조당은 경복궁 내의 중요한 건물로, 조선시대 왕실의 일상 생활과 정무를 위한 공간으로 사용되었습니다. 건물의 이름인 "계조"는 "조상을 계승한다"는 의미로, 왕실의 전통과 계승을 상징하는 건물입니다.',
    coordinates: { lat: 37.5799, lng: 126.9773 },
    images: ['/image/default-building.jpg'],
    buildYear: '조선시대',
    culturalProperty: '문화재',
    features: ['왕실 건물', '전통 계승', '정무 공간']
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
  const [isPhilosophyModalOpen, setIsPhilosophyModalOpen] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState({});
  const [aiSectionLoading, setAiSectionLoading] = useState({});

  useEffect(() => {
    // location.state에서 건물 정보가 전달된 경우 (카메라에서 온 경우)
    if (location.state && location.state.building) {
      setBuilding(location.state.building);
      setCapturedPhoto(location.state.photoUrl);
      setAnalysisResult(location.state.analysisResult);
      setLoading(false);
      // AI 설명도 가져오기
      fetchAiDescription(location.state.building);
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
        // AI 설명도 가져오기
        fetchAiDescription(buildingData);
      } else {
        // 건물 정보가 없을 때 기본 건물 정보 생성 (테스트용)
        const defaultBuilding = {
          id: id || 'unknown',
          name: '흠경각',
          nameEn: 'Heumgyeonggak',
          description: '경복궁의 건물 중 하나입니다.',
          detailedDescription: '흠경각은 경복궁 내의 중요한 건물 중 하나로, 조선시대의 건축 양식을 잘 보여주는 문화재입니다.',
          coordinates: { lat: 37.5797, lng: 126.9765 },
          images: ['/image/default-building.jpg'],
          buildYear: '조선시대',
          culturalProperty: '문화재',
          features: ['전통 건축', '경복궁 건물']
        };
        setBuilding(defaultBuilding);
        fetchAiDescription(defaultBuilding);
      }
    } catch (error) {
      console.error('건물 정보 조회 오류:', error);
      setError('건물 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // AI 설명 가져오기 함수 (기본 설명용)
  const fetchAiDescription = async (buildingData) => {
    try {
      setAiLoading(true);
      console.log('🤖 AI 설명 요청:', buildingData.name);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5003';
      const response = await fetch(`${apiUrl}/api/philosophy/${buildingData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildingName: buildingData.name,
          locationInfo: {
            address: '서울특별시 종로구 사직로 161 (경복궁)',
            latitude: buildingData.coordinates.lat,
            longitude: buildingData.coordinates.lng
          },
          userContext: {
            deviceType: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.content && data.content.philosophy) {
        // AI가 생성한 철학 섹션을 메인 설명으로 사용
        setAiDescription(data.content.philosophy);
        console.log('✅ AI 설명 로드 완료');
      } else {
        throw new Error(data.error || 'AI 설명 생성 실패');
      }
    } catch (error) {
      console.error('❌ AI 설명 로드 오류:', error);
      // 오류 시 기본 설명 사용
      setAiDescription(buildingData.detailedDescription || `${buildingData.name}에 대한 상세한 설명을 불러오는 중 오류가 발생했습니다.`);
    } finally {
      setAiLoading(false);
    }
  };

  // AI 섹션별 생성 함수 (4개 섹션 선택용)
  const generateAISection = async (sectionType) => {
    if (!building) return;

    try {
      setAiSectionLoading(prev => ({ ...prev, [sectionType]: true }));
      console.log(`🤖 AI ${sectionType} 생성 시작:`, building.name);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5003';
      const response = await fetch(`${apiUrl}/api/philosophy/${building.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildingName: building.name,
          locationInfo: {
            address: '서울특별시 종로구 사직로 161 (경복궁)',
            latitude: building.coordinates?.lat || 37.5665,
            longitude: building.coordinates?.lng || 126.9780
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
      setAiSectionLoading(prev => ({ ...prev, [sectionType]: false }));
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

        {/* AI Content Selection */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          flexShrink: 0
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
                disabled={aiSectionLoading[section.key]}
                style={{
                  padding: '15px 12px',
                  backgroundColor: aiContent[section.key] ? section.color : 'white',
                  border: `2px solid ${section.borderColor}`,
                  borderRadius: '12px',
                  cursor: aiSectionLoading[section.key] ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '80px',
                  justifyContent: 'center',
                  opacity: aiSectionLoading[section.key] ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {aiSectionLoading[section.key] ? (
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

          {Object.keys(aiContent).length === 0 && !Object.values(aiSectionLoading).some(loading => loading) && (
            <div style={{
              textAlign: 'center',
              padding: '30px 20px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
              <p style={{ margin: 0, fontSize: '14px' }}>
                위의 버튼을 클릭하여<br />
                {building.name}에 대한 AI 해석을 확인해보세요.
              </p>
            </div>
          )}

          {/* 건물 특징 표시 */}
          {building.features && building.features.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>🏛️</span>
                <span>주요 특징</span>
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

        {/* Action Buttons - 항상 표시 */}
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
              console.log('철학 버튼 클릭됨!', building);
              setIsPhilosophyModalOpen(true);
            }}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🏛️ 철학 보기
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

      {/* Philosophy Modal */}
      <PhilosophyModal
        isOpen={isPhilosophyModalOpen}
        onClose={() => setIsPhilosophyModalOpen(false)}
        buildingId={building?.id}
        buildingName={building?.name}
      />
    </div>
  );
}

export default DetailPage;
