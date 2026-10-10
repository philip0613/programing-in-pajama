import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

console.log('%c🌿 [소요 SOYO 시스템 초기화 완료]', 'color: #16a34a; font-weight: bold; font-size: 13px;');
console.log('📌 프론트엔드가 정상 로드되었습니다. 버튼 클릭 및 유효성 검사 로그가 한국어로 출력됩니다.');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
