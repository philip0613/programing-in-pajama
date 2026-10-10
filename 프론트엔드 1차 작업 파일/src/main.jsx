import React from 'react';
import { createRoot } from 'react-dom/client';
import LoginPage from './LoginPage.jsx';
import SignupFlow from './SignupFlow.jsx';
import './styles.css';

function App() {
  const [screen, setScreen] = React.useState('login');
  const [notice, setNotice] = React.useState('');

  if (screen === 'signup') return <SignupFlow onBack={() => setScreen('login')} onComplete={() => { setScreen('login'); setNotice('정보 입력이 완료됐어요. 계정 등록은 서버 연결 후 사용할 수 있어요.'); }} />;
  return <LoginPage onSignup={() => { setNotice(''); setScreen('signup'); }} initialNotice={notice} />;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
