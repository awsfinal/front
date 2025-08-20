import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { translations, getLanguage } from '../utils/translations';

function TouristSpotDetailPage() {
  const navigate = useNavigate();
  const { contentId } = useParams();
  const [spotDetail, setSpotDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('ko');
  
  const t = translations[language];

  useEffect(() => {
    // 언어 설정 가져오기
    const savedLanguage = getLanguage();
    setLanguage(savedLanguage);
    
    // 관광지 상세 정보 가져오기
    fetchTouristSpotDetail();
  }, [contentId]);

  const fetchTouristSpotDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5007';
      const response = await fetch(`${apiUrl}/api/tourist-spots/${contentId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSpotDetail(result.data);
        } else {
          setError(result.message || '관광지 정보를 불러올 수 없습니다.');
        }
      } else {
        setError('서버 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('관광지 상세 정보 조회 오류:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // HTML 태그 제거 함수
  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  // 전화번호 포맷팅
  const formatPhoneNumber = (tel) => {
    if (!tel || tel === '정보 없음') return '정보 없음';
    return tel.replace(/(\d{2,3})-(\d{3,4})-(\d{4})/, '$1-$2-$3');
  };

  // 주차 정보 포맷팅
  const formatParkingInfo = (parking) => {
    if (!parking || parking === '정보 없음') return '정보 없음';
    if (parking.includes('가능') || parking.includes('있음')) return '주차 가능';
    if (parking.includes('불가') || parking.includes('없음')) return '주차 불가';
    return stripHtmlTags(parking);
  };

  // 이용요금 포맷팅
  const formatUseFee = (usefee) => {
    if (!usefee || usefee === '정보 없음') return '정보 없음';
    return stripHtmlTags(usefee);
  };

  // 이용시간 포맷팅
  const formatUseTime = (usetime) => {
    if (!usetime || usetime === '정보 없음') return '정보 없음';
    return stripHtmlTags(usetime);
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #007AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px'
          }}></div>
          <div style={{ fontSize: '16px', color: '#666' }}>
            관광지 정보를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>😞</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
            오류가 발생했습니다
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            {error}
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            이전으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!spotDetail) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', color: '#666' }}>
            관광지 정보가 없습니다.
          </div>
        </div>
      </div>
    );
  }

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
        gap: '15px',
        flexShrink: 0
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ←
        </button>
        <h1 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          margin: 0,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {spotDetail.title}
        </h1>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        padding: '0 0 20px 0'
      }}>
        {/* Main Image */}
        {spotDetail.image && (
          <div style={{ 
            width: '100%', 
            height: '250px',
            position: 'relative',
            marginBottom: '20px'
          }}>
            <img 
              src={spotDetail.image} 
              alt={spotDetail.title}
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
            <div 
              style={{ 
                width: '100%', 
                height: '100%', 
                background: '#f0f0f0',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '16px'
              }}
            >
              이미지를 불러올 수 없습니다
            </div>
          </div>
        )}

        <div style={{ padding: '0 20px' }}>
          {/* Title and Basic Info */}
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              margin: '0 0 10px 0',
              color: '#333'
            }}>
              {spotDetail.title}
            </h2>
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              lineHeight: '1.4'
            }}>
              📍 {spotDetail.address}
              {spotDetail.addressDetail && (
                <div style={{ marginTop: '2px' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;{spotDetail.addressDetail}
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '25px'
          }}>
            {/* 전화번호 */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                📞 전화번호
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                {formatPhoneNumber(spotDetail.tel)}
              </div>
            </div>

            {/* 주차장 */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                🚗 주차장
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                {formatParkingInfo(spotDetail.parking)}
              </div>
            </div>

            {/* 이용요금 */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                💰 이용요금
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: '#333',
                lineHeight: '1.3'
              }}>
                {formatUseFee(spotDetail.usefee)}
              </div>
            </div>

            {/* 이용시간 */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                🕐 이용시간
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: '#333',
                lineHeight: '1.3'
              }}>
                {formatUseTime(spotDetail.usetime)}
              </div>
            </div>
          </div>

          {/* 휴무일 정보 */}
          {spotDetail.restdate && spotDetail.restdate !== '정보 없음' && (
            <div style={{
              backgroundColor: '#fff3cd',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid #ffeaa7',
              marginBottom: '25px'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#856404', 
                marginBottom: '5px',
                fontWeight: '500'
              }}>
                🚫 휴무일
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: '#856404',
                lineHeight: '1.3'
              }}>
                {stripHtmlTags(spotDetail.restdate)}
              </div>
            </div>
          )}

          {/* Description */}
          {spotDetail.overview && spotDetail.overview !== '상세 설명이 없습니다.' && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                margin: '0 0 15px 0',
                color: '#333'
              }}>
                📝 상세 설명
              </h3>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#333'
              }}>
                {stripHtmlTags(spotDetail.overview)}
              </div>
            </div>
          )}

          {/* Homepage Link */}
          {spotDetail.homepage && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                margin: '0 0 15px 0',
                color: '#333'
              }}>
                🌐 홈페이지
              </h3>
              <div 
                style={{
                  backgroundColor: '#e3f2fd',
                  padding: '15px',
                  borderRadius: '12px',
                  border: '1px solid #90caf9'
                }}
                onClick={() => {
                  const url = stripHtmlTags(spotDetail.homepage);
                  if (url.startsWith('http')) {
                    window.open(url, '_blank');
                  }
                }}
              >
                <div style={{ 
                  fontSize: '14px', 
                  color: '#1976d2',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}>
                  {stripHtmlTags(spotDetail.homepage)}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            marginTop: '30px'
          }}>
            <button
              onClick={() => {
                const url = `https://map.kakao.com/link/to/${spotDetail.title},${spotDetail.mapY},${spotDetail.mapX}`;
                window.open(url, '_blank');
              }}
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🗺️ 길찾기
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: spotDetail.title,
                    text: `${spotDetail.title} - ${spotDetail.address}`,
                    url: window.location.href
                  });
                } else {
                  // 폴백: 클립보드에 복사
                  navigator.clipboard.writeText(window.location.href);
                  alert('링크가 클립보드에 복사되었습니다.');
                }
              }}
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: '#34c759',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              📤 공유하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TouristSpotDetailPage;
