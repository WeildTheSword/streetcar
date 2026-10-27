import { Check } from "lucide-react";
import { Panel } from "@/components/student/Panel";
import { cn } from "@/lib/utils";

/** This week's checklist, with done items ticked and faded. */
export function WeeklyActionsPanel({ actions }) {
  const doneCount = actions.filter((action) => action.done).length;

  return (
    <Panel
      title="This week"
      sub={`${actions.length} actions`}
      action={
        <span className="text-[12px] text-muted-ink tnum">
          {doneCount} of {actions.length} done
        </span>
      }
    >
      <div className="flex flex-col gap-3.5">
        {actions.map((action) => (
          <div key={action.title} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-md border",
                action.done
                  ? "border-mint bg-mint text-white"
                  : "border-hairline-strong bg-white",
              )}
            >
              {action.done && <Check className="size-3" strokeWidth={3} />}
            </span>
            <div className={cn(action.done && "opacity-55")}>
              <h5 className="text-[13px] font-medium text-ink">{action.title}</h5>
              <p className="mt-0.5 text-[12px] leading-snug text-muted-ink">
                {action.detail}
              </p>
              <div className="mt-1 text-[11px] text-muted-ink-2">{action.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
