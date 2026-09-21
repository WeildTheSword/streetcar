const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The match-score ring from the mockup hero, drawn to an arbitrary percent. */
export function MatchDial({ percent, size = 140 }) {
  const filled = (CIRCUMFERENCE * percent) / 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" className="size-full -rotate-90">
        <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#efefec" strokeWidth="8" />
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          stroke="#10b981"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[30px] font-semibold tracking-[-0.02em] text-ink tnum">
        {percent}
        <span className="ml-0.5 text-[15px] text-muted-ink-2">%</span>
      </div>
    </div>
  );
}
