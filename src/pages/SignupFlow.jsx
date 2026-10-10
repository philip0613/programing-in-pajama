import { useState } from 'react';
import { DISEASE_CATEGORIES, getDiseaseName } from '../data/chronicDiseases';

// 회원가입 (1단계: 계정 정보 · 2단계: 나의 정보)
// 변수 이름은 SOYO 통합 변수 명세서 기준. ⚠️ 표시는 명세서에 아직 없는 항목
const ALLERGY_OPTIONS = ['식품', '약물', '꽃가루·먼지', '기타']; // ⚠️ allergies 선택지

// 비밀번호 조건: 영문 + 숫자 + 특수문자(!@#$%^&*) 포함 8자 이상
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export default function SignupFlow({ onBack, onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    loginId: '',          // ⚠️ 로그인 아이디 (userId 는 Supabase 시스템 ID 라서 다른 이름 사용)
    password: '',
    passwordConfirm: '',
    email: '',
    code: '',             // 이메일 인증번호 (이메일 인증은 나중에 구현)
    termsAgreed: false,   // 필수 약관 동의
    name: '',
    birthDate: '',        // 생년월일 (DB birth_date)
    allergies: [],        // 알레르기 (DB allergies)
    diseaseIds: [],       // 선택한 질병 ID (data/chronicDiseases.js)
    medications: [],
    healthConsent: false, // 건강 정보 이용 동의
    noAllergy: false,
    noDisease: false,
    noMedication: false,
  });
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [modalType, setModalType] = useState(null); // 'allergyPicker' | 'diseasePicker' | null
  const [medicationDraft, setMedicationDraft] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isPasswordValid = PASSWORD_RULE.test(form.password);
  const hasHealthInfo = form.allergies.length > 0 || form.diseaseIds.length > 0 || form.medications.length > 0;

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setAuthMessage('');
  }

  function toggleItem(key, item) {
    // 항상 최신 상태 기준으로 계산 (빠르게 여러 개 눌러도 선택이 사라지지 않게)
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(item) ? current[key].filter((entry) => entry !== item) : [...current[key], item],
    }));
    setAuthMessage('');
  }

  function continueToProfile(event) {
    event.preventDefault();
    if (form.loginId.trim().length < 4) return setAuthMessage('아이디를 4자 이상 입력해 주세요.');
    if (!isPasswordValid) return setAuthMessage('비밀번호 조건을 확인해 주세요.');
    if (form.password !== form.passwordConfirm) return setAuthMessage('비밀번호가 일치하지 않아요.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setAuthMessage('올바른 E-mail 주소를 입력해 주세요.');
    if (!verified) return setAuthMessage('E-mail 인증을 완료해 주세요.');
    if (!form.termsAgreed) return setAuthMessage('필수 약관에 동의해 주세요.');
    setStep(2);
    setAuthMessage('');
  }

  function completeProfile(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.birthDate) return setAuthMessage('이름과 생년월일을 입력해 주세요.');
    if (hasHealthInfo && !form.healthConsent) return setAuthMessage('건강 정보를 저장하려면 이용 동의가 필요해요.');
    onComplete({ ...form });
  }

  function sendCode() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setAuthMessage('먼저 올바른 E-mail 주소를 입력해 주세요.');
    setCodeSent(true);
    setVerified(false);
    setAuthMessage('화면 시연용 인증번호는 123456입니다. 실제 메일 발송은 서버 연결 후 사용할 수 있어요.');
  }

  function verifyCode() {
    if (codeSent && form.code === '123456') {
      setVerified(true);
      setAuthMessage('E-mail 인증이 완료됐어요.');
    } else setAuthMessage('인증번호를 확인해 주세요. (시연용 번호: 123456)');
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
            <input className="text-input" aria-label="아이디" placeholder="아이디" autoComplete="username" value={form.loginId} onChange={(e) => update('loginId', e.target.value)} />
            <div className="password-wrap signup-password">
              <input className="text-input password-input" aria-label="비밀번호" placeholder="비밀번호" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} />
              <button className="eye-button" type="button" aria-label="비밀번호 표시/숨기기" onClick={() => setShowPassword((v) => !v)}><EyeIcon /></button>
            </div>
            <p className={`password-hint ${form.password && !isPasswordValid ? 'invalid' : ''}`}>영문, 숫자, 특수문자 포함 8자 이상, 특수문자 !@#$%^&amp;*만 사용가능</p>
            <div className="password-wrap signup-password">
              <input className="text-input password-input" aria-label="비밀번호 확인" placeholder="비밀번호 확인" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={form.passwordConfirm} onChange={(e) => update('passwordConfirm', e.target.value)} />
              <button className="eye-button" type="button" aria-label="비밀번호 확인 표시/숨기기" onClick={() => setShowConfirm((v) => !v)}><EyeIcon /></button>
            </div>
            <div className="verification-row email-row">
              <input className="text-input" aria-label="E-mail" placeholder="E-mail" type="email" autoComplete="email" value={form.email} onChange={(e) => { update('email', e.target.value); setVerified(false); }} />
              <button className="send-code-button" type="button" onClick={sendCode}>{codeSent ? '재전송' : '인증번호 전송'}</button>
            </div>
            <div className="verification-row">
              <input className="text-input" aria-label="인증번호 6자리" placeholder="인증번호 6자리" inputMode="numeric" maxLength={6} value={form.code} onChange={(e) => update('code', e.target.value.replace(/\D/g, ''))} />
              <button className="verify-button" type="button" onClick={verifyCode}>{verified ? '인증 완료' : '인증 확인'}</button>
            </div>
            <label className="empty-check consent-check">
              <input type="checkbox" checked={form.termsAgreed} onChange={(e) => update('termsAgreed', e.target.checked)} />
              [필수] 이용약관 및 개인정보 수집·이용에 동의합니다.
            </label>
            {authMessage && <p className={`signup-notice ${verified ? 'success' : ''}`} role="status">{authMessage}</p>}
            <div className="signup-bottom">
              <button className="primary-button" type="submit">다음</button>
              <button className="signup-back-link" type="button" onClick={onBack}>로그인으로 돌아가기</button>
            </div>
          </form>
        ) : (
          <form className="profile-form" onSubmit={completeProfile}>
            <input className="text-input" aria-label="이름" placeholder="이름" autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} />
            <input className="text-input" aria-label="생년월일" placeholder="생년월일" type="text" inputMode="numeric" onFocus={(e) => { e.target.type = 'date'; }} onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }} value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} />

            <FieldGroup title="알레르기 여부" onSelect={() => setModalType('allergyPicker')} summary={form.allergies.join(', ')} placeholder="알레르기 카테고리 선택" emptyLabel="알레르기가 없습니다." emptyChecked={form.noAllergy} onEmpty={(checked) => { update('noAllergy', checked); if (checked) update('allergies', []); }} />
            <FieldGroup title="기저질환" onSelect={() => setModalType('diseasePicker')} summary={form.diseaseIds.map(getDiseaseName).join(', ')} placeholder="질병 카테고리 선택" emptyLabel="기저질환이 없습니다." emptyChecked={form.noDisease} onEmpty={(checked) => { update('noDisease', checked); if (checked) update('diseaseIds', []); }} />

            <div className="profile-group medication-group">
              <label className="group-title" htmlFor="medication-input">복용 중인 약물</label>
              <div className="medication-entry">
                <input id="medication-input" className="text-input" placeholder="약물 이름 입력 후 추가" value={medicationDraft} onChange={(e) => setMedicationDraft(e.target.value)} />
                <button className="med-add-button" type="button" onClick={addMedication}>추가</button>
              </div>
              {form.medications.length > 0 && <div className="selected-chips">{form.medications.map((med) => <button type="button" className="selected-chip" key={med} onClick={() => update('medications', form.medications.filter((item) => item !== med))}>{med} ×</button>)}</div>}
              <label className="empty-check"><input type="checkbox" checked={form.noMedication} onChange={(e) => { update('noMedication', e.target.checked); if (e.target.checked) update('medications', []); }} /> 복용 중인 약물이 없습니다.</label>
            </div>
            <label className="empty-check consent-check">
              <input type="checkbox" checked={form.healthConsent} onChange={(e) => update('healthConsent', e.target.checked)} />
              건강 정보(알레르기·기저질환·복용 약물)를 맞춤 코스 추천에 이용하는 데 동의합니다.
            </label>
            {authMessage && <p className="signup-notice" role="status">{authMessage}</p>}
            <p className="privacy-note">입력한 정보는 맞춤 코스 추천에 활용됩니다</p>
            <button className="primary-button profile-submit" type="submit">시작하기</button>
            <button className="signup-back-link profile-back" type="button" onClick={() => { setStep(1); setAuthMessage(''); }}>이전</button>
          </form>
        )}

        {modalType && <div className="modal-backdrop" role="presentation" onClick={() => setModalType(null)}><section className="picker-modal" role="dialog" aria-modal="true" aria-labelledby="picker-title" onClick={(e) => e.stopPropagation()}>
          <h2 id="picker-title">{modalType === 'allergyPicker' ? '알레르기 카테고리' : '기저질환 선택'}</h2>
          <p>해당하는 항목을 선택해 주세요</p>
          {modalType === 'allergyPicker' ? (
            <div className="picker-options">{ALLERGY_OPTIONS.map((item) => <PickerOption key={item} label={item} selected={form.allergies.includes(item)} onClick={() => toggleItem('allergies', item)} />)}</div>
          ) : (
            <div className="picker-scroll">{DISEASE_CATEGORIES.map((category) => (
              <div key={category.id} className="picker-group">
                <h3 className="picker-group-title">{category.name}</h3>
                <div className="picker-options">{category.diseases.map((disease) => <PickerOption key={disease.id} label={disease.name} selected={form.diseaseIds.includes(disease.id)} onClick={() => toggleItem('diseaseIds', disease.id)} />)}</div>
              </div>
            ))}</div>
          )}
          <button className="primary-button picker-done" type="button" onClick={() => { setModalType(null); update(modalType === 'allergyPicker' ? 'noAllergy' : 'noDisease', false); }}>선택 완료</button>
        </section></div>}
      </section>
    </main>
  );
}

function PickerOption({ label, selected, onClick }) {
  return <button type="button" className={`picker-option ${selected ? 'selected' : ''}`} onClick={onClick}>{label}<span>{selected ? '✓' : '+'}</span></button>;
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
