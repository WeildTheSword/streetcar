import { TrendingUp } from "lucide-react";
import { SnapshotCard } from "@/components/advisor/SnapshotCard";

/** The student's first-choice firm, with placement and fit figures. */
export function TopFirmCard({ firstName, topFirm, matchPercent }) {
  return (
    <SnapshotCard title={`${firstName}'s top firm pick`} icon={TrendingUp}>
      <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-ink p-3">
        <span className="flex size-8 items-center justify-center rounded-md bg-white/12 text-[11px] font-bold text-white">
          {topFirm.mark}
        </span>
        <span className="leading-tight">
          <span className="block text-[13px] font-semibold text-white">
            {topFirm.name}
          </span>
          <span className="block text-[10.5px] text-white/50">
            IB Summer Analyst · NYC
          </span>
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-hairline p-2.5">
          <div className="text-[9px] font-medium tracking-wide text-muted-ink-2 uppercase">
            Freeman placement
          </div>
          <div className="mt-1 text-[19px] font-semibold text-ink tnum">
            73<span className="text-[11px] text-muted-ink-2">%</span>
          </div>
        </div>
        <div className="rounded-lg border border-hairline p-2.5">
          <div className="text-[9px] font-medium tracking-wide text-muted-ink-2 uppercase">
            {firstName}&apos;s fit
          </div>
          <div className="mt-1 text-[19px] font-semibold text-ink tnum">
            {matchPercent}
            <span className="text-[11px] text-muted-ink-2">%</span>
          </div>
        </div>
      </div>
      <div className="mt-2 rounded-lg border border-hairline p-2.5">
        <div className="text-[9px] font-medium tracking-wide text-muted-ink-2 uppercase">
          Hired from Tulane &apos;24
        </div>
        <div className="mt-1 text-[19px] font-semibold text-ink tnum">
          5<span className="ml-1.5 text-[11px] font-normal text-muted-ink">in IBD role</span>
        </div>
      </div>
    </SnapshotCard>
  );
}
