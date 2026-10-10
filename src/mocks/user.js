// 사용자 프로필 스토어 (로컬스토리지 보존 및 가입 연동)
// 변수 이름은 변수 명세서(02 건강 정보와 내 정보)를 따릅니다.

const DEFAULT_PROFILE = {
  userName: '소요 여행자',
  email: '',
  profileImage: null,
  birthDate: '1970-01-01',
  allergies: [],
  diseaseIds: [],
  medications: [],
};

function loadStoredProfile() {
  try {
    const raw = localStorage.getItem('soyo-user-profile');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return DEFAULT_PROFILE;
}

let currentProfile = loadStoredProfile();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockGetProfile = async () => {
  await delay(150);
  currentProfile = loadStoredProfile();
  return { ...currentProfile };
};

export const mockUpdateProfile = async (changes) => {
  await delay(150);
  currentProfile = { ...currentProfile, ...changes };
  try {
    localStorage.setItem('soyo-user-profile', JSON.stringify(currentProfile));
  } catch (e) {
    // ignore
  }
  return { ...currentProfile };
};
