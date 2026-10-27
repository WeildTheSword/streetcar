import { Button } from "@/components/ui/button";
import { Panel } from "@/components/student/Panel";
import { cn } from "@/lib/utils";

const CONVO_CHIP = {
  reply: "text-mint",
  draft: "text-violet",
  warm: "text-rose",
  sent: "text-muted-ink",
};

/** The student's open alumni threads, most recent first. */
export function AlumniConversationsPanel({ conversations }) {
  return (
    <Panel
      title="Alumni conversations"
      sub="4 active · sorted by most recent"
      action={
        <Button
          variant="outline"
          className="h-7 rounded-lg border-hairline-strong bg-white text-[12px]"
        >
          Inbox →
        </Button>
      }
    >
      <div className="flex flex-col">
        {conversations.map((convo) => (
          <div
            key={convo.name}
            className="grid grid-cols-[36px_1fr_auto] gap-3 border-b border-hairline py-3 last:border-0"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-[#d7d2c8] text-[11px] font-semibold text-[#3d3a35]">
              {convo.initials}
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-semibold text-ink">{convo.name}</span>
                <span className="truncate text-[11px] text-muted-ink-2">
                  {convo.role}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-ink">
                {convo.prefix && (
                  <span className="font-medium text-ink-2">{convo.prefix} </span>
                )}
                {convo.snippet}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                <span
                  className={cn(
                    "font-medium",
                    CONVO_CHIP[convo.status] ?? "text-muted-ink",
                  )}
                >
                  {convo.statusLabel}
                </span>
                <span className="text-muted-ink-2">·</span>
                <span className="text-muted-ink-2">{convo.meta}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[11px] whitespace-nowrap text-muted-ink-2">
                {convo.time}
              </span>
              {convo.unread && <span className="size-1.5 rounded-full bg-burgundy" />}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex gap-2 border-t border-hairline pt-3.5">
        <Button className="h-8 flex-1 rounded-lg bg-ink text-[12.5px] hover:bg-ink-2">
          Open Sarah&apos;s reply
        </Button>
        <Button
          variant="outline"
          className="h-8 flex-1 rounded-lg border-hairline-strong bg-white text-[12.5px]"
        >
          Send Rachel&apos;s draft
        </Button>
      </div>
    </Panel>
  );
}
