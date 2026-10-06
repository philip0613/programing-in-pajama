import React from 'react';

// 게시글 목록
function PostList({ posts }) {
  return (
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
  );
}

export default PostList;
