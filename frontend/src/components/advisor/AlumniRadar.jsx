import { cn } from "@/lib/utils";

/** Recent alumni role changes matched against open student tracks. */
export function AlumniRadar({ alumniRadar }) {
  return (
    <section data-tour="radar" className="mt-7 rounded-[10px] border border-hairline bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Alumni Radar
          </h3>
          <span className="text-[12px] text-muted-ink">
            Recent role announcements matching open student tracks
          </span>
        </div>
        <button className="text-[12.5px] font-medium text-ink hover:underline">
          View all →
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-hairline text-left">
            {["Alum", "New role", "City", "Matches", ""].map((heading, index) => (
              <th
                key={heading || index}
                className="pb-2 text-[10.5px] font-medium tracking-wide text-muted-ink-2 uppercase"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {alumniRadar.map((row) => (
            <tr key={row.name} className="border-b border-hairline last:border-0">
              <td className="py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d7d2c8] text-[10px] font-semibold text-[#3d3a35]">
                    {row.initials}
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[12.5px] font-semibold text-ink">
                      {row.name}
                    </span>
                    <span className="block text-[11px] text-muted-ink-2">{row.school}</span>
                  </span>
                </div>
              </td>
              <td className="py-3 text-[12.5px] text-ink-2">{row.newRole}</td>
              <td className="py-3 text-[12.5px] text-muted-ink">{row.city}</td>
              <td className="py-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[12px]",
                    row.matches > 0 ? "text-ink-2" : "text-muted-ink-2",
                  )}
                >
                  {row.matches > 0 && <span className="size-1.5 rounded-full bg-mint" />}
                  {row.matchLabel}
                </span>
              </td>
              <td className="py-3 text-right">
                <button className="text-[12.5px] font-medium text-ink hover:underline">
                  {row.matches > 0 ? "Draft intro →" : "Archive →"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
