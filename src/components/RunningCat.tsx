/** 미터기 램프 옆에서 달리는 고양이. 다리 두 벌을 번갈아 보여준다. */
export function RunningCat() {
  return (
    <svg className="cat" width="30" height="18" viewBox="0 0 30 18" aria-hidden="true">
      <g transform="translate(30 0) scale(-1 1)" fill="currentColor" stroke="currentColor">
        <path d="M7 8 Q2 6 2.5 2" fill="none" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="13" cy="9" rx="7" ry="3.4" stroke="none" />
        <circle cx="21.5" cy="6.8" r="3.3" stroke="none" />
        <path d="M19.4 4.6 L19.9 1.4 L21.8 3.8 Z M22.4 3.7 L24.3 1.5 L24.4 4.8 Z" stroke="none" />
        <path className="leg-a" d="M9 11 L4 15.5 M17 11 L23 15" fill="none" strokeWidth="1.8" strokeLinecap="round" />
        <path className="leg-b" d="M9.5 11.5 L10 16 M16.5 11.5 L16 16" fill="none" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  )
}
