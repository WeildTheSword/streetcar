import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { StudentLink } from "@/components/advisor/StudentLink";
import { Initials, LoadError, PageHeading, Panel, StatTile, TableHead } from "@/components/PagePanel";
import { useLoad } from "@/hooks/useLoad";
import { APPLICATION_STATUSES } from "@/lib/applicationStatus";
import { formatDate, initialsOf } from "@/lib/format";
import { fetchOutcomes } from "@/services/advisorService";

const SECTIONS = advisorSections("outcomes");

/** Outcomes: the application funnel across every student, the offers, and who is applying. */
export function AdvisorOutcomesPage() {
  const { session, logout, restartDemo } = useAuth();
  const { data: outcomes, error, reload } = useLoad(fetchOutcomes);

  return (
    <AppShell sections={SECTIONS} user={advisorShellUser(session)} onSignOut={logout} onRestart={restartDemo}>
      <PageHeading title="Outcomes" lede="How student applications are converting, across every student account." />

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!outcomes && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading outcomes…</p>}

      {outcomes && (
        <div className="mt-6 flex max-w-[1040px] flex-col gap-4">
          <div className="grid grid-cols-6 gap-3" role="group" aria-label="Application funnel">
            <StatTile label="Total" value={outcomes.total} />
            {APPLICATION_STATUSES.map((status) => (
              <StatTile key={status.value} label={status.label} value={outcomes.funnel[status.value] ?? 0} />
            ))}
            <StatTile label="Offer rate" value={`${outcomes.offerRate}%`} />
          </div>

          <div className="grid grid-cols-[1fr_1.3fr] items-start gap-4">
            <Panel title="Offers" meta={`${outcomes.offers.length} offers`}>
              {outcomes.offers.length === 0 ? (
                <p className="text-[13px] text-muted-ink">No offers yet.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-hairline">
                  {outcomes.offers.map((offer) => (
                    <li
                      key={`${offer.studentId}-${offer.company}-${offer.roleTitle}`}
                      className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0"
                    >
                      <Initials>{initialsOf(offer.studentName)}</Initials>
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="text-[13px]">
                          <StudentLink id={offer.studentId} name={offer.studentName} />
                        </div>
                        <div className="text-[12px] text-ink-2">
                          {offer.company} · {offer.roleTitle}
                        </div>
                      </div>
                      <span className="text-[11.5px] text-muted-ink tnum">{formatDate(offer.appliedOn)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="By student" meta={`${outcomes.byStudent.length} students applying`}>
              {outcomes.byStudent.length === 0 ? (
                <p className="text-[13px] text-muted-ink">No student has tracked an application yet.</p>
              ) : (
                <table className="w-full border-collapse">
                  <TableHead headings={["Student", "Applications", "Interviews", "Offers"]} />
                  <tbody>
                    {outcomes.byStudent.map((row) => (
                      <tr key={row.studentId} className="border-b border-hairline last:border-0">
                        <td className="py-2.5 pr-3 text-[13px]">
                          <StudentLink id={row.studentId} name={row.studentName} />
                        </td>
                        <td className="py-2.5 pr-3 text-[13px] text-ink tnum">{row.applications}</td>
                        <td className="py-2.5 pr-3 text-[13px] text-ink tnum">{row.interviews}</td>
                        <td className="py-2.5 text-[13px] text-ink tnum">{row.offers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  );
}
