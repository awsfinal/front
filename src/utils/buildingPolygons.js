// 궁궐 건물 폴리곤 영역 데이터
export const buildingPolygons = [
  {
    id: 'eungjidang',
    name: '응지당',
    nameEn: 'Eungjidang',
    nw: [37.579595432157966, 126.97667876079947],
    se: [37.57955041200325, 126.9768287778653]
  },
  {
    id: 'gyeongseongjeon',
    name: '경성전',
    nameEn: 'Gyeongseongjeon',
    nw: [37.579534628470896, 126.97674670564773],
    se: [37.5793566949806, 126.97681185646736]
  },
  {
    id: 'gangnyeongjeon',
    name: '강녕전',
    nameEn: 'Gangnyeongjeon',
    nw: [37.57947608222901, 126.97684012187166],
    se: [37.57938156638848, 126.97729581968161]
  },
  {
    id: 'yeongildang',
    name: '연길당',
    nameEn: 'Yeongildang',
    nw: [37.579570782721284, 126.97733538567671],
    se: [37.579516750173134, 126.97747691427828]
  },
  {
    id: 'yeonsaengjeon',
    name: '연생전',
    nameEn: 'Yeonsaengjeon',
    nw: [37.579505456315, 126.97731276352641],
    se: [37.57932977662259, 126.97738640300386]
  },
  {
    id: 'hamwonjeon',
    name: '함원전',
    nameEn: 'Hamwonjeon',
    nw: [37.57997156848415, 126.97653430013388],
    se: [37.5799107922909, 126.97674092814219]
  },
  {
    id: 'heumgyeonggak',
    name: '흠경각',
    nameEn: 'Heumgyeonggak',
    nw: [37.57972153988065, 126.97652022734192],
    se: [37.5796810316051, 126.97670420635653]
  },
  {
    id: 'hamhonggak',
    name: '함홍각',
    nameEn: 'Hamhonggak',
    nw: [37.579897294638215, 126.97682867036573],
    se: [37.57987252951355, 126.9768909437149]
  },
  {
    id: 'gyotaejeon',
    name: '교태전',
    nameEn: 'Gyotaejeon',
    nw: [37.57989055382053, 126.97691358021297],
    se: [37.57982529770065, 126.97725323109862]
  },
  {
    id: 'cheonchujeon',
    name: '천추전',
    nameEn: 'Cheonchujeon',
    nw: [37.579081849944046, 126.97659967460333],
    se: [37.57900755370943, 126.97678083226626]
  },
  {
    id: 'sajeongjeon',
    name: '사정전',
    nameEn: 'Sajeongjeon',
    nw: [37.579045873149205, 126.97691950147181],
    se: [37.57898059787739, 126.97716009067494]
  },
  {
    id: 'manchunjeon',
    name: '만춘전',
    nameEn: 'Manchunjeon',
    nw: [37.579057211291925, 126.97731006930693],
    se: [37.57899192120716, 126.97747707237069]
  },
  {
    id: 'geungjeongjeon',
    name: '긍정전',
    nameEn: 'Geungjeongjeon',
    nw: [37.57881379918469, 126.97657428653042],
    se: [37.57796927076278, 126.9773613427869]
  },
  {
    id: 'saengmulbang',
    name: '생물방',
    nameEn: 'Saengmulbang',
    nw: [37.57981868396979, 126.97801174168946],
    se: [37.57957326773343, 126.9785806934287]
  },
  {
    id: 'naesojubang',
    name: '내소주방',
    nameEn: 'Naesojubang',
    nw: [37.57958887427102, 126.97771180306918],
    se: [37.57934565795998, 126.97798923889174]
  },
  {
    id: 'oesojubang',
    name: '외소주방',
    nameEn: 'Oesojubang',
    nw: [37.57956642252148, 126.97810238375722],
    se: [37.57934799194355, 126.97843075534465]
  },
  {
    id: 'jaseondang',
    name: '자선당',
    nameEn: 'Jaseondang',
    nw: [37.57912038087951, 126.97783647281683],
    se: [37.57893122337011, 126.97811106044927]
  },
  {
    id: 'bihyeongak',
    name: '비현각',
    nameEn: 'Bihyeongak',
    nw: [37.57910244983463, 126.97831478679606],
    se: [37.57891553753182, 126.97855540984938]
  },
  {
    id: 'jagyeongjeon',
    name: '자경전',
    nameEn: 'Jagyeongjeon',
    nw: [37.58025564111767, 126.97787859038306],
    se: [37.580149824427416, 126.97814749719116]
  },
  {
    id: 'heungbokjeon',
    name: '흥복전',
    nameEn: 'Heungbokjeon',
    nw: [37.580928868144134, 126.97650286640851],
    se: [37.580557351334214, 126.9772331963983]
  },
  {
    id: 'gyejodang',
    name: '계조당',
    nameEn: 'Gyejodang',
    nw: [37.57794005256122, 126.97769814362223],
    se: [37.57773738094997, 126.97797556142645]
  }
];

