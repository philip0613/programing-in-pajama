import { apiFetch } from './client';

// 이메일 인증번호 발송 요청
export async function sendEmailCode(email) {
  return apiFetch('/api/auth/email/send-code', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

// 이메일 인증번호 검증 요청
export async function verifyEmailCode(email, code) {
  return apiFetch('/api/auth/email/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code })
  });
}

// 2단계 건강 프로필 저장 요청
export async function saveUserProfile(profileData) {
  return apiFetch('/api/auth/profile', {
    method: 'POST',
    body: JSON.stringify(profileData)
  });
}
