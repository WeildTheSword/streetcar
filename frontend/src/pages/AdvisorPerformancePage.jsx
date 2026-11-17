import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { BarRow, LoadError, PageHeading, Panel, StatTile } from "@/components/PagePanel";
import { useLoad } from "@/hooks/useLoad";
import { formatDate, todayIsoDate } from "@/lib/format";
import { fetchPerformance } from "@/services/advisorService";

const SECTIONS = advisorSections("performance");

/** "YYYY-MM-DD" plus `days`, as a calendar date. */
function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return todayIsoDate(new Date(y, m - 1, d + days));
}

/** Performance: the signed-in advisor's appointment numbers and the eight-week trend around today. */
export function AdvisorPerformancePage() {
  const { session, logout, restartDemo } = useAuth();
  const { data: stats, error, reload } = useLoad(fetchPerformance);

  const today = todayIsoDate();
  const weeks = stats?.weeks ?? [];
  const max = weeks.reduce((most, week) => Math.max(most, week.appointments), 0);
  const isCurrent = (week) => week.weekStart <= today && today <= addDays(week.weekStart, 6);

  return (
    <AppShell sections={SECTIONS} user={advisorShellUser(session)} onSignOut={logout} onRestart={restartDemo}>
      <PageHeading title="Performance" lede="Your advising load and reach, this week and over the last two months." />

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!stats && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading performance…</p>}

      {stats && (
        <div className="mt-6 flex max-w-[960px] flex-col gap-4">
          <div className="grid grid-cols-4 gap-3">
            <StatTile label="Appointments" value={stats.appointmentsTotal} hint={`${stats.completed} completed`} />
            <StatTile label="Upcoming" value={stats.upcoming} />
            <StatTile label="This week" value={stats.thisWeek} />
            <StatTile
              label="Coverage"
              value={`${stats.coveragePercent}%`}
              hint={`${stats.studentsSeen} of ${stats.students} students seen`}
            />
          </div>

          <Panel title="Appointments by week" meta="Five weeks back, this week, two ahead">
            {weeks.length === 0 || max === 0 ? (
              <p className="text-[13px] text-muted-ink">No appointments in this window yet.</p>
            ) : (
              <ul className="flex flex-col" aria-label="Appointments by week">
                {weeks.map((week) => (
                  <BarRow
                    key={week.weekStart}
                    label={isCurrent(week) ? `This week · ${formatDate(week.weekStart)}` : `Week of ${formatDate(week.weekStart)}`}
                    value={week.appointments}
                    max={max}
                    highlight={isCurrent(week)}
                  />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
