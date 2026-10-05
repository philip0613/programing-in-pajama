import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://program-in-pazama.onrender.com';

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. 현재 로그인 세션 상태 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 회원가입
  const handleSignUp = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(`회원가입 실패: ${error.message}`);
    else setMessage('회원가입 완료! 확인 메일을 확인하거나 바로 로그인해 보세요.');
    setLoading(false);
  };

  // 3. 로그인
  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(`로그인 실패: ${error.message}`);
    setLoading(false);
  };

  // 4. 로그아웃
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setApiResponse(null);
    setMessage('로그아웃되었습니다.');
  };

  // 5. Render 백엔드로 Supabase 토큰을 실어 API 요청 보내기
  const callProtectedApi = async () => {
    if (!session) {
      alert('먼저 로그인을 해주세요.');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/protected`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Supabase JWT 토큰 전송
        }
      });

      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      setApiResponse({ error: err.message });
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <h2>🚀 SOYO 풀스택 연동 테스트</h2>

      {session ? (
        <div style={{ padding: '16px', background: '#eef9ff', borderRadius: '8px', marginBottom: '20px' }}>
          <p><strong>로그인된 계정:</strong> {session.user.email}</p>
          <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            로그아웃
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '10px' }}
          />
          <input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleLogin} disabled={loading} style={{ flex: 1, padding: '10px', cursor: 'pointer' }}>
              로그인
            </button>
            <button onClick={handleSignUp} disabled={loading} style={{ flex: 1, padding: '10px', cursor: 'pointer' }}>
              회원가입
            </button>
          </div>
        </div>
      )}

      {message && <p style={{ color: '#d63031', fontSize: '14px' }}>{message}</p>}

      <hr style={{ margin: '24px 0' }} />

      <h3>백엔드(Render) 인증 API 통신 테스트</h3>
      <button
        onClick={callProtectedApi}
        disabled={!session}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: session ? '#0984e3' : '#b2bec3',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: session ? 'pointer' : 'not-allowed'
        }}
      >
        인증 토큰 실어서 백엔드 호출하기
      </button>

      {apiResponse && (
        <pre style={{ marginTop: '16px', padding: '12px', background: '#f1f2f6', borderRadius: '6px', overflowX: 'auto' }}>
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
