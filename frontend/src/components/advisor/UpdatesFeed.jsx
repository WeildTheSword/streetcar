import { CheckCircle2, CircleAlert, FileBarChart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const FEED_ICON = {
  alert: { icon: CircleAlert, className: "text-rose" },
  check: { icon: CheckCircle2, className: "text-mint" },
  spark: { icon: Sparkles, className: "text-amber" },
  report: { icon: FileBarChart, className: "text-violet" },
};

/** Recent events across the advisor's students and alumni. */
export function UpdatesFeed({ updates }) {
  return (
    <div>
      <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">Updates</h3>
      <div className="mt-3.5 flex flex-col">
        {updates.map((item) => {
          const { icon: Icon, className } = FEED_ICON[item.kind] ?? FEED_ICON.report;
          return (
            <div
              key={item.title}
              className="flex gap-2.5 border-b border-hairline py-3 last:border-0"
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", className)} strokeWidth={1.8} />
              <div>
                <div className="text-[11px] text-muted-ink-2">{item.time}</div>
                <div className="mt-0.5 text-[12.5px] font-semibold text-ink">
                  {item.title}
                </div>
                <p className="mt-1 text-[11.5px] leading-snug text-muted-ink">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
