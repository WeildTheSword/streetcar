import { Users } from "lucide-react";
import { SnapshotCard } from "@/components/advisor/SnapshotCard";
import { cn } from "@/lib/utils";

const STATUS_CHIP = {
  reply: "bg-mint/12 text-mint",
  sent: "bg-hairline text-muted-ink",
  draft: "bg-highlight text-brass",
  warm: "bg-rose/10 text-rose",
};

/** The alumni the student is in conversation with, and where each thread stands. */
export function TalkingToCard({ firstName, conversations }) {
  return (
    <SnapshotCard title={`${firstName} is talking to`} icon={Users}>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[12.5px] font-semibold text-ink">
          {conversations.length} alumni
        </span>
        <span className="rounded bg-hairline px-1.5 py-0.5 text-[9.5px] font-medium tracking-wide text-muted-ink uppercase">
          IB · Goldman
        </span>
      </div>
      <ul className="mt-2.5 flex flex-col gap-2">
        {conversations.map((convo) => (
          <li key={convo.name} className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#d7d2c8] text-[9.5px] font-semibold text-[#3d3a35]">
              {convo.initials}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[11.5px] font-medium text-ink">
                {convo.name}
              </span>
              <span className="block truncate text-[10px] text-muted-ink-2">
                {convo.role}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wide uppercase",
                STATUS_CHIP[convo.status] ?? "bg-hairline text-muted-ink",
              )}
            >
              {convo.statusLabel}
            </span>
          </li>
        ))}
      </ul>
    </SnapshotCard>
  );
}
