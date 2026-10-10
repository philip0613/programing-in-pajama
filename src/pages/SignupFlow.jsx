import { useState } from 'react';

const categories = {
  allergy: ['식품', '약물', '꽃가루·먼지', '기타'],
  disease: ['심혈관 질환', '내분비 장애', '신경계 질환', '만성 신장 질환', '기타 질환'],
};

export default function SignupFlow({ onBack, onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ id: '', password: '', passwordConfirm: '', email: '', code: '', name: '', birth: '', allergies: [], diseases: [], medications: [], noAllergy: false, noDisease: false, noMedication: false });
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [notice, setNotice] = useState('');
  const [picker, setPicker] = useState(null);
  const [medicationDraft, setMedicationDraft] = useState('');

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice('');
  }

  function toggleItem(key, item) {
    update(key, form[key].includes(item) ? form[key].filter((entry) => entry !== item) : [...form[key], item]);
  }

  function continueToProfile(event) {
    event.preventDefault();
    if (form.id.trim().length < 4) return setNotice('아이디를 4자 이상 입력해 주세요.');
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(form.password)) return setNotice('비밀번호 조건을 확인해 주세요.');
    if (form.password !== form.passwordConfirm) return setNotice('비밀번호가 일치하지 않아요.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setNotice('올바른 E-mail 주소를 입력해 주세요.');
    if (!verified) return setNotice('E-mail 인증을 완료해 주세요.');
    setStep(2);
    setNotice('');
  }

  function sendCode() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setNotice('먼저 올바른 E-mail 주소를 입력해 주세요.');
    setCodeSent(true);
    setVerified(false);
    setNotice('화면 시연용 인증번호는 123456입니다. 실제 메일 발송은 서버 연결 후 사용할 수 있어요.');
  }

  function verifyCode() {
    if (codeSent && form.code === '123456') {
      setVerified(true);
      setNotice('E-mail 인증이 완료됐어요.');
    } else setNotice('인증번호를 확인해 주세요. (시연용 번호: 123456)');
  }

  function addMedication(event) {
    event.preventDefault();
    const value = medicationDraft.trim();
    if (value && !form.medications.includes(value)) update('medications', [...form.medications, value]);
    setMedicationDraft('');
  }

  return (
    <main className="page-shell">
      <section className={`signup-card ${step === 2 ? 'profile-card' : ''}`}>
        <header className="signup-heading">
          {step === 1 ? <><h1>회원가입</h1><p>1 / 2 계정 정보를 입력해 주세요</p></> : <><h1>나의 정보 입력</h1><p>2 / 2 맞춤 추천에 활용됩니다</p></>}
        </header>

        {step === 1 ? (
          <form className="signup-form" onSubmit={continueToProfile}>
            <input className="text-input" aria-label="아이디" placeholder="아이디" autoComplete="username" value={form.id} onChange={(e) => update('id', e.target.value)} />
            <div className="password-wrap signup-password">
              <input className="text-input password-input" aria-label="비밀번호" placeholder="비밀번호" type={form.showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} />
              <button className="eye-button" type="button" aria-label="비밀번호 표시/숨기기" onClick={() => update('showPassword', !form.showPassword)}><EyeIcon /></button>
            </div>
            <p className="password-hint">영문, 숫자, 특수문자 포함 8자 이상, 특수문자 !@#$%^&amp;*만 사용가능</p>
            <div className="password-wrap signup-password">
              <input className="text-input password-input" aria-label="비밀번호 확인" placeholder="비밀번호 확인" type={form.showConfirm ? 'text' : 'password'} autoComplete="new-password" value={form.passwordConfirm} onChange={(e) => update('passwordConfirm', e.target.value)} />
              <button className="eye-button" type="button" aria-label="비밀번호 확인 표시/숨기기" onClick={() => update('showConfirm', !form.showConfirm)}><EyeIcon /></button>
            </div>
            <div className="verification-row email-row">
              <input className="text-input" aria-label="E-mail" placeholder="E-mail" type="email" autoComplete="email" value={form.email} onChange={(e) => { update('email', e.target.value); setVerified(false); }} />
              <button className="send-code-button" type="button" onClick={sendCode}>{codeSent ? '재전송' : '인증번호 전송'}</button>
            </div>
            <div className="verification-row">
              <input className="text-input" aria-label="인증번호 6자리" placeholder="인증번호 6자리" inputMode="numeric" maxLength={6} value={form.code} onChange={(e) => update('code', e.target.value.replace(/\D/g, ''))} />
              <button className="verify-button" type="button" onClick={verifyCode}>{verified ? '인증 완료' : '인증 확인'}</button>
            </div>
            {notice && <p className={`signup-notice ${verified ? 'success' : ''}`} role="status">{notice}</p>}
            <div className="signup-bottom">
              <button className="primary-button" type="submit">다음</button>
              <button className="signup-back-link" type="button" onClick={onBack}>로그인으로 돌아가기</button>
            </div>
          </form>
        ) : (
          <form className="profile-form" onSubmit={(e) => { e.preventDefault(); if (!form.name.trim() || !form.birth) return setNotice('이름과 생년월일을 입력해 주세요.'); onComplete({ ...form }); }}>
            <input className="text-input" aria-label="이름" placeholder="이름" autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} />
            <input className="text-input" aria-label="생년월일" placeholder="생년월일" type="text" inputMode="numeric" onFocus={(e) => { e.target.type = 'date'; }} onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }} value={form.birth} onChange={(e) => update('birth', e.target.value)} />

            <FieldGroup title="알레르기 여부" onSelect={() => setPicker('allergy')} summary={form.allergies.join(', ')} placeholder="알레르기 카테고리 선택" emptyLabel="알레르기가 없습니다." emptyChecked={form.noAllergy} onEmpty={(checked) => { update('noAllergy', checked); if (checked) update('allergies', []); }} />
            <FieldGroup title="기저질환" onSelect={() => setPicker('disease')} summary={form.diseases.join(', ')} placeholder="질병 카테고리 선택" emptyLabel="기저질환이 없습니다." emptyChecked={form.noDisease} onEmpty={(checked) => { update('noDisease', checked); if (checked) update('diseases', []); }} />

            <div className="profile-group medication-group">
              <label className="group-title" htmlFor="medication-input">복용 중인 약물</label>
              <div className="medication-entry">
                <input id="medication-input" className="text-input" placeholder="약물 이름 입력 후 추가" value={medicationDraft} onChange={(e) => setMedicationDraft(e.target.value)} />
                <button className="med-add-button" type="button" onClick={addMedication}>추가</button>
              </div>
              {form.medications.length > 0 && <div className="selected-chips">{form.medications.map((med) => <button type="button" className="selected-chip" key={med} onClick={() => update('medications', form.medications.filter((item) => item !== med))}>{med} ×</button>)}</div>}
              <label className="empty-check"><input type="checkbox" checked={form.noMedication} onChange={(e) => { update('noMedication', e.target.checked); if (e.target.checked) update('medications', []); }} /> 복용 중인 약물이 없습니다.</label>
            </div>
            {notice && <p className="signup-notice" role="status">{notice}</p>}
            <p className="privacy-note">입력한 정보는 맞춤 코스 추천에 활용됩니다</p>
            <button className="primary-button profile-submit" type="submit">시작하기</button>
            <button className="signup-back-link profile-back" type="button" onClick={() => { setStep(1); setNotice(''); }}>이전</button>
          </form>
        )}

        {picker && <div className="modal-backdrop" role="presentation" onClick={() => setPicker(null)}><section className="picker-modal" role="dialog" aria-modal="true" aria-labelledby="picker-title" onClick={(e) => e.stopPropagation()}>
          <h2 id="picker-title">{picker === 'allergy' ? '알레르기 카테고리' : '질병 카테고리'}</h2>
          <p>해당하는 항목을 선택해 주세요</p>
          <div className="picker-options">{categories[picker].map((item) => { const key = picker === 'allergy' ? 'allergies' : 'diseases'; return <button type="button" className={`picker-option ${form[key].includes(item) ? 'selected' : ''}`} key={item} onClick={() => toggleItem(key, item)}>{item}<span>{form[key].includes(item) ? '✓' : '+'}</span></button>; })}</div>
          <button className="primary-button picker-done" type="button" onClick={() => { setPicker(null); update(picker === 'allergy' ? 'noAllergy' : 'noDisease', false); }}>선택 완료</button>
        </section></div>}
      </section>
    </main>
  );
}

function FieldGroup({ title, onSelect, summary, placeholder, emptyLabel, emptyChecked, onEmpty }) {
  return <div className="profile-group">
    <span className="group-title">{title}</span>
    <button className="select-field" type="button" onClick={onSelect}><span>{summary || placeholder}</span><span className="chevron">›</span></button>
    <label className="empty-check"><input type="checkbox" checked={emptyChecked} onChange={(e) => onEmpty(e.target.checked)} /> {emptyLabel}</label>
  </div>;
}

function EyeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.7" /></svg>;
}
