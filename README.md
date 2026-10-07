# SOYO 프론트엔드 (programing-in-pajama)

React + Vite 웹 앱입니다. 백엔드: [program-in-pazama](https://github.com/philip0613/program-in-pazama) · API 명세: [docs/API.md](https://github.com/philip0613/program-in-pazama/blob/main/docs/API.md)

> 🐣 **Git/GitHub 이 처음이라면 → [초보자 가이드](https://github.com/philip0613/program-in-pazama/blob/main/docs/GUIDE.md) 부터 보세요!** (명령어 없이 버튼으로만)

## 처음 실행하기
**가장 쉬운 방법:** 폴더 안의 `실행하기.bat` 더블클릭 (맥은 `맥용/실행하기.command`). 설치부터 실행까지 자동으로 해줘요.

| 더블클릭 파일 | 하는 일 |
|---|---|
| `작업시작.bat` | 최신 코드 받기 + 내 작업 공간(브랜치) 만들기 |
| `실행하기.bat` | 설치 + 개발 서버 실행 |
| `올리기.bat` | 저장(commit) + 올리기(push) + PR 페이지 열기 |
| `최신받기.bat` | 친구들이 합친 최신 코드 받기 |

(실제 동작은 `scripts/team.cjs` — 프론트/백엔드 레포에 같은 파일이 있으니 고칠 땐 양쪽 다)

터미널로 직접 하려면 (Node.js 20 이상 필요):

```bash
git clone https://github.com/philip0613/programing-in-pajama.git
cd programing-in-pajama
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
npm run dev
```

http://localhost:5173 을 열면 화면 위쪽에 백엔드 연결 상태가 보입니다.
- ✅ 연결 성공 → 백엔드도 켜져 있음
- ❌ 연결 실패 → 백엔드를 켜거나(백엔드 README 참고), 아래 **목 모드**를 사용

> Supabase 키는 팀 단톡방 공지에서 받아 `.env` 에 넣으세요. 비워두면 로그인만 안 되고 나머지 화면은 동작합니다.

## 🧪 백엔드 없이 개발하기 (목 모드)
`.env` 에서 `VITE_USE_MOCK=true` 로 바꾸고 `npm run dev` 를 다시 실행하면, 백엔드 대신 `src/mocks/` 의 가짜 데이터를 사용합니다.
백엔드 친구가 API를 아직 만들고 있어도 화면 작업을 먼저 할 수 있어요.

## 폴더 구조
```
src/
  App.jsx             화면 조립 (컴포넌트 배치만)
  components/         ★ 화면 조각 — 대부분의 작업은 여기서
    AuthPanel.jsx       로그인/로그아웃
    PostForm.jsx        글 작성
    PostList.jsx        글 목록
    ApiHealthCheck.jsx  백엔드 연결 상태 표시
  api/                ★ 백엔드 호출 함수 (fetch 는 여기서만)
    client.js           공통 요청 함수 apiFetch
    posts.js            게시글 API
  mocks/              목 모드용 가짜 데이터
```

## 새 기능 추가하는 법 (예: 댓글)
1. 백엔드 `docs/API.md` 에서 댓글 API 명세 확인 (없으면 백엔드 친구와 먼저 정하기)
2. `src/api/comments.js` 에 호출 함수 작성 (`posts.js` 참고)
3. 백엔드가 아직이면 `src/mocks/comments.js` 에 가짜 데이터 작성
4. `src/components/CommentList.jsx` 같은 컴포넌트 만들고 `App.jsx` 에 배치

## 협업 규칙
1. `main` 에서 바로 작업하지 말고 `작업시작.bat` 으로 작업 공간 만들기
2. 작업이 끝나면 `올리기.bat` → PR 만들고 **다른 친구 1명이 확인한 뒤** 합치기
3. API를 바꾸고 싶으면 먼저 백엔드 `docs/API.md` 수정 + 단톡방에 알리기

> ⚠️ `main` 에 합쳐지면 **AWS Amplify 실서버에 자동 배포**됩니다.
