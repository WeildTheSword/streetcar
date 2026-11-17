import { useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { Initials, LoadError, PageHeading, Panel, Pill } from "@/components/PagePanel";
import { Label } from "@/components/ui/label";
import { useLoad } from "@/hooks/useLoad";
import { formatDateTime, formatRelative, initialsOf } from "@/lib/format";
import { fetchLogs } from "@/services/advisorService";

const SECTIONS = advisorSections("logs");

const TYPES = [
  { value: "signup", label: "Sign-up", tone: "violet" },
  { value: "submission", label: "Submission", tone: "sky" },
  { value: "application", label: "Application", tone: "amber" },
  { value: "conversation", label: "Conversation", tone: "mint" },
  { value: "resume", label: "Resume", tone: "muted" },
  { value: "appointment", label: "Appointment", tone: "rose" },
];
const TYPE_BY_VALUE = Object.fromEntries(TYPES.map((type) => [type.value, type]));

/** Logs: recent activity across Streetcar, newest first, filterable by kind. */
export function AdvisorLogsPage() {
  const { session, logout, restartDemo } = useAuth();
  const { data: entries, error, reload } = useLoad(fetchLogs);
  const [type, setType] = useState("all");

  const shown = (entries ?? []).filter((entry) => type === "all" || entry.type === type);
  const now = new Date();

  return (
    <AppShell sections={SECTIONS} user={advisorShellUser(session)} onSignOut={logout} onRestart={restartDemo}>
      <PageHeading title="Logs" lede="The last 50 things that happened on Streetcar, newest first.">
        <div className="flex items-center gap-2">
          <Label htmlFor="log-type" className="text-[12.5px] font-medium text-ink-2">
            Show
          </Label>
          <select
            id="log-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-9 rounded-lg border border-hairline-strong bg-white px-2.5 text-[13px] text-ink"
          >
            <option value="all">All activity</option>
            {TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </PageHeading>

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!entries && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading activity…</p>}

      {entries && (
        <Panel
          className="mt-6 max-w-[860px]"
          title="Activity"
          meta={type === "all" ? `${entries.length} events` : `${shown.length} of ${entries.length} events`}
        >
          {shown.length === 0 ? (
            <p className="text-[13px] text-muted-ink">
              {entries.length === 0 ? "No activity yet." : "No activity of that kind."}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-hairline" aria-label="Activity">
              {shown.map((entry, index) => {
                const kind = TYPE_BY_VALUE[entry.type] ?? { label: entry.type, tone: "muted" };
                return (
                  <li key={`${entry.type}-${entry.at}-${index}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <Initials>{initialsOf(entry.actor)}</Initials>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-ink">{entry.actor}</span>
                        <Pill tone={kind.tone}>{kind.label}</Pill>
                      </div>
                      <p className="mt-0.5 text-[12.5px] text-ink-2">{entry.detail}</p>
                    </div>
                    <time
                      dateTime={entry.at}
                      title={formatDateTime(entry.at)}
                      className="shrink-0 text-right text-[11.5px] leading-tight text-muted-ink tnum"
                    >
                      <span className="block">{formatRelative(entry.at, now)}</span>
                      <span className="block text-muted-ink-2">{formatDateTime(entry.at)}</span>
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}
    </AppShell>
  );
}
