// VITE_USE_MOCK=true 일 때 백엔드 대신 사용하는 가짜 데이터
// 응답 형태는 백엔드 docs/API.md 와 같게 유지하세요.
let mockPosts = [
  {
    id: 2,
    user_id: 'mock-user',
    user_email: 'friend@example.com',
    title: '목(mock) 데이터 예시 글',
    content: '백엔드 없이도 화면 개발을 할 수 있어요.',
    created_at: new Date().toISOString()
  },
  {
    id: 1,
    user_id: 'mock-user',
    user_email: 'friend@example.com',
    title: '첫 번째 글',
    content: '.env 에서 VITE_USE_MOCK=false 로 바꾸면 실제 백엔드를 사용합니다.',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockGetPosts = async () => [...mockPosts];

export const mockCreatePost = async ({ title, content }) => {
  const post = {
    id: Date.now(),
    user_id: 'mock-user',
    user_email: 'me@example.com',
    title,
    content,
    created_at: new Date().toISOString()
  };
  mockPosts = [post, ...mockPosts];
  return post;
};
