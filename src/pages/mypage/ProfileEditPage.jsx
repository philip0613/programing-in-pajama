import React, { useState } from 'react';

// No.11 회원정보 수정
// 변수: name(이름 입력값), birthDate(생년월일 — DB birth_date), isLoading
function ProfileEditPage({ profile, isLoading, onSave }) {
  const [name, setName] = useState(profile.userName ?? '');
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? '');
  const [notice, setNotice] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) return setNotice('이름을 입력해 주세요.');
    onSave({ userName: name.trim(), birthDate });
  };

  return (
    <form className="mp-page mp-form" onSubmit={handleSubmit}>
      <h1 className="mp-title mp-title-left">회원정보 수정</h1>
      <p className="mp-subtitle">저장한 회원·건강정보를 수정할 수 있어요</p>

      <label className="mp-input-wrap">
        <span className="visually-hidden">이름</span>
        <input
          className="mp-input"
          placeholder="이름"
          autoComplete="name"
          value={name}
          onChange={(e) => { setName(e.target.value); setNotice(''); }}
        />
      </label>

      <label className="mp-input-wrap">
        <span className="visually-hidden">생년월일</span>
        <input
          className="mp-input"
          placeholder="생년월일"
          type={birthDate ? 'date' : 'text'}
          onFocus={(e) => { e.target.type = 'date'; }}
          onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </label>

      {notice && <p className="mp-notice" role="status">{notice}</p>}

      <button type="submit" className="mp-primary-button" disabled={isLoading}>
        {isLoading ? '저장 중...' : '저장'}
      </button>
    </form>
  );
}


export default ProfileEditPage;
