import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { USE_MOCK } from './api/client';
import { getPosts } from './api/posts';
import ApiHealthCheck from './components/ApiHealthCheck';
import AuthPanel from './components/AuthPanel';
import PostForm from './components/PostForm';
import PostList from './components/PostList';

function App() {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);

  // 로그인 상태 구독
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 게시글 목록 불러오기
  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error('게시글 로드 실패:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>🚀 SOYO 미니 게시판</h2>

      {USE_MOCK
        ? <p style={{ padding: '8px 12px', background: '#ffeaa7', borderRadius: '6px', fontSize: '13px' }}>🧪 목(mock) 모드: 백엔드 대신 가짜 데이터를 사용 중</p>
        : <ApiHealthCheck />}
      <AuthPanel session={session} />
      {/* 목 모드에서는 로그인 없이도 글 작성 화면을 개발할 수 있음 */}
      {(session || USE_MOCK) && <PostForm token={session?.access_token} onCreated={fetchPosts} />}
      <PostList posts={posts} />
    </div>
  );
}

export default App;
