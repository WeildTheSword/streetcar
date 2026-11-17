import { Button } from "@/components/ui/button";
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

const PILL_TONES = {
  muted: "bg-hairline/70 text-muted-ink",
  mint: "bg-mint/12 text-[#047857]",
  amber: "bg-amber/15 text-[#92400e]",
  rose: "bg-rose/10 text-rose",
  sky: "bg-sky/12 text-[#0369a1]",
  violet: "bg-violet/10 text-violet",
};

/** A small pill, for tags and statuses. Muted unless given a `tone`. */
export function Pill({ tone = "muted", children }) {
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10.5px] whitespace-nowrap", PILL_TONES[tone] ?? PILL_TONES.muted)}>
      {children}
    </span>
  );
}

/** One headline number with its label, for the stat rows at the top of a page. */
export function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-[10px] border border-hairline bg-surface px-4 py-3.5">
      <div className="text-[11.5px] text-muted-ink">{label}</div>
      <div className="mt-1 text-[22px] leading-none font-semibold tracking-[-0.02em] text-ink tnum">{value}</div>
      {hint && <div className="mt-1.5 text-[11.5px] text-muted-ink-2">{hint}</div>}
    </div>
  );
}

/**
 * A labelled horizontal bar, its width relative to `max`. A CSS stand-in for a
 * bar chart. `display` replaces the number shown, as in "79%".
 */
export function BarRow({ label, value, max, display, detail, highlight = false }) {
  const width = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <li className="grid grid-cols-[160px_1fr_auto] items-center gap-3 py-1.5">
      <span className={cn("truncate text-[12.5px] text-ink-2", highlight && "font-semibold text-ink")}>{label}</span>
      <span className="h-2 rounded-full bg-hairline/70" aria-hidden="true">
        <span
          className={cn("block h-2 rounded-full", highlight ? "bg-burgundy" : "bg-brass")}
          style={{ width: `${width}%` }}
        />
      </span>
      <span className="min-w-[2ch] text-right text-[12.5px] text-ink tnum">
        {display ?? value}
        {detail && <span className="ml-1.5 text-[11.5px] text-muted-ink">{detail}</span>}
      </span>
    </li>
  );
}

/** A failed load: the message, and a button to try again. */
export function LoadError({ message, onRetry, className }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <p role="alert" className="text-[13.5px] text-rose">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry} className="h-7 rounded-lg text-[11.5px]">
          Try again
        </Button>
      )}
    </div>
  );
}

/** The column headings of a console table. */
export function TableHead({ headings }) {
  return (
    <thead>
      <tr className="border-b border-hairline text-left">
        {headings.map((heading) => (
          <th
            key={heading}
            className="pb-2 pr-3 text-[10.5px] font-medium tracking-wide text-muted-ink-2 uppercase last:pr-0"
          >
            {heading}
          </th>
        ))}
      </tr>
    </thead>
  );
}
