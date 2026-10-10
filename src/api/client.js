// 백엔드 API 주소는 환경 변수(VITE_BACKEND_URL)로만 관리합니다.
export const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

// true 이면 백엔드 대신 src/mocks 의 가짜 데이터를 사용
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

if (!API_BASE_URL) {
  console.warn('VITE_BACKEND_URL이 설정되지 않았습니다. .env.example을 참고해 .env를 만들어주세요.');
}

export async function apiFetch(path, { token, headers, ...options } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });

  const data = await res.json().catch(() => null);
  // 새 응답 형식 { success, data, error } 의 실패(success: false)도 에러로 처리
  if (!res.ok || data?.success === false) {
    throw new ApiError(data?.error, res.status);
  }
  return data;
}

// 새 응답 형식 { success, data, error } 에서 data 만 꺼내기
// (기존 형식을 같이 쓰는 /api/test 같은 곳은 apiFetch 를 그대로 쓰세요)
export const apiData = (path, options) => apiFetch(path, options).then((res) => res?.data);

// 서버 에러 — 기존 형식(글자)과 새 형식({ title, code, message }) 모두 처리
export class ApiError extends Error {
  constructor(error, status) {
    const isObject = error && typeof error === 'object';
    super((isObject ? error.message : error) || `요청 실패 (HTTP ${status})`);
    this.status = status;
    this.code = isObject ? error.code ?? null : null;   // 예: 'WRONG_PASSWORD' (화면별로 다르게 처리할 때)
    this.title = isObject ? error.title ?? null : null; // 예: '로그인 실패'
  }
}

// 백엔드 연결 테스트 (GET /api/test)
export const checkHealth = () => apiFetch('/api/test');
