import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { apiFetch } from './api/client';
import ApiHealthCheck from './components/ApiHealthCheck';

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');
  
  // 게시판 상태
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  // 1. 로그인 상태 구독
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 2. 게시글 목록 불러오기 함수
  const fetchPosts = async () => {
    try {
      const data = await apiFetch('/api/posts');
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error('게시글 로드 실패:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 3. 인증 관련 핸들러
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

  // 4. 글 작성 핸들러
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('제목과 내용을 입력해주세요.');
    if (!session) return alert('로그인이 필요합니다.');

    setPostLoading(true);
    try {
      await apiFetch('/api/posts', {
        method: 'POST',
        token: session.access_token,
        body: JSON.stringify({ title, content })
      });

      setTitle('');
      setContent('');
      await fetchPosts(); // 목록 갱신
    } catch (err) {
      alert(err.message);
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>🚀 SOYO 미니 게시판</h2>

      <ApiHealthCheck />
      {/* 로그인 영역 */}
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

      {/* 글 작성 영역 */}
      {session && (
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          <h3>새 글 작성</h3>
          <input
            type="text"
            placeholder="글 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '10px', fontSize: '14px' }}
          />
          <textarea
            placeholder="내용을 작성하세요..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ padding: '10px', fontSize: '14px', resize: 'vertical' }}
          />
          <button
            type="submit"
            disabled={postLoading}
            style={{
              padding: '12px',
              backgroundColor: '#0984e3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {postLoading ? '저장 중...' : '게시글 등록 (AWS RDS 저장)'}
          </button>
        </form>
      )}

      {/* 게시글 목록 영역 */}
      <section>
        <h3>게시글 목록 ({posts.length}개)</h3>
        {posts.length === 0 ? (
          <p style={{ color: '#888' }}>등록된 게시글이 없습니다. 첫 글을 작성해 보세요!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.map((post) => (
              <div key={post.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>{post.title}</h4>
                <p style={{ margin: '0 0 12px 0', whiteSpace: 'pre-wrap', color: '#333' }}>{post.content}</p>
                <div style={{ fontSize: '12px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                  <span>작성자: {post.user_email}</span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
