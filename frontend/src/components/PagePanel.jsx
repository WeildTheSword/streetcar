import { cn } from "@/lib/utils";

/** A page heading in the console's product language: title, one-line lede, optional actions. */
export function PageHeading({ title, lede, children }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {lede && <p className="mt-1.5 text-[13.5px] text-muted-ink">{lede}</p>}
      </div>
      {children}
    </div>
  );
}

/** A bordered card section with an optional heading. */
export function Panel({ title, meta, className, children }) {
  return (
    <section className={cn("rounded-[10px] border border-hairline bg-surface p-5", className)}>
      {title && (
        <div className="mb-3.5 flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
          {meta && <span className="text-[12px] text-muted-ink">{meta}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

/** The round initials badge used across the console. */
export function Initials({ children }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d7d2c8] text-[10px] font-semibold text-[#3d3a35]">
      {children}
    </span>
  );
}

/** A small muted pill, for tags and statuses. */
export function Pill({ children }) {
  return (
    <span className="rounded bg-hairline/70 px-1.5 py-0.5 text-[10.5px] text-muted-ink">{children}</span>
  );
}
