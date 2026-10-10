import { mockGetProfile, mockUpdateProfile } from '../mocks/user';

// 회원 정보 API (변수 명세서: GET /api/user/profile 조회 · PUT /api/user/profile 수정)
// 백엔드가 아직 없어서 지금은 가짜 데이터를 씁니다.
// 백엔드가 완성되면 아래 두 줄을 주석 처리된 코드로 바꾸면 돼요. (응답은 { success, data, error } 형식)
export const getProfile = () => mockGetProfile();
export const updateProfile = (token, changes) => mockUpdateProfile(changes);

// import { apiData } from './client';
// export const getProfile = (token) => apiData('/api/user/profile', { token });
// export const updateProfile = (token, changes) =>
//   apiData('/api/user/profile', { method: 'PUT', token, body: JSON.stringify(changes) });
