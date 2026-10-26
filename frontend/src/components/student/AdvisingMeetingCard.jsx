import { SectionCard } from "@/components/student/SectionCard";

/** The highlighted card for the student's next session with their navigator. */
export function AdvisingMeetingCard() {
  return (
    <SectionCard
      eyebrow="Your next advising meeting"
      className="border-[#f3e7c4] bg-highlight"
      data-tour="meeting"
    >
      <div className="mt-2 flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#3d3a35] text-[12px] font-semibold tracking-[0.02em] text-[#f4efe2]">
          BH
        </span>
        <div className="leading-tight">
          <div className="text-[14px] font-semibold tracking-[-0.005em] text-ink">
            Bill Hudlow
          </div>
          <div className="mt-px text-[11.5px] text-muted-ink">
            Freeman Career Consultant · Your navigator
          </div>
        </div>
      </div>
      <p className="mt-2.5 border-t border-dashed border-[#eacf96] pt-2 text-[12.5px] leading-[1.45] text-ink-2">
        <b className="font-semibold text-ink">Today · 11:30</b> · Goldring-Woldenberg 340.
        Pre-brief auto-loaded; bring questions on Goldman Round 2.
      </p>
    </SectionCard>
  );
}
