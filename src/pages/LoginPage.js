import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleSocialLogin = (provider) => {
    // 실제로는 소셜 로그인 처리
    console.log(`${provider} 로그인`);
    navigate('/main');
  };

  return (
    <div style={{ 
      height: '100vh', 
      backgroundImage: 'url(/image/background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      justifyContent: 'flex-end',
      padding: '0 20px 40px 20px'
    }}>
      {/* 소셜 로그인 버튼들 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        
        <img 
          src="/image/kakao_login.png" 
          alt="카카오 로그인"
          onClick={() => handleSocialLogin('Kakao')}
          style={{
            width: '100%',
            height: 'auto',
            cursor: 'pointer',
            borderRadius: '10px'
          }}
          onError={(e) => {
            // 이미지 로드 실패시 기본 버튼으로 대체
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <button 
          onClick={() => handleSocialLogin('Kakao')}
          style={{
            padding: '15px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            backgroundColor: '#FEE500',
            color: '#000',
            display: 'none'
          }}
        >
          카카오로 시작하기
        </button>
        
        <img 
          src="/image/naver_login.png" 
          alt="네이버 로그인"
          onClick={() => handleSocialLogin('Naver')}
          style={{
            width: '100%',
            height: 'auto',
            cursor: 'pointer',
            borderRadius: '10px'
          }}
          onError={(e) => {
            // 이미지 로드 실패시 기본 버튼으로 대체
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <button 
          onClick={() => handleSocialLogin('Naver')}
          style={{
            padding: '15px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            backgroundColor: '#03C75A',
            color: 'white',
            display: 'none'
          }}
        >
          네이버로 시작하기
        </button>
        
        <button 
          onClick={() => handleSocialLogin('Google')}
          style={{
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid #ddd',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            backgroundColor: 'white',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <img 
            src="/image/google_icon.png" 
            alt="Google" 
            style={{ width: '20px', height: '20px' }}
            onError={(e) => e.target.style.display = 'none'}
          />
          Google로 로그인
        </button>
      </div>

      {/* Sign up 버튼 */}
      <div style={{ textAlign: 'center' }}>
        <button 
          style={{ 
            width: '100%',
            padding: '15px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#D2B48C',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/main')}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
