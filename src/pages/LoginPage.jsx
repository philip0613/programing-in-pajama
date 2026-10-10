import { useState } from 'react';
import { supabase } from '../supabaseClient';

// 로그인 화면 — 카카오, 구글 소셜 로그인 지원
const socialLogins = [
  { name: '카카오', image: '/pic/카카오톡.png', className: 'kakao', provider: 'kakao' },
  { name: '구글', image: '/pic/구글.png', className: 'google', provider: 'google' },
];

export default function LoginPage({ onSignup, onLogin, onSkip, initialNotice = '' }) {
  const [loginId, setLoginId] = useState(() => localStorage.getItem('soyo-saved-id') ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberId, setRememberId] = useState(Boolean(localStorage.getItem('soyo-saved-id')));
  const [authMessage, setAuthMessage] = useState(initialNotice);

  function handleLogin(event) {
    event.preventDefault();
    if (rememberId) localStorage.setItem('soyo-saved-id', loginId);
    else localStorage.removeItem('soyo-saved-id');
    if (!loginId || !password) return setAuthMessage('아이디와 비밀번호를 입력해 주세요.');
    onLogin({ loginId }); // 시연용 로그인
  }

  function showNotice(text) {
    setAuthMessage(text);
  }

  async function handleSocialLogin(provider) {
    if (!supabase) {
      return showNotice('Supabase 클라이언트가 설정되지 않았습니다.');
    }
    showNotice(`${provider === 'kakao' ? '카카오' : '구글'} 로그인으로 이동 중...`);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      showNotice(`로그인 오류: ${error.message}`);
    }
  }

  return (
    <main className="page-shell">
      <section className="login-card" aria-labelledby="login-title">
        <img className="brand-logo" src="/pic/SOYO.png" alt="SOYO" />

        <header className="heading">
          <h1 id="login-title">로그인</h1>
          <p>나에게 맞는 산책을 시작해 보세요</p>
        </header>

        <form onSubmit={handleLogin}>
          <label className="visually-hidden" htmlFor="user-id">아이디</label>
          <input
            id="user-id"
            className="text-input"
            type="text"
            placeholder="아이디"
            autoComplete="username"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
          />

          <label className="visually-hidden" htmlFor="user-password">비밀번호</label>
          <div className="password-wrap">
            <input
              id="user-password"
              className="text-input password-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              className="eye-button"
              type="button"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.7" />
              </svg>
            </button>
          </div>

          <div className="form-options">
            <label className="remember-option">
              <input type="checkbox" checked={rememberId} onChange={(event) => setRememberId(event.target.checked)} />
              <span>내 로그인 정보 기억하기</span>
            </label>
            <button className="text-button find-button" type="button" onClick={() => showNotice('아이디/비밀번호 찾기는 준비 중이에요.')}>아이디/비밀번호 찾기</button>
          </div>

          {authMessage && <p className="form-message" role="status">{authMessage}</p>}
          <button className="primary-button" type="submit">로그인</button>
        </form>

        <div className="social-section">
          <p className="social-caption">또는 소셜 계정으로 로그인</p>
          <div className="social-buttons">
            {socialLogins.map((social) => (
              <button
                key={social.name}
                className={`social-button ${social.className}`}
                type="button"
                aria-label={`${social.name} 로그인`}
                onClick={() => handleSocialLogin(social.provider)}
              >
                <img src={social.image} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="bottom-actions">
          <button className="signup-button" type="button" onClick={onSignup}>회원가입</button>
          <button className="text-button skip-button" type="button" onClick={onSkip}>건너뛰기</button>
        </div>
      </section>
    </main>
  );
}
