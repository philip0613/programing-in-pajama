import { apiFetch, USE_MOCK } from './client';
import { mockGetPosts, mockCreatePost } from '../mocks/posts';

// GET /api/posts — 게시글 목록
export const getPosts = () => (USE_MOCK ? mockGetPosts() : apiFetch('/api/posts'));

// POST /api/posts — 게시글 작성 (로그인 토큰 필요)
export const createPost = (token, { title, content }) =>
  USE_MOCK
    ? mockCreatePost({ title, content })
    : apiFetch('/api/posts', {
        method: 'POST',
        token,
        body: JSON.stringify({ title, content })
      });
