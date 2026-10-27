import { MatchDial } from "@/components/student/MatchDial";

/** The hero: match dial, the locked target role, and the adjacent paths. */
export function MatchHero({ matchPercent, targetRole, matchBasis, matchSource, adjacentPaths }) {
  return (
    <div
      data-tour="hero"
      className="relative mt-6 grid grid-cols-[140px_1fr_280px] items-center gap-8 overflow-hidden rounded-[10px] border border-hairline bg-surface px-8 py-7"
    >
      {/* Mockup's .hero::before accent rule */}
      <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-burgundy via-brass to-amber opacity-70" />
      <MatchDial percent={matchPercent} />

      <div>
        <div className="text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
          Target role · locked
        </div>
        <div className="mt-2 text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">
          {targetRole}
        </div>
        <p className="mt-3 max-w-[520px] text-[13.5px] leading-relaxed text-muted-ink">
          {matchBasis}
        </p>
        <p className="mt-3 text-[11.5px] text-muted-ink-2">{matchSource}</p>
      </div>

      <div className="border-l border-hairline pl-6">
        <div className="text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
          Adjacent paths
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {adjacentPaths.map((path) => (
            <div key={path.title} className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] text-ink-2">{path.title}</span>
              <span className="text-[12.5px] font-medium text-muted-ink tnum">
                {path.fitPercent}% fit
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
