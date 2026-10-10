import React from 'react';
import './BottomNav.css';

// 하단 메뉴 — 변수 명세서의 activeTab (walk / recommended / records / myPage)
// 디자인 시안에는 아이콘이 3개라서 records(기록) 탭은 아직 넣지 않았어요.
const TABS = [
  {
    key: 'walk',
    label: '산책',
    icon: <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  },
  {
    key: 'recommended',
    label: '홈',
    icon: <path d="M4 10.5 12 4l8 6.5V20h-5v-5H9v5H4Z" />,
  },
  {
    key: 'myPage',
    label: '마이페이지',
    icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4.5 20a7.5 7.5 0 0 1 15 0" />,
  },
];

function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`bottom-nav-item ${activeTab === tab.key ? 'active' : ''}`}
          aria-label={tab.label}
          aria-current={activeTab === tab.key ? 'page' : undefined}
          onClick={() => onChange(tab.key)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">{tab.icon}</svg>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
