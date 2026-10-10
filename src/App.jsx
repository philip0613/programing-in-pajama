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
  const [signupDraft, setSignupDraft] = useState({ loginId: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 하단 메뉴 선택 (변수 명세서 activeTab: walk / recommended / records / myPage)
  const [activeTab, setActiveTab] = useState('recommended');
  const [myPageResetKey, setMyPageResetKey] = useState(0);

  // 브라우저 뒤로가기(Alt + ←, 브라우저 상단 뒤로가기 버튼) 히스토리 동기화
  useEffect(() => {
    // 최초 상태 저장
    if (!window.history.state) {
      window.history.replaceState({ activeScreen: 'auth', authMode: 'login', activeTab: 'recommended' }, '');
    }

    const handlePopState = (event) => {
      if (event.state) {
        if (event.state.activeScreen) setActiveScreen(event.state.activeScreen);
        if (event.state.authMode) setAuthMode(event.state.authMode);
        if (event.state.activeTab) setActiveTab(event.state.activeTab);
      } else {
        setActiveScreen('auth');
        setAuthMode('login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 화면 전환 시 브라우저 히스토리 스택에 push
  const navigateTo = (screen, mode = 'login', tab = activeTab) => {
    setActiveScreen(screen);
    setAuthMode(mode);
    if (tab) setActiveTab(tab);
    window.history.pushState({ activeScreen: screen, authMode: mode, activeTab: tab }, '');
  };

  const handleTabChange = (tab) => {
    if (tab === 'myPage') setMyPageResetKey((key) => key + 1);
    setActiveTab(tab);
    window.history.pushState({ activeScreen: 'main', authMode, activeTab: tab }, '');
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
          initialDraft={signupDraft}
          onBack={() => navigateTo('auth', 'login')}
          onComplete={async (form) => {
            const actualProfile = {
              userName: form.name,
              email: form.email,
              birthDate: form.birthDate,
              allergies: form.noAllergy ? [] : form.allergies,
              diseaseIds: form.noDisease ? [] : form.diseaseIds,
              medications: form.noMedication ? [] : form.medications
            };

            try {
              // 백엔드로 건강 프로필 데이터 전송
              await saveUserProfile({
                userId: session?.user?.id || form.loginId,
                name: form.name,
                birth: form.birthDate,
                allergies: actualProfile.allergies,
                diseases: actualProfile.diseaseIds,
                medications: actualProfile.medications,
                noAllergy: form.noAllergy,
                noDisease: form.noDisease,
                noMedication: form.noMedication
              });
            } catch (apiErr) {
              console.warn('백엔드 프로필 저장 대기:', apiErr.message);
            }

            // 실제 입력한 정보로 프로필 스토어 업데이트
            await updateProfile(null, actualProfile);

            // 가입 계정 로컬 목록에 저장
            try {
              const users = JSON.parse(localStorage.getItem('soyo-registered-users') || '[]');
              const filtered = users.filter((u) => u.loginId !== form.loginId);
              filtered.push({
                loginId: form.loginId,
                password: form.password,
                profile: actualProfile
              });
              localStorage.setItem('soyo-registered-users', JSON.stringify(filtered));
            } catch (e) {
              // ignore
            }

            // 가입 완료 후 로그인 화면으로 돌아가서 로그인하도록 안내
            setAuthNotice('회원가입이 완료되었습니다. 로그인해 주세요.');
            navigateTo('auth', 'login');
          }}
        />
      );
    }
    return (
      <LoginPage
        initialNotice={authNotice}
        onSignup={(draft) => {
          setAuthNotice('');
          setSignupDraft(draft || { loginId: '', password: '' });
          navigateTo('auth', 'signup');
        }}
        onLogin={async ({ loginId, user }) => {
          if (user?.profile) {
            await updateProfile(null, user.profile);
          }
          setIsLoggedIn(true);
          navigateTo('main', 'login', 'myPage'); // 로그인 성공 시 마이페이지로 이동
        }}
        onSkip={() => navigateTo('main', 'login', 'recommended')}
      />
    );
  }

  const goToLogin = () => {
    setAuthNotice('');
    navigateTo('auth', 'login');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthNotice('로그아웃되었습니다.');
    navigateTo('auth', 'login');
  };

  return (
    <div style={{ maxWidth: '420px', minHeight: '100vh', margin: '0 auto', display: 'flex', flexDirection: 'column', background: '#fff', boxShadow: '0 0 0 1px #eee' }}>
      <main style={{ flex: 1 }}>
        {activeTab === 'myPage' && (
          <MyPageFlow
            session={session}
            resetKey={myPageResetKey}
            isLoggedIn={isLoggedIn}
            onLogin={goToLogin}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'walk' && <ComingSoon name="산책" onBackToAuth={goToLogin} />}
        {activeTab === 'recommended' && <ComingSoon name="홈" onBackToAuth={goToLogin} />}
      </main>
      <BottomNav activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}

// 아직 만들지 않은 탭에 보여주는 안내 (상단 뒤로가기 헤더 포함)
function ComingSoon({ name, onBackToAuth }) {
  return (
    <div style={{ padding: '16px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
        <button
          type="button"
          onClick={onBackToAuth}
          style={{ background: 'none', border: 'none', fontSize: '14px', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', borderRadius: '4px' }}
        >
          ‹ 로그인 화면으로
        </button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>SOYO</span>
        <span style={{ width: '80px' }}></span>
      </header>
      <div style={{ marginTop: '100px', textAlign: 'center' }}>
        <p style={{ color: '#888', fontSize: '15px', lineHeight: 1.6 }}>
          <strong>{name}</strong> 화면은 구현 예정이에요.<br />
          아래 <strong>마이페이지(👤)</strong> 메뉴를 클릭해 보세요.
        </p>
      </div>
    </div>
  );
}

export default App;
