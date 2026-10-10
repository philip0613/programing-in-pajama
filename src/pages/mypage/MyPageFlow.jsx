import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../api/user';
import MyPage from './MyPage';
import ProfileEditPage from './ProfileEditPage';
import DiseaseSelectPage from './DiseaseSelectPage';
import './mypage.css';

// 마이페이지 탭 전체 (No.10 → No.11 / No.12)
// 변수: activeScreen, isLoading, error, toast, isLoggedIn (변수 명세서 01·02)
function MyPageFlow({ session, resetKey, isLoggedIn, onLogin, onLogout }) {
  const [activeScreen, setActiveScreen] = useState('myPage');
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // 하단 메뉴에서 마이페이지를 다시 누르면 첫 화면으로
  useEffect(() => setActiveScreen('myPage'), [resetKey]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getProfile(session?.access_token)
      .then(setProfile)
      .catch((err) => {
        console.warn('⚠️ [마이페이지] 프로필 로드 실패:', err);
        setError('정보를 불러오지 못했어요');
      })
      .finally(() => setIsLoading(false));
  }, [session, resetKey, isLoggedIn]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSave = async (changes) => {
    setIsLoading(true);
    try {
      setProfile(await updateProfile(session?.access_token, changes));
      setToast('저장했어요');
      setActiveScreen('myPage');
    } catch {
      setToast('저장하지 못했어요. 다시 시도해 주세요');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (screen) => {
    if (screen === 'medications') return setToast('복용 약물 관리는 준비 중이에요');
    setActiveScreen(screen);
  };

  let content;
  if (error) content = <p className="mp-state">{error}</p>;
  else if (!profile) content = <p className="mp-state">불러오는 중...</p>;
  else if (activeScreen === 'profileEdit') content = <ProfileEditPage profile={profile} isLoading={isLoading} onSave={handleSave} />;
  else if (activeScreen === 'diseaseSelect') content = <DiseaseSelectPage profile={profile} isLoading={isLoading} onSave={handleSave} />;
  else {
    content = (
      <MyPage
        profile={profile}
        isLoggedIn={isLoggedIn}
        onNavigate={handleNavigate}
        onLogout={() => { onLogout(); setToast('로그아웃했어요'); }}
        onLogin={onLogin}
      />
    );
  }

  return (
    <div className="mp-screen">
      {content}
      {toast && <div className="mp-toast" role="status">{toast}</div>}
    </div>
  );
}

export default MyPageFlow;
