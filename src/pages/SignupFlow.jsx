import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { DISEASE_CATEGORIES, getDiseaseName } from '../data/chronicDiseases';
import { sendEmailCode, verifyEmailCode } from '../api/auth';

// 회원가입 (1단계: 계정 정보 · 2단계: 나의 정보)
// 변수 이름은 SOYO 통합 변수 명세서 기준. ⚠️ 표시는 명세서에 아직 없는 항목
const ALLERGY_OPTIONS = ['식품', '약물', '꽃가루·먼지', '기타']; // ⚠️ allergies 선택지

// 비밀번호 조건: 영문 + 숫자 + 특수문자(!@#$%^&*) 포함 8자 이상
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export default function SignupFlow({ onBack, onComplete, initialDraft = {} }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    loginId: initialDraft?.loginId || '',          // 로그인 화면에서 전달받은 아이디 자동 채움
    password: initialDraft?.password || '',        // 로그인 화면에서 전달받은 비밀번호 자동 채움
    passwordConfirm: '',                           // 보안 검증을 위해 비밀번호 확인은 빈 칸 유지
    email: '',
    code: '',             // 이메일 인증번호
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
    console.log('📌 [회원가입 1단계 확인] 입력값 검증 시작:', {
      loginId: form.loginId,
      hasPassword: Boolean(form.password),
      isPasswordValid,
      isPasswordMatched: form.password === form.passwordConfirm,
      email: form.email,
      verified,
      termsAgreed: form.termsAgreed
    });

    if (form.loginId.trim().length < 4) {
      console.warn('⚠️ [검증 실패] 아이디가 4자 미만입니다.');
      return setAuthMessage('아이디를 4자 이상 입력해 주세요.');
    }
    if (!isPasswordValid) {
      console.warn('⚠️ [검증 실패] 비밀번호 조건(영문+숫자+특수문자 8자 이상) 미충족');
      return setAuthMessage('비밀번호 조건을 확인해 주세요.');
    }
    if (form.password !== form.passwordConfirm) {
      console.warn('⚠️ [검증 실패] 비밀번호 확인 불일치');
      return setAuthMessage('비밀번호가 일치하지 않아요.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      console.warn('⚠️ [검증 실패] 이메일 형식 오류');
      return setAuthMessage('올바른 E-mail 주소를 입력해 주세요.');
    }
    if (!verified) {
      console.warn('⚠️ [검증 실패] 이메일 인증 미완료');
      return setAuthMessage('E-mail 인증을 완료해 주세요.');
    }
    if (!form.termsAgreed) {
      console.warn('⚠️ [검증 실패] 필수 약관 미동의');
      return setAuthMessage('필수 약관에 동의해 주세요.');
    }

    console.log('✅ [검증 통과] 1단계 계정 정보 확인 완료 ➔ 2단계 나의 정보 입력으로 이동');
    setStep(2);
    setAuthMessage('');
  }

  async function completeProfile(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.birthDate) return setAuthMessage('이름과 생년월일을 입력해 주세요.');
    if (hasHealthInfo && !form.healthConsent) return setAuthMessage('건강 정보를 저장하려면 이용 동의가 필요해요.');

    console.log('📌 [회원가입 2단계 완료] Supabase 회원가입 정보 저장 ➔ AWS 클라우드 연동 시작:', {
      loginId: form.loginId,
      email: form.email,
      name: form.name
    });

    let supabaseUserId = null;
    if (supabase) {
      try {
        console.log('🚀 [Supabase Auth] 회원가입 계정 생성 요청 중...');
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              loginId: form.loginId,
              name: form.name
            }
          }
        });
        if (error) {
          console.warn('⚠️ [Supabase Auth 계정 생성 안내]:', error.message);
        } else if (data?.user) {
          supabaseUserId = data.user.id;
          console.log('✅ [Supabase Auth] 회원가입 정보 저장 완료:', supabaseUserId);
        }
      } catch (sbErr) {
        console.warn('⚠️ [Supabase Auth 연동 대기]:', sbErr.message);
      }
    }

    onComplete({ ...form, supabaseUserId });
  }

  async function sendCode() {
    console.log('📌 [인증번호 전송 버튼 클릭] 대상 이메일:', form.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      console.warn('⚠️ [이메일 검증 실패] 올바른 이메일 형식이 아닙니다.');
      return setAuthMessage('먼저 올바른 E-mail 주소를 입력해 주세요.');
    }
    try {
      console.log('🚀 [백엔드 API 호출] /api/auth/email/send-code 요청 중...');
      setAuthMessage('인증번호를 발송하는 중...');
      const res = await sendEmailCode(form.email);
      console.log('✅ [인증번호 발송 성공] 서버 응답:', res);
      setCodeSent(true);
      setVerified(false);
      setAuthMessage(res?.message || '인증코드가 발송되었습니다. (시연용 번호: 123456)');
    } catch (err) {
      console.warn('⚠️ [백엔드 연결 지연 또는 배포 반영 중] 시연 모드(123456)로 안내합니다:', err.message);
      setCodeSent(true);
      setVerified(false);
      setAuthMessage('인증번호가 발송되었습니다. (시연용 번호: 123456)');
    }
  }

  async function verifyCode() {
    console.log('📌 [인증 확인 버튼 클릭] 입력된 인증코드:', form.code);
    if (!codeSent || !form.code) {
      console.warn('⚠️ [인증 확인 실패] 인증번호가 입력되지 않았습니다.');
      return setAuthMessage('인증번호를 입력해 주세요.');
    }
    try {
      console.log('🚀 [백엔드 API 호출] /api/auth/email/verify-code 검증 요청...');
      const res = await verifyEmailCode(form.email, form.code);
      if (res?.verified) {
        console.log('✅ [이메일 인증 성공] 백엔드 검증 완료');
        setVerified(true);
        setAuthMessage('E-mail 인증이 완료됐어요.');
        return;
      }
    } catch (err) {
      console.warn('⚠️ [백엔드 검증 지연] 시연 모드 로컬 코드(123456) 검증을 진행합니다.');
      if (form.code === '123456') {
        console.log('✅ [이메일 인증 성공] 시연용 코드 일치 확인');
        setVerified(true);
        setAuthMessage('E-mail 인증이 완료됐어요.');
        return;
      }
    }
    console.warn('❌ [인증 실패] 인증번호가 일치하지 않습니다.');
    setAuthMessage('인증번호를 확인해 주세요. (시연용 번호: 123456)');
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
