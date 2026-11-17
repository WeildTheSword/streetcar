import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { BarRow, LoadError, PageHeading, Panel, StatTile } from "@/components/PagePanel";
import { useLoad } from "@/hooks/useLoad";
import { fetchHiringTrends } from "@/services/advisorService";

const SECTIONS = advisorSections("trends");

const maxOf = (rows, key) => rows.reduce((max, row) => Math.max(max, row[key]), 0);

/** A panel of bar rows, or a line saying there is nothing to show. */
function BarPanel({ title, meta, rows, empty, label, value, detail, ariaLabel }) {
  const max = maxOf(rows, value);
  return (
    <Panel title={title} meta={meta}>
      {rows.length === 0 ? (
        <p className="text-[13px] text-muted-ink">{empty}</p>
      ) : (
        <ul className="flex flex-col" aria-label={ariaLabel}>
          {rows.map((row) => (
            <BarRow
              key={row[label]}
              label={row[label]}
              value={row[value]}
              max={max}
              detail={detail?.(row)}
            />
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** Internal Hiring Trends: where students are applying, and where alumni work and live. */
export function AdvisorTrendsPage() {
  const { session, logout, restartDemo } = useAuth();
  const { data: trends, error, reload } = useLoad(fetchHiringTrends);

  return (
    <AppShell sections={SECTIONS} user={advisorShellUser(session)} onSignOut={logout} onRestart={restartDemo}>
      <PageHeading
        title="Internal Hiring Trends"
        lede="Where Tulane students are applying, and where Tulane alumni have landed."
      />

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!trends && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading hiring trends…</p>}

      {trends && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="grid max-w-[640px] grid-cols-3 gap-3">
            <StatTile label="Student applications" value={trends.totalApplications} />
            <StatTile label="Companies" value={trends.studentApplications.length} />
            <StatTile label="Alumni on Streetcar" value={trends.totalAlumni} />
          </div>

          <BarPanel
            title="Student applications by company"
            meta={`${trends.totalApplications} applications`}
            rows={trends.studentApplications}
            empty="No student has tracked an application yet."
            label="company"
            value="applications"
            detail={(row) => `${row.interviews} interviews · ${row.offers} offers`}
            ariaLabel="Student applications by company"
          />

          <div className="grid grid-cols-2 items-start gap-4">
            <BarPanel
              title="Alumni by employer"
              meta={`${trends.alumniEmployers.length} employers`}
              rows={trends.alumniEmployers}
              empty="No alumni employers on file."
              label="employer"
              value="alumni"
              ariaLabel="Alumni by employer"
            />
            <BarPanel
              title="Alumni by city"
              meta={`${trends.alumniCities.length} cities`}
              rows={trends.alumniCities}
              empty="No alumni cities on file."
              label="city"
              value="alumni"
              ariaLabel="Alumni by city"
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
