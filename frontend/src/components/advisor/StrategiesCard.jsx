import { Sparkles } from "lucide-react";
import { SnapshotCard } from "@/components/advisor/SnapshotCard";
import { Button } from "@/components/ui/button";

/** The suggested plays for the session, with a link to the full playbook. */
export function StrategiesCard({ firstName, strategies }) {
  return (
    <SnapshotCard
      title={`Strategies for ${firstName}`}
      icon={Sparkles}
      className="border-brass/35 bg-highlight"
    >
      <ul className="mt-3 flex flex-1 flex-col gap-2">
        {strategies.map((strategy) => (
          <li
            key={strategy.number}
            className="grid grid-cols-[24px_1fr] items-center gap-2 rounded-lg border border-brass/25 bg-white px-2.5 py-2"
          >
            <span className="rounded bg-hairline px-1 py-0.5 text-center text-[9.5px] font-semibold text-muted-ink tnum">
              {strategy.number}
            </span>
            <span className="text-[11.5px] font-medium text-ink">{strategy.text}</span>
          </li>
        ))}
      </ul>
      <Button className="mt-3 h-7 rounded-lg bg-ink text-[11.5px] hover:bg-ink-2">
        Open full playbook →
      </Button>
    </SnapshotCard>
  );
}
