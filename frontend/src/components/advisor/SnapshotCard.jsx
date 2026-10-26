import { cn } from "@/lib/utils";

/** A titled card in the row of four that sums up the next student. */
export function SnapshotCard({ title, icon: Icon, className, children, ...rest }) {
  return (
    <div
      {...rest}
      className={cn(
        "flex flex-col rounded-[10px] border border-hairline bg-surface p-3.5",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[12px] font-medium text-ink-2">
        {Icon && <Icon className="size-3.5 text-muted-ink-2" strokeWidth={1.8} />}
        {title}
      </div>
      {children}
    </div>
  );
}
