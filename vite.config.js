import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 백엔드 CORS 허용 목록과 맞추기 위해 포트 고정 (사용 중이면 다른 포트로 바꾸지 않고 에러)
  server: { port: 5173, strictPort: true },
});
