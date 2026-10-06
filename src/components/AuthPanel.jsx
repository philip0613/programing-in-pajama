import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

// 로그인 / 로그아웃 영역
function AuthPanel({ session }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');

  const handleLogin = async () => {
    setAuthMsg('');
    if (!supabase) return setAuthMsg('Supabase 환경 변수가 설정되지 않아 로그인할 수 없습니다.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthMsg(`로그인 실패: ${error.message}`);
  };

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
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
            />
            <button onClick={handleLogin} style={{ padding: '8px 16px', cursor: 'pointer' }}>로그인</button>
          </div>
          {authMsg && <p style={{ color: '#e74c3c', fontSize: '13px', margin: 0 }}>{authMsg}</p>}
        </div>
      )}
    </section>
  );
}

export default AuthPanel;
