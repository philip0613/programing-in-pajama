import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

// 로그인 / 회원가입 / 로그아웃 영역
function AuthPanel({ session }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // 회원가입 핸들러
  const handleSignUp = async () => {
    if (!supabase) return setAuthMsg('Supabase 환경 변수가 설정되지 않아 회원가입할 수 없습니다.');
    if (!email || !password) return setAuthMsg('이메일과 비밀번호를 모두 입력해주세요.');
    setAuthLoading(true);
    setAuthMsg('');

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthMsg(`회원가입 실패: ${error.message}`);
    } else {
      setAuthMsg('회원가입 완료! 이제 로그인 버튼을 눌러보세요.');
    }
    setAuthLoading(false);
  };

  // 로그인 핸들러
  const handleLogin = async () => {
    if (!supabase) return setAuthMsg('Supabase 환경 변수가 설정되지 않아 로그인할 수 없습니다.');
    if (!email || !password) return setAuthMsg('이메일과 비밀번호를 모두 입력해주세요.');
    setAuthLoading(true);
    setAuthMsg('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthMsg(`로그인 실패: ${error.message}`);
    }
    setAuthLoading(false);
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthMsg('로그아웃되었습니다.');
  };

  return (
    <section style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '24px' }}>
      {session ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>{session.user.email}</strong> 님 환영합니다!</span>
          <button onClick={handleLogout} style={{ padding: '6px 12px', cursor: 'pointer' }}>로그아웃</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ flex: '1 1 100%', minWidth: 0, padding: '10px', boxSizing: 'border-box' }}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ flex: '1 1 100%', minWidth: 0, padding: '10px', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleLogin}
              disabled={authLoading}
              style={{ flex: 1, padding: '10px', cursor: 'pointer' }}
            >
              로그인
            </button>
            <button
              onClick={handleSignUp}
              disabled={authLoading}
              style={{ flex: 1, padding: '10px', cursor: 'pointer', backgroundColor: '#e9ecef', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              회원가입
            </button>
          </div>
          {authMsg && (
            <p style={{ color: authMsg.includes('실패') || authMsg.includes('없습니다') ? '#e74c3c' : '#2ecc71', fontSize: '13px', margin: 0 }}>
              {authMsg}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default AuthPanel;
