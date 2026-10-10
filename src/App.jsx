import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import BottomNav from './components/BottomNav';
import MyPageFlow from './pages/mypage/MyPageFlow';
import LoginPage from './pages/LoginPage';
import SignupFlow from './pages/SignupFlow';
import { updateProfile } from './api/user';
import { saveUserProfile } from './api/auth';

function App() {
  const [session, setSession] = useState(null);
  // 변수 명세서: activeScreen(현재 화면), authMode(login / signup), isLoggedIn
  const [activeScreen, setActiveScreen] = useState('auth'); // 'auth' | 'main'
  const [authMode, setAuthMode] = useState('login');
  const [authNotice, setAuthNotice] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 하단 메뉴 선택 (변수 명세서 activeTab: walk / recommended / records / myPage)
  const [activeTab, setActiveTab] = useState('recommended');
  const [myPageResetKey, setMyPageResetKey] = useState(0);

  const handleTabChange = (tab) => {
    if (tab === 'myPage') setMyPageResetKey((key) => key + 1);
    setActiveTab(tab);
  };

  // 로그인 상태 구독
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 로그인 · 회원가입 화면 (하단 메뉴 없이 전체 화면)
  if (activeScreen === 'auth') {
    if (authMode === 'signup') {
      return (
        <SignupFlow
          onBack={() => setAuthMode('login')}
          onComplete={async (form) => {
            try {
              // 백엔드로 건강 프로필 데이터 전송
              await saveUserProfile({
                userId: session?.user?.id || form.loginId,
                name: form.name,
                birth: form.birthDate,
                allergies: form.allergies,
                diseases: form.diseaseIds,
                medications: form.medications,
                noAllergy: form.noAllergy,
                noDisease: form.noDisease,
                noMedication: form.noMedication
              });
            } catch (apiErr) {
              console.warn('백엔드 프로필 저장 대기:', apiErr.message);
            }
            await updateProfile(null, { userName: form.name, email: form.email, birthDate: form.birthDate, allergies: form.allergies, diseaseIds: form.diseaseIds, medications: form.medications });
            setAuthNotice('가입 정보 입력이 완료됐어요. 로그인해 주세요.');
            setAuthMode('login');
          }}
        />
      );
    }
    return (
      <LoginPage
        initialNotice={authNotice}
        onSignup={() => { setAuthNotice(''); setAuthMode('signup'); }}
        onLogin={() => { setIsLoggedIn(true); setActiveScreen('main'); }}
        onSkip={() => setActiveScreen('main')}
      />
    );
  }

  const goToLogin = () => { setAuthNotice(''); setAuthMode('login'); setActiveScreen('auth'); };

  return (
    <div style={{ maxWidth: '420px', minHeight: '100vh', margin: '0 auto', display: 'flex', flexDirection: 'column', background: '#fff', boxShadow: '0 0 0 1px #eee' }}>
      <main style={{ flex: 1 }}>
        {activeTab === 'myPage' && <MyPageFlow session={session} resetKey={myPageResetKey} isLoggedIn={isLoggedIn} onLogin={goToLogin} onLogout={() => setIsLoggedIn(false)} />}

        {activeTab === 'walk' && <ComingSoon name="산책" />}
        {activeTab === 'recommended' && <ComingSoon name="홈" />}
      </main>
      <BottomNav activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}

// 아직 만들지 않은 탭에 보여주는 안내
function ComingSoon({ name }) {
  return (
    <p style={{ marginTop: '80px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
      {name} 화면은 구현 예정이에요
    </p>
  );
}

export default App;
