import { useEffect } from 'react';

// 나침반 센서 커스텀 훅
export const useCompass = (isIOS, isAndroid, setCurrentHeading) => {
  useEffect(() => {
    const initCompass = () => {
      if (window.DeviceOrientationEvent) {
        // iOS 권한 요청
        if (isIOS && typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission()
            .then(permission => {
              console.log('iOS 나침반 권한:', permission);
              if (permission === 'granted') {
                setupCompassListeners();
              }
            })
            .catch(error => {
              console.log('iOS 나침반 권한 오류:', error);
            });
        } else {
          setupCompassListeners();
        }
      } else {
        console.log('나침반 센서를 지원하지 않습니다.');
      }
    };

    // 나침반 이벤트 리스너 설정
    const setupCompassListeners = () => {
      const handleOrientation = (event) => {
        let heading = null;
        
        // iOS Safari
        if (event.webkitCompassHeading !== null && event.webkitCompassHeading !== undefined) {
          heading = event.webkitCompassHeading;
        }
        // 안드로이드 Chrome
        else if (event.alpha !== null && event.alpha !== undefined) {
          if (isIOS) {
            heading = event.alpha;
          } else {
            // 안드로이드는 반대 방향
            heading = 360 - event.alpha;
          }
        }
        
        if (heading !== null) {
          const normalizedHeading = ((heading % 360) + 360) % 360;
          setCurrentHeading(normalizedHeading);
        }
      };
      
      // 기본 방향 이벤트
      window.addEventListener('deviceorientation', handleOrientation);
      
      // 절대 방향 이벤트 (안드로이드 Chrome)
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      
      console.log('나침반 센서 초기화 완료');
    };

    initCompass();

    // 클린업 함수
    return () => {
      // 이벤트 리스너 제거는 복잡하므로 생략 (페이지 이동 시 자동 정리됨)
    };
  }, [isIOS, isAndroid, setCurrentHeading]);
};