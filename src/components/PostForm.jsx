import React, { useState } from 'react';
import { createPost } from '../api/posts';

// 새 글 작성 폼 — 등록에 성공하면 onCreated() 호출
function PostForm({ token, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('제목과 내용을 입력해주세요.');

    setLoading(true);
    try {
      await createPost(token, { title, content });
      setTitle('');
      setContent('');
      await onCreated();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
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
        disabled={loading}
        style={{
          padding: '12px',
          backgroundColor: '#0984e3',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        {loading ? '저장 중...' : '게시글 등록 (AWS RDS 저장)'}
      </button>
    </form>
  );
}

export default PostForm;
