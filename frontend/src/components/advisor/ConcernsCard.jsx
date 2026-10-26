import { CircleAlert } from "lucide-react";
import { SnapshotCard } from "@/components/advisor/SnapshotCard";
import { cn } from "@/lib/utils";

const TONE_DOT = {
  rose: "bg-rose",
  amber: "bg-amber",
  violet: "bg-violet",
  sky: "bg-sky",
};

/** What the student said they are worried about. */
export function ConcernsCard({ firstName, concerns }) {
  return (
    <SnapshotCard title={`${firstName} is concerned about`} icon={CircleAlert} data-tour="concerns">
      <ul className="mt-3 flex flex-col gap-2">
        {concerns.map((concern) => (
          <li key={concern.title} className="flex gap-2 text-[11.5px] leading-snug">
            <span
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                TONE_DOT[concern.tone] ?? "bg-muted-ink-2",
              )}
            />
            <span className="text-muted-ink">
              <b className="font-semibold text-ink">{concern.title}:</b> {concern.detail}
            </span>
          </li>
        ))}
      </ul>
    </SnapshotCard>
  );
}
