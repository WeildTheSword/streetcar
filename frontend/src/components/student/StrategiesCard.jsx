import { CardCta, SectionCard } from "@/components/student/SectionCard";

/** The numbered strategies recommended for this student. */
export function StrategiesCard({ strategies }) {
  return (
    <SectionCard eyebrow="Strategies for me">
      <ul className="mt-3 flex flex-1 flex-col gap-2">
        {strategies.map((strategy) => (
          <li
            key={strategy.number}
            className="grid grid-cols-[26px_1fr] items-center gap-2.5 rounded-lg border border-hairline bg-white px-3 py-2.5"
          >
            <span className="text-[11px] font-medium text-muted-ink-2 tnum">
              {strategy.number}
            </span>
            <span className="text-[12.5px] font-medium text-ink">{strategy.text}</span>
          </li>
        ))}
      </ul>
      <CardCta>Open full playbook →</CardCta>
    </SectionCard>
  );
}
