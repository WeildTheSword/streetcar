import { Star } from "lucide-react";
import { CardCta, SectionCard } from "@/components/student/SectionCard";
import { cn } from "@/lib/utils";

/** The student's target firms, favourites highlighted and starred. */
export function TopFirmsCard({ firms }) {
  return (
    <SectionCard eyebrow="My top firms">
      <ul className="mt-3 flex flex-1 flex-col gap-2">
        {firms.map((firm) => (
          <li
            key={firm.name}
            className={cn(
              "grid grid-cols-[32px_1fr_14px] items-center gap-2.5 rounded-lg border px-2.5 py-2",
              firm.favorite
                ? "border-[#f3e7c4] bg-highlight"
                : "border-hairline bg-white",
            )}
          >
            <span className="flex size-8 items-center justify-center rounded-[7px] bg-[#0b2340] text-[11px] font-bold tracking-[0.02em] text-white">
              {firm.mark}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[12.5px] font-semibold text-ink">
                {firm.name}
              </span>
              <span className="mt-0.5 block text-[11px] leading-[1.3] text-muted-ink">
                {firm.subtitle}
              </span>
            </span>
            <Star
              className={cn(
                "size-3.5",
                firm.favorite ? "fill-[#d9a441] text-[#d9a441]" : "text-hairline-strong",
              )}
            />
          </li>
        ))}
      </ul>
      <CardCta>Refine your target list →</CardCta>
    </SectionCard>
  );
}
