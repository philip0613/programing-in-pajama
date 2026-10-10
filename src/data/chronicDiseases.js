// 이번 프로젝트에서 다루는 만성질환 목록 (출처: 학술제_만성질환_목록표.xlsx — WHO & 질병관리청 기준)
// 목록을 바꿀 때는 엑셀 파일과 백엔드 팀에도 같이 알려주세요.
// diseaseIds 에는 아래 disease 의 id 가 저장됩니다. (id 체계는 백엔드와 최종 확인 필요)

export const DISEASE_CATEGORIES = [
  {
    id: 'cardio',
    name: '심뇌혈관질환',
    diseases: [
      { id: 'D01', name: '고혈압' },
      { id: 'D02', name: '협심증 및 심근경색' },
      { id: 'D03', name: '뇌졸중 (뇌경색·뇌출혈)' },
      { id: 'D04', name: '심부전' },
    ],
  },
  {
    id: 'endocrine',
    name: '내분비·대사질환',
    diseases: [
      { id: 'D05', name: '당뇨병 (제2형)' },
      { id: 'D06', name: '이상지질혈증 (고지혈증)' },
      { id: 'D07', name: '통풍' },
      { id: 'D08', name: '갑상선 기능 이상 (저하/항진)' },
    ],
  },
  {
    id: 'respiratory',
    name: '만성 호흡기질환',
    diseases: [
      { id: 'D09', name: '만성 폐쇄성 폐질환 (COPD)' },
      { id: 'D10', name: '기관지 천식' },
      { id: 'D11', name: '만성 알레르기 비염' },
    ],
  },
  {
    id: 'musculoskeletal',
    name: '근골격계질환',
    diseases: [
      { id: 'D12', name: '퇴행성 관절염' },
      { id: 'D13', name: '골다공증' },
      { id: 'D14', name: '류마티스 관절염' },
      { id: 'D15', name: '만성 요통 및 추간판탈출증' },
    ],
  },
  {
    id: 'renal',
    name: '신장·비뇨기질환',
    diseases: [
      { id: 'D16', name: '만성 콩팥병 (만성 신부전)' },
      { id: 'D17', name: '전립선비대증' },
    ],
  },
  {
    id: 'digestive',
    name: '소화기·간질환',
    diseases: [
      { id: 'D18', name: '만성 B형·C형 간염' },
      { id: 'D19', name: '비알코올성 지방간질환' },
      { id: 'D20', name: '위식도역류질환 (GERD)' },
      { id: 'D21', name: '염증성 장질환 (크론병/궤양성대장염)' },
    ],
  },
  {
    id: 'neuro',
    name: '신경·정신질환',
    diseases: [
      { id: 'D22', name: '치매 (알츠하이머병)' },
      { id: 'D23', name: '파킨슨병' },
      { id: 'D24', name: '만성 우울장애' },
    ],
  },
  {
    id: 'cancer',
    name: '악성 신생물(암)',
    diseases: [
      { id: 'D25', name: '주요 고형암 (위/대장/폐/간/유방)' },
      { id: 'D26', name: '혈액암 (백혈병/림프종/골수종)' },
    ],
  },
];

// 변수 명세서의 diseaseList (질병 선택 목록) — 전체 질환을 한 줄로 펼친 목록
export const diseaseList = DISEASE_CATEGORIES.flatMap((category) => category.diseases);

export const getDiseaseName = (id) => diseaseList.find((disease) => disease.id === id)?.name ?? id;
