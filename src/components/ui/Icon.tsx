/** 라인 아이콘 + 노랑 포인트 (점신 레퍼런스 스타일) */
const PATHS: Record<string, React.ReactNode> = {
  money: (<><circle cx="12" cy="12" r="7" fill="#ffe066" /><path d="M12 7v10M9.5 9.5h3.5a1.75 1.75 0 0 1 0 3.5h-2a1.75 1.75 0 0 0 0 3.5H14.5" /></>),
  heart: (<><path d="M12 19s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 1.8C19 14.7 12 19 12 19Z" fill="#ffe066" /></>),
  briefcase: (<><rect x="4" y="8" width="16" height="11" rx="2" fill="#ffe066" /><path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8M4 13h16" /></>),
  leaf: (<><path d="M6 18c0-8 5-12 13-12 0 8-4 13-12 13" fill="#ffe066" /><path d="M6 18l7-7" /></>),
  compass: (<><circle cx="12" cy="12" r="8" fill="#ffe066" /><path d="m15 9-2 4-4 2 2-4 4-2Z" /></>),
  palette: (<><path d="M12 4a8 8 0 1 0 0 16c1.1 0 1.5-.8 1.2-1.6-.4-1 .3-2 1.4-2H17a3 3 0 0 0 3-3C20 7.3 16.4 4 12 4Z" fill="#ffe066" /><circle cx="8.5" cy="11" r="1" /><circle cx="12" cy="8" r="1" /><circle cx="15.5" cy="10" r="1" /></>),
  hash: (<><rect x="4" y="4" width="16" height="16" rx="4" fill="#ffe066" /><path d="M10 7l-1.5 10M15.5 7 14 17M7 10h11M6.5 14h11" /></>),
  gift: (<><rect x="5" y="10" width="14" height="9" rx="1.5" fill="#ffe066" /><path d="M4 7.5h16V10H4zM12 7.5V19M12 7.5c-1-2.5-4.5-3-4.5-.8 0 .8 1.5.8 4.5.8Zm0 0c1-2.5 4.5-3 4.5-.8 0 .8-1.5.8-4.5.8Z" /></>),
  bowl: (<><path d="M4 11h16a8 8 0 0 1-16 0Z" fill="#ffe066" /><path d="M9 7c0-1 1-1 1-2M13 7c0-1 1-1 1-2" /></>),
  run: (<><circle cx="14" cy="5.5" r="2" fill="#ffe066" /><path d="M8 20l3-6 3 2v4M7 11l3-3 4 1 2 3h3M11 14l1.5-4" /></>),
  calendar: (<><rect x="4" y="6" width="16" height="14" rx="2" fill="#ffe066" /><path d="M4 10h16M8 4v4M16 4v4" /></>),
  sparkle: (<><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" fill="#ffe066" /></>),
  scroll: (<><rect x="6" y="4" width="12" height="16" rx="2" fill="#ffe066" /><path d="M9 8h6M9 12h6M9 16h4" /></>),
};

export function Icon({ name, size = 24 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#191f28" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

/** 원형 연한 배경 위 아이콘 */
export function IconBubble({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-page" style={{ width: size, height: size }}>
      <Icon name={name} size={size * 0.55} />
    </span>
  );
}
