// 백엔드 GET/PUT /api/user/profile 이 완성되기 전까지 사용하는 가짜 회원 정보
// 변수 이름은 변수 명세서(02 건강 정보와 내 정보)를 따릅니다.
let mockProfile = {
  userName: '홍길동',
  email: 'korean1234@gmail.com',
  profileImage: null,
  birthDate: '2000-01-01', // DB user_profiles.birth_date
  allergies: [], // DB user_profiles.allergies
  diseaseIds: ['D05'],
  medications: ['메트포르민', '아스피린', '오메가3'],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockGetProfile = async () => {
  await delay(300);
  return { ...mockProfile };
};

export const mockUpdateProfile = async (changes) => {
  await delay(300);
  mockProfile = { ...mockProfile, ...changes };
  return { ...mockProfile };
};
