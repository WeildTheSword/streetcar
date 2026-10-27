import { cn } from "@/lib/utils";

/** The eyebrow-titled card that makes up each step of the path row. */
export function SectionCard({ eyebrow, children, className, ...rest }) {
  return (
    <div
      {...rest}
      className={cn(
        "flex flex-col rounded-[10px] border border-hairline bg-surface px-4 pt-3.5 pb-4",
        className,
      )}
    >
      <div className="text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
        {eyebrow}
      </div>
      {children}
    </div>
  );
}

/** The dashed-rule call to action that closes each path-step card. */
export function CardCta({ children }) {
  return (
    <button className="mt-3 border-t border-dashed border-hairline pt-2.5 text-left text-[11.5px] font-medium text-burgundy hover:underline">
      {children}
    </button>
  );
}
