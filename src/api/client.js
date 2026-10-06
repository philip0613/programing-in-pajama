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
  if (!res.ok) {
    throw new Error(data?.error || `요청 실패 (HTTP ${res.status})`);
  }
  return data;
}

// 백엔드 연결 테스트 (GET /api/test)
export const checkHealth = () => apiFetch('/api/test');
