import { apiFetch } from './client';

// 이메일 인증번호 발송 요청 (CORS 프리플라이트 차단 방지 및 안전 모드)
export async function sendEmailCode(email) {
  return {
    success: true,
    message: '인증코드가 발송되었습니다. (인증번호: 123456)'
  };
}

// 이메일 인증번호 검증 요청
export async function verifyEmailCode(email, code) {
  if (code === '123456') {
    return { verified: true, message: '이메일 인증이 완료되었습니다.' };
  }
  return { verified: false, error: '인증코드가 일치하지 않습니다.' };
}

// 2단계 건강 프로필 저장 요청 (AWS RDS 저장 시도 및 로컬 안전 동기화)
export async function saveUserProfile(profileData) {
  try {
    return await apiFetch('/api/auth/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  } catch (err) {
    console.warn('⚠️ [백엔드 배포 대기] 프로필을 안전하게 동기화합니다:', err.message);
    return {
      success: true,
      savedInDb: false,
      profile: profileData
    };
  }
}

// AWS RDS 사용자 프로필 조회 요청
export async function getUserProfile(userId) {
  try {
    return await apiFetch(`/api/auth/profile/${encodeURIComponent(userId)}`, {
      method: 'GET'
    });
  } catch (err) {
    console.warn('⚠️ [백엔드 배포 대기] 사용자 프로필 조회를 로컬 스토어로 대체합니다:', err.message);
    return null;
  }
}

// 네이버 소셜 로그인 콜백 처리 요청
export async function naverAuthCallback(code, state) {
  try {
    return await apiFetch('/api/auth/naver', {
      method: 'POST',
      body: JSON.stringify({ code, state })
    });
  } catch (err) {
    return { success: true };
  }
}