// 점이 사각형 폴리곤 안에 있는지 확인하는 함수
export const isPointInPolygon = (lat, lng, polygon) => {
  // GPS 오차를 고려한 여유 범위 (약 5미터)
  const buffer = 0.00005; // 약 5미터 정도의 여유

  // 북서(NW)와 남동(SE) 좌표를 이용한 사각형 영역 체크 (버퍼 적용)
  const northLat = polygon.nw[0] + buffer;  // 북쪽 위도 (확장)
  const westLng = polygon.nw[1] - buffer;   // 서쪽 경도 (확장)
  const southLat = polygon.se[0] - buffer;  // 남쪽 위도 (확장)
  const eastLng = polygon.se[1] + buffer;   // 동쪽 경도 (확장)

  console.log(`🔍 폴리곤 체크: ${polygon.name} (버퍼: ${buffer})`);
  console.log(`   GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  console.log(`   원본 - 북: ${polygon.nw[0].toFixed(6)}, 남: ${polygon.se[0].toFixed(6)}`);
  console.log(`   원본 - 서: ${polygon.nw[1].toFixed(6)}, 동: ${polygon.se[1].toFixed(6)}`);
  console.log(`   확장 - 북: ${northLat.toFixed(6)}, 남: ${southLat.toFixed(6)}`);
  console.log(`   확장 - 서: ${westLng.toFixed(6)}, 동: ${eastLng.toFixed(6)}`);

  const latInRange = lat <= northLat && lat >= southLat;
  const lngInRange = lng >= westLng && lng <= eastLng;

  console.log(`   위도 범위: ${latInRange} (${lat} <= ${northLat} && ${lat} >= ${southLat})`);
  console.log(`   경도 범위: ${lngInRange} (${lng} >= ${westLng} && ${lng} <= ${eastLng})`);

  // 점이 사각형 영역 안에 있는지 확인
  const isInside = latInRange && lngInRange;
  console.log(`   결과: ${isInside ? '✅ 내부' : '❌ 외부'}`);

  return isInside;
};

// GPS 위치로 해당하는 건물 폴리곤 찾기
export const findBuildingByPolygon = (lat, lng) => {
  console.log(`폴리곤 검색: 위치 ${lat.toFixed(6)}, ${lng.toFixed(6)}`);

  for (const polygon of buildingPolygons) {
    if (isPointInPolygon(lat, lng, polygon)) {
      console.log(`🎯 폴리곤 매칭 성공: ${polygon.name}`);
      return {
        id: polygon.id,
        name: polygon.name,
        nameEn: polygon.nameEn,
        coordinates: {
          // 폴리곤 중심점 계산
          lat: (polygon.nw[0] + polygon.se[0]) / 2,
          lng: (polygon.nw[1] + polygon.se[1]) / 2
        },
        distance: 0, // 폴리곤 안에 있으므로 거리는 0
        isInPolygon: true,
        polygonData: polygon
      };
    }
  }

  console.log('❌ 해당하는 폴리곤을 찾을 수 없습니다.');
  return null;
};

// 폴리곤 ID를 기존 건물 데이터 ID로 매핑
export const mapPolygonToBuilding = (polygonId) => {
  const mapping = {
    'eungjidang': 'eungjidang',
    'gyeongseongjeon': 'gyeongseungjeon', // 경성전
    'gangnyeongjeon': 'gangnyeongjeon',
    'yeongildang': 'yeongildang',
    'yeonsaengjeon': 'yeonsaengjeon',
    'hamwonjeon': 'hamwonjeon',
    'heumgyeonggak': 'heumgyeonggak',
    'hamhonggak': 'hamhonggak',
    'gyotaejeon': 'gyotaejeon',
    'cheonchujeon': 'cheonchujeon',
    'sajeongjeon': 'sajeongjeon',
    'manchunjeon': 'manchunjeon',
    'geungjeongjeon': 'geunjeongjeon', // 긍정전 -> 근정전
    'saengmulbang': 'saengmulbang',
    'naesojubang': 'naesojubang',
    'oesojubang': 'oesojubang',
    'jaseondang': 'jaseondang',
    'bihyeongak': 'bihyeongak',
    'jagyeongjeon': 'jagyeongjeon',
    'heungbokjeon': 'heungbokjeon',
    'gyejodang': 'gyejodang'
  };

  return mapping[polygonId] || polygonId;
};