import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수가 없으면 null (로그인 기능만 비활성화되고 나머지 화면은 동작)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY가 설정되지 않아 로그인 기능이 비활성화됩니다.');
}
