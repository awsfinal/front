// 서울 주요 지하철역 데이터
export const subwayStations = [
  // 1호선
  { id: 'jonggak', name: '종각', nameEn: 'Jonggak', lat: 37.5703, lng: 126.9826, lines: ['1', '3'] },
  { id: 'jongno3ga', name: '종로3가', nameEn: 'Jongno 3-ga', lat: 37.5717, lng: 126.9917, lines: ['1', '3', '5'] },
  { id: 'dongdaemun', name: '동대문', nameEn: 'Dongdaemun', lat: 37.5714, lng: 127.0098, lines: ['1', '4'] },
  { id: 'seoul', name: '서울역', nameEn: 'Seoul Station', lat: 37.5547, lng: 126.9707, lines: ['1', '4', 'KTX'] },
  { id: 'city_hall', name: '시청', nameEn: 'City Hall', lat: 37.5658, lng: 126.9784, lines: ['1', '2'] },
  
  // 2호선
  { id: 'euljiro1ga', name: '을지로입구', nameEn: 'Euljiro 1-ga', lat: 37.5663, lng: 126.9820, lines: ['2'] },
  { id: 'euljiro3ga', name: '을지로3가', nameEn: 'Euljiro 3-ga', lat: 37.5663, lng: 126.9915, lines: ['2', '3'] },
  { id: 'dongdaemun_history', name: '동대문역사문화공원', nameEn: 'Dongdaemun History & Culture Park', lat: 37.5652, lng: 127.0079, lines: ['2', '4', '5'] },
  { id: 'hongik', name: '홍대입구', nameEn: 'Hongik Univ.', lat: 37.5572, lng: 126.9240, lines: ['2', '6', 'A'] },
  { id: 'gangnam', name: '강남', nameEn: 'Gangnam', lat: 37.4979, lng: 127.0276, lines: ['2'] },
  
  // 3호선
  { id: 'anguk', name: '안국', nameEn: 'Anguk', lat: 37.5759, lng: 126.9852, lines: ['3'] },
  { id: 'gyeongbokgung', name: '경복궁', nameEn: 'Gyeongbokgung', lat: 37.5759, lng: 126.9731, lines: ['3'] },
  { id: 'jongno5ga', name: '종로5가', nameEn: 'Jongno 5-ga', lat: 37.5717, lng: 127.0041, lines: ['3'] },
  
  // 4호선
  { id: 'myeongdong', name: '명동', nameEn: 'Myeong-dong', lat: 37.5608, lng: 126.9867, lines: ['4'] },
  { id: 'dongdaemun4', name: '동대문', nameEn: 'Dongdaemun', lat: 37.5714, lng: 127.0098, lines: ['1', '4'] },
  
  // 5호선
  { id: 'gwanghwamun', name: '광화문', nameEn: 'Gwanghwamun', lat: 37.5720, lng: 126.9762, lines: ['5'] },
  { id: 'jongno3ga5', name: '종로3가', nameEn: 'Jongno 3-ga', lat: 37.5717, lng: 126.9917, lines: ['1', '3', '5'] },
  { id: 'eulji4ga', name: '을지4가', nameEn: 'Euljiro 4-ga', lat: 37.5663, lng: 126.9975, lines: ['5'] },
  
  // 6호선
  { id: 'hapjeong', name: '합정', nameEn: 'Hapjeong', lat: 37.5495, lng: 126.9135, lines: ['2', '6'] },
  { id: 'sangsu', name: '상수', nameEn: 'Sangsu', lat: 37.5479, lng: 126.9227, lines: ['6'] },
  
  // 경의중앙선
  { id: 'gongdeok', name: '공덕', nameEn: 'Gongdeok', lat: 37.5447, lng: 126.9492, lines: ['5', '6', 'K'] },
  { id: 'hongdae', name: '홍대입구', nameEn: 'Hongik Univ.', lat: 37.5572, lng: 126.9240, lines: ['2', '6', 'A'] },
  
  // 공항철도
  { id: 'hongdae_arex', name: '홍대입구', nameEn: 'Hongik Univ.', lat: 37.5572, lng: 126.9240, lines: ['2', '6', 'A'] },
  { id: 'gongdeok_arex', name: '공덕', nameEn: 'Gongdeok', lat: 37.5447, lng: 126.9492, lines: ['5', '6', 'A'] },
  
  // 9호선
  { id: 'yeouido', name: '여의도', nameEn: 'Yeouido', lat: 37.5219, lng: 126.9245, lines: ['5', '9'] },
  { id: 'noryangjin', name: '노량진', nameEn: 'Noryangjin', lat: 37.5142, lng: 126.9424, lines: ['1', '9'] }
];

// 지하철 노선별 색상
export const lineColors = {
  '1': '#0052A4',  // 파란색
  '2': '#00A84D',  // 초록색
  '3': '#EF7C1C',  // 주황색
  '4': '#00A5DE',  // 하늘색
  '5': '#996CAC',  // 보라색
  '6': '#CD7C2F',  // 갈색
  '7': '#747F00',  // 올리브색
  '8': '#E6186C',  // 분홍색
  '9': '#BDB092',  // 베이지색
  'K': '#77C4A3',  // 경의중앙선
  'A': '#0090D2',  // 공항철도
  'KTX': '#8B0000' // KTX
};

// 거리 계산 함수 (Haversine formula)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// 가장 가까운 지하철역 찾기
export const findNearestSubwayStation = (currentLat, currentLng, limit = 3) => {
  const stationsWithDistance = subwayStations.map(station => ({
    ...station,
    distance: calculateDistance(currentLat, currentLng, station.lat, station.lng)
  }));
  
  return stationsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};

// 거리 포맷팅
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
};
