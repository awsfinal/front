import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations, getLanguage } from '../utils/translations';

function LoginPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('ko');
  const t = translations[language];
  
  useEffect(() => {
    const savedLanguage = getLanguage();
    setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    // 구글 로그인 초기화 (로딩 대기)
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        console.log('구글 API 로드 완료');
        window.google.accounts.id.initialize({
          client_id: '168121341640-f4hrqdtftcui9tmamlerm35hqdgjdlf5.apps.googleusercontent.com', // 새 클라이언트 ID로 교체 후 테스트
          callback: handleGoogleLogin,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false, // FedCM 비활성화
          itp_support: true
        });
        console.log('구글 로그인 초기화 완료');
      } else {
        console.log('구글 API 로딩 중...');
        setTimeout(initializeGoogle, 100);
      }
    };

    initializeGoogle();
  }, []);

  const handleGoogleLogin = (response) => {
    console.log('Google 로그인 성공:', response);
    // JWT 토큰을 파싱하여 사용자 정보 추출
    const userInfo = parseJwt(response.credential);
    console.log('사용자 정보:', userInfo);

    // 로컬 스토리지에 사용자 정보 저장
    localStorage.setItem('user', JSON.stringify({
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture
    }));

    navigate('/main');
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleGoogleLoginClick = () => {
    if (window.google && window.google.accounts) {
      try {
        // GSI Identity Services 방식만 사용 (JWT credential 기반)
        window.google.accounts.id.prompt((notification) => {
          console.log('Prompt 결과:', notification);
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Prompt가 표시되지 않았습니다.');
            alert('구글 로그인 팝업이 차단되었을 수 있습니다. 팝업 차단을 해제하고 다시 시도해주세요.');
          }
        });
      } catch (error) {
        console.error('Prompt 오류:', error);
        alert('구글 로그인에 문제가 발생했습니다. 페이지를 새로고침하고 다시 시도해주세요.');
      }
    } else {
      console.error('Google API가 로드되지 않았습니다.');
      alert('구글 API가 로드되지 않았습니다. 인터넷 연결을 확인하고 페이지를 새로고침해주세요.');
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      handleGoogleLoginClick();
    } else {
      // 다른 소셜 로그인 처리
      console.log(`${provider} 로그인`);
      navigate('/main');
    }
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
          {t.loginWithKakao}
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
          {t.loginWithNaver}
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
          {t.loginWithGoogle}
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
          onClick={() => navigate('/signup')}
        >
          {t.signUp}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
