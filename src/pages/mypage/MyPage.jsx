import React from 'react';

// No.10 마이페이지
// 변수: userName, email, profileImage, isLoggedIn, myMenuItems, diseaseIds, medications
function MyPage({ profile, isLoggedIn, onNavigate, onLogout, onLogin }) {
  if (!isLoggedIn) {
    return (
      <div className="mp-page">
        <h1 className="mp-title">마이페이지</h1>
        <section className="mp-profile-card mp-logged-out">
          <p>로그인하면 내 정보와 건강 정보를 관리할 수 있어요.</p>
          <button type="button" className="mp-pill-button" onClick={onLogin}>로그인</button>
        </section>
      </div>
    );
  }

  const { userName, email, profileImage, diseaseIds = [], medications = [] } = profile;

  const myMenuItems = [
    { id: 'profileEdit', title: '회원정보 수정', description: '이름 · 생년월일' },
    {
      id: 'diseaseSelect',
      title: '건강정보 관리',
      description: diseaseIds.length > 0 ? `알레르기 · 기저질환 (${diseaseIds.length}개 선택)` : '알레르기 · 기저질환',
    },
    { id: 'medications', title: '복용 약물 관리', description: `등록 약물 ${medications.length}개` },
  ];

  return (
    <div className="mp-page">
      <h1 className="mp-title">마이페이지</h1>

      <section className="mp-profile-card">
        {profileImage
          ? <img className="mp-avatar" src={profileImage} alt="" />
          : <div className="mp-avatar" aria-hidden="true">{userName?.[0] ?? '?'}</div>}
        <div className="mp-profile-text">
          <strong>{userName}</strong>
          <span>{email}</span>
        </div>
        <button type="button" className="mp-pill-button" onClick={onLogout}>로그아웃</button>
      </section>

      <h2 className="mp-section-title">내 정보</h2>
      <ul className="mp-menu">
        {myMenuItems.map((item) => (
          <li key={item.id}>
            <button type="button" className="mp-menu-item" onClick={() => onNavigate(item.id)}>
              <span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <span className="mp-chevron" aria-hidden="true">›</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyPage;
