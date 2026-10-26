import { Eye } from "lucide-react";
import { BankerPortrait } from "@/components/advisor/BankerPortrait";
import { Button } from "@/components/ui/button";

/** The auto-assembled pre-brief for the advisor's next student. */
export function PreBriefHero({ nextStudent, nextAppointment }) {
  return (
    <div data-tour="prebrief" className="mt-4 rounded-[10px] border border-hairline bg-surface">
      <div className="h-[3px] rounded-t-[9px] bg-gradient-to-r from-burgundy via-brass to-transparent" />
      <div className="grid grid-cols-[200px_1fr_260px] items-center gap-8 p-7">
        <BankerPortrait className="mx-auto h-[210px] w-auto" />

        <div>
          <div className="flex items-center gap-2 text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
            <span className="size-1.5 rounded-full bg-mint" />
            Career profile · High confidence
          </div>
          <p className="mt-2.5 text-[13.5px] text-muted-ink">
            Pre-brief for{" "}
            <span className="font-semibold text-ink">{nextStudent.name}</span> ·{" "}
            {nextAppointment.time} · {nextAppointment.year} · {nextAppointment.major}
          </p>
          <div className="mt-3 text-[42px] leading-[1.05] font-bold tracking-[-0.03em] text-ink uppercase">
            {nextStudent.targetRole}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-1.5 w-[130px] overflow-hidden rounded-full bg-hairline">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mint/70 to-mint"
                style={{ width: `${nextStudent.matchPercent}%` }}
              />
            </div>
            <span className="text-[13.5px] font-semibold text-ink tnum">
              {nextStudent.matchPercent}% match
            </span>
            <span className="text-[12.5px] text-muted-ink">
              · based on GPA {nextStudent.gpa}, ACCN-2010 (A+) &amp; 3 other metrics
            </span>
          </div>
        </div>

        <div className="border-l border-hairline pl-7">
          <Button
            variant="outline"
            className="h-8 rounded-lg border-hairline-strong bg-white text-[12.5px] font-medium"
          >
            <Eye className="size-3.5" />
            See Student View
          </Button>
          <div className="mt-6 text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
            Adjacent paths
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {nextStudent.adjacentPaths.map((path) => (
              <div key={path.title} className="flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] text-ink-2">{path.title}</span>
                <span className="text-[12.5px] font-semibold text-ink tnum">
                  {path.fitPercent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
