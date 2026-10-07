import React, { useState, useEffect } from 'react';
import { API_BASE_URL, checkHealth } from '../api/client';

function ApiHealthCheck() {
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });

  const runCheck = async () => {
    setState({ status: 'loading', data: null, error: '' });
    try {
      const data = await checkHealth();
      setState({ status: 'ok', data, error: '' });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message });
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const colors = { loading: '#636e72', ok: '#00b894', error: '#d63031' };

  return (
    <section style={{ padding: '12px 16px', border: `1px solid ${colors[state.status]}`, borderRadius: '8px', marginBottom: '24px', fontSize: '13px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: colors[state.status] }}>
          {state.status === 'loading' && '⏳ 백엔드 연결 확인 중...'}
          {state.status === 'ok' && `✅ ${state.data.message}`}
          {state.status === 'error' && '❌ 백엔드 연결 실패'}
        </strong>
        <button onClick={runCheck} style={{ padding: '4px 10px', cursor: 'pointer' }}>다시 확인</button>
      </div>
      <div style={{ color: '#888', marginTop: '6px' }}>API: {API_BASE_URL || '(VITE_BACKEND_URL 미설정)'}</div>
      {state.status === 'ok' && (
        <div style={{ color: '#888', marginTop: '4px' }}>
          DB: {state.data.services.database ? '설정됨' : '미설정'} · Supabase: {state.data.services.supabase ? '설정됨' : '미설정'} · {new Date(state.data.timestamp).toLocaleString()}
        </div>
      )}
      {state.status === 'error' && <div style={{ color: colors.error, marginTop: '4px' }}>{state.error}</div>}
    </section>
  );
}

export default ApiHealthCheck;
