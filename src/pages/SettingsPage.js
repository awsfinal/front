import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SettingsPage() {
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState('보통');

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      navigate('/');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('정말로 회원탈퇴 하시겠습니까?\n모든 데이터가 삭제됩니다.')) {
      alert('회원탈퇴가 완료되었습니다.');
      navigate('/');
    }
  };

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
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>설정</span>
      </div>

      {/* Settings Content */}
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'flex-start'
      }}>
        <div>
          {/* 글꼴 섹션 */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginBottom: '10px',
              fontWeight: '500'
            }}>
              글꼴
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '15px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="/image/settings_text.png" 
                alt="글자크기" 
                style={{ width: '24px', height: '24px', marginRight: '15px' }}
              />
              <span style={{ fontSize: '16px', flex: 1 }}>글자 크기</span>
              <select 
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                style={{ 
                  padding: '5px 10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  background: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="작게">작게</option>
                <option value="보통">보통</option>
                <option value="크게">크게</option>
              </select>
            </div>
          </div>

          {/* 개인정보 섹션 */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginBottom: '10px',
              fontWeight: '500'
            }}>
              개인정보
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  width: '100%',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onClick={handleLogout}
              >
                <img 
                  src="/image/settings_logout.png" 
                  alt="로그아웃" 
                  style={{ width: '24px', height: '24px', marginRight: '15px' }}
                />
                <span style={{ fontSize: '16px', color: '#333' }}>로그아웃</span>
              </button>
              
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  width: '100%',
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={handleDeleteAccount}
              >
                <img 
                  src="/image/settings_withdraw.png" 
                  alt="회원탈퇴" 
                  style={{ width: '24px', height: '24px', marginRight: '15px' }}
                />
                <span style={{ fontSize: '16px', color: '#FF3B30' }}>회원탈퇴</span>
              </button>
            </div>
          </div>

          {/* 애플리케이션 정보 섹션 */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginBottom: '10px',
              fontWeight: '500'
            }}>
              애플리케이션 정보
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '15px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="/image/settings_version.png" 
                alt="버전" 
                style={{ width: '24px', height: '24px', marginRight: '15px' }}
              />
              <span style={{ fontSize: '16px', flex: 1 }}>버전</span>
              <span style={{ fontSize: '14px', color: '#666' }}>v1.0.0</span>
            </div>
          </div>

          {/* 광고 영역 */}
          <div style={{
            backgroundColor: '#ddd',
            borderRadius: '10px',
            padding: '25px 20px',
            textAlign: 'center',
            marginTop: '5px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#666' }}>광고</div>
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
          className="nav-item active"
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

export default SettingsPage;
