import { gyeongbokgungBuildings } from './buildingData';
import { calculateDistance } from './gpsUtils';

// 카카오 지도 API를 사용한 실제 건물 검색
export const findBuildingFromMap = async (lat, lng) => {
  return new Promise((resolve) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.log('카카오 지도 API가 없어 기본 방식 사용');
      resolve(findClosestBuildingFallback(lat, lng));
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    const searchOptions = {
      location: new window.kakao.maps.LatLng(lat, lng),
      radius: 100, // 100m 반경 내에서 검색
      sort: window.kakao.maps.services.SortBy.DISTANCE
    };

    // 경복궁 관련 키워드들로 검색
    const keywords = ['경복궁', '근정전', '경회루', '사정전', '강녕전', '교태전', '자경전'];
    let foundBuildings = [];
    let searchCount = 0;

    const searchComplete = () => {
      searchCount++;
      if (searchCount >= keywords.length) {
        // 모든 검색 완료 후 가장 가까운 건물 반환
        if (foundBuildings.length > 0) {
          // 거리순 정렬
          foundBuildings.sort((a, b) => a.distance - b.distance);
          const closest = foundBuildings[0];

          console.log('지도에서 찾은 건물:', closest.name, `(${closest.distance}m)`);
          resolve(closest);
        } else {
          console.log('지도에서 건물을 찾지 못해 기본 방식 사용');
          resolve(findClosestBuildingFallback(lat, lng));
        }
      }
    };

    // 각 키워드로 검색 실행
    keywords.forEach(keyword => {
      ps.keywordSearch(keyword, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
          data.forEach(place => {
            const distance = calculateDistance(lat, lng, parseFloat(place.y), parseFloat(place.x));

            // 200m 이내의 경복궁 관련 장소만 추가
            if (distance <= 200 && place.place_name.includes('경복궁')) {
              // 기존 건물 데이터와 매칭
              const matchedBuilding = findMatchingBuilding(place.place_name);
              if (matchedBuilding) {
                foundBuildings.push({
                  ...matchedBuilding,
                  distance: Math.round(distance),
                  mapData: {
                    name: place.place_name,
                    address: place.road_address_name || place.address_name,
                    coordinates: { lat: parseFloat(place.y), lng: parseFloat(place.x) }
                  }
                });
              }
            }
          });
        }
        searchComplete();
      }, searchOptions);
    });
  });
};

// 장소명으로 기존 건물 데이터와 매칭
export const findMatchingBuilding = (placeName) => {
  const nameMapping = {
    '경회루': 'gyeonghoeru',
    '근정전': 'geunjeongjeon',
    '사정전': 'sajeongjeon',
    '강녕전': 'gangnyeongjeon',
    '교태전': 'gyotaejeon',
    '자경전': 'jagyeongjeon',
    '수정전': 'sujeongjeon',
    '천추전': 'cheonchujeon',
    '연영당': 'yeongyeongdang',
    '창덕재': 'changdeokjae',
    '집경당': 'jipgyeongdang',
    '보현당': 'bohyeondang',
    '문정당': 'munjeongdang',
    '향원정': 'hyangwonjeong',
    '건청궁': 'geoncheonggung',
    '근정문': 'geunjeongmun',
    '영제교': 'yeongjegyo',
    '소주방': 'sojubang',
    '내소주방': 'naesojubang',
    '홍문관': 'hongmungwan',
    '규장각': 'gyujanggak',
    '함화당': 'hamhwadang',
    '정전': 'jeongjeon',
    '민정문': 'minjeongmun',
    '인정당': 'injeongdang',
    '선원전': 'seonwonjeon'
  };

  // 장소명에서 건물명 추출
  for (const [buildingName, buildingId] of Object.entries(nameMapping)) {
    if (placeName.includes(buildingName)) {
      return gyeongbokgungBuildings[buildingId];
    }
  }

  // 매칭되지 않으면 경복궁 일반 정보 반환
  if (placeName.includes('경복궁')) {
    return {
      id: 'gyeongbokgung_general',
      name: '경복궁',
      coordinates: { lat: 37.5796, lng: 126.9770 }
    };
  }

  return null;
};

// 기본 방식 (기존 방식)
export const findClosestBuildingFallback = (lat, lng) => {
  let closestBuilding = null;
  let closestDistance = Infinity;

  for (const [, building] of Object.entries(gyeongbokgungBuildings)) {
    const distance = calculateDistance(lat, lng, building.coordinates.lat, building.coordinates.lng);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestBuilding = {
        ...building,
        distance: distance
      };
    }
  }

  return closestBuilding;
};