/** A titled panel with an optional subtitle and a right-aligned action. */
export function Panel({ title, sub, action, children, ...rest }) {
  return (
    <section {...rest} className="rounded-[10px] border border-hairline bg-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
          {sub && <p className="mt-1 text-[12.5px] text-muted-ink">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
