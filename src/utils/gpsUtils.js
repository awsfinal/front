// GPS 관련 유틸리티 함수들

// 두 지점 간의 거리 계산 (미터 단위)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // 미터 단위로 반환
};

// 방위각을 나침반 방향으로 변환
export const getCompassDirection = (heading) => {
  if (heading === null || heading === undefined) return '측정 불가';
  
  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  const index = Math.round(heading / 45) % 8;
  return directions[index];
};

// 고정밀 GPS 평균화 시스템
export const getHighAccuracyGPS = (setGpsAccuracy, setLocationStatus) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 기기는 GPS를 지원하지 않습니다.'));
      return;
    }

    const positions = [];
    let attempts = 0;
    const maxAttempts = 4;

    const getPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          attempts++;
          positions.push(position);
          
          const accuracy = Math.round(position.coords.accuracy);
          console.log(`고정밀 GPS ${attempts}/${maxAttempts}: 정확도 ${accuracy}m`);
          
          // 정확도 상태 업데이트
          setGpsAccuracy(accuracy);
          setLocationStatus(`🎯 GPS 측정 중... (${attempts}/${maxAttempts}) 정확도: ${accuracy}m`);
          
          if (attempts >= maxAttempts) {
            console.log('고정밀 GPS 측정 완료');
            resolve(calculateGPSAverage(positions));
          } else {
            // 1초 간격으로 새로운 GPS 요청
            setTimeout(getPosition, 1000);
          }
        },
        (error) => {
          console.error('고정밀 GPS 오류:', error);
          let errorMsg = 'GPS 오류가 발생했습니다.';
          
          switch (error.code) {
            case 1:
              errorMsg = 'GPS 권한이 거부되었습니다. 브라우저에서 위치 권한을 허용해주세요.';
              break;
            case 2:
              errorMsg = 'GPS 위치를 찾을 수 없습니다. 실외로 이동해주세요.';
              break;
            case 3:
              errorMsg = 'GPS 응답 시간이 초과되었습니다.';
              break;
          }
          
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0  // 캐시 사용 안함 - 항상 새로운 위치 요청
        }
      );
    };

    console.log('고정밀 GPS 4회 측정 시작');
    setLocationStatus('🎯 고정밀 GPS 측정 시작...');
    getPosition();
  });
};

// GPS 평균 계산
export const calculateGPSAverage = (positions, currentHeading) => {
  let totalLat = 0, totalLng = 0, totalHeading = 0;
  let headingCount = 0;
  let totalAccuracy = 0;

  // 단순 평균 계산
  positions.forEach(pos => {
    totalLat += pos.coords.latitude;
    totalLng += pos.coords.longitude;
    totalAccuracy += pos.coords.accuracy;
    
    if (pos.coords.heading !== null && pos.coords.heading !== undefined) {
      totalHeading += pos.coords.heading;
      headingCount++;
    }
  });

  let finalHeading = null;
  let headingSource = '측정 불가';
  
  if (headingCount > 0) {
    finalHeading = totalHeading / headingCount;
    headingSource = 'GPS';
  } else if (currentHeading !== null) {
    finalHeading = currentHeading;
    headingSource = '나침반';
  }

  // 평균 계산 후 소수점 9자리에서 반올림
  const avgLatitude = totalLat / positions.length;
  const avgLongitude = totalLng / positions.length;
  const avgAccuracy = totalAccuracy / positions.length;

  return {
    latitude: Math.round(avgLatitude * 1000000000) / 1000000000,  // 소수점 9자리 반올림
    longitude: Math.round(avgLongitude * 1000000000) / 1000000000,  // 소수점 9자리 반올림
    heading: finalHeading,
    accuracy: avgAccuracy,
    timestamp: Date.now(),
    headingSource: headingSource
  };
};