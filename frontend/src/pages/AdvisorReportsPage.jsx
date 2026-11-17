import { Download } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { StudentLink } from "@/components/advisor/StudentLink";
import { LoadError, PageHeading, Panel, Pill, TableHead } from "@/components/PagePanel";
import { Button } from "@/components/ui/button";
import { useLoad } from "@/hooks/useLoad";
import { downloadText, toCsv } from "@/lib/csv";
import { todayIsoDate } from "@/lib/format";
import { fetchStudentReports } from "@/services/advisorService";

const SECTIONS = advisorSections("reports");

/** The report's columns, shared by the table and the CSV so the two never disagree. */
const COLUMNS = [
  { header: "Name", value: (row) => row.name },
  { header: "Email", value: (row) => row.email },
  { header: "Class year", value: (row) => row.classYear ?? "" },
  { header: "Submissions", value: (row) => row.submissions },
  { header: "Applications", value: (row) => row.applications },
  { header: "Offers", value: (row) => row.offers },
  { header: "Appointments", value: (row) => row.appointments },
  { header: "Conversations", value: (row) => row.conversations },
  { header: "Resume", value: (row) => (row.resume ? "Yes" : "No") },
];

const NUMBER_COLUMNS = ["submissions", "applications", "offers", "appointments", "conversations"];

/** Reports: one row per student account, downloadable as CSV. */
export function AdvisorReportsPage() {
  const { session, logout, restartDemo } = useAuth();
  const { data: rows, error, reload } = useLoad(fetchStudentReports);

  function download() {
    downloadText(`streetcar-students-${todayIsoDate()}.csv`, toCsv(COLUMNS, rows));
  }

  return (
    <AppShell sections={SECTIONS} user={advisorShellUser(session)} onSignOut={logout} onRestart={restartDemo}>
      <PageHeading title="Reports" lede="Every student account and their activity, one row each.">
        <Button
          type="button"
          onClick={download}
          disabled={!rows || rows.length === 0}
          className="h-9 rounded-lg bg-ink px-3.5 text-[13px] font-medium hover:bg-ink-2"
        >
          <Download className="size-4" />
          Download CSV
        </Button>
      </PageHeading>

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!rows && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading the student report…</p>}

      {rows && (
        <Panel className="mt-6" title="Students" meta={`${rows.length} accounts`}>
          {rows.length === 0 ? (
            <p className="text-[13px] text-muted-ink">No student accounts yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <TableHead headings={COLUMNS.map((column) => column.header)} />
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-hairline last:border-0">
                    <td className="py-2.5 pr-3 text-[13px]">
                      <StudentLink id={row.id} name={row.name} />
                    </td>
                    <td className="py-2.5 pr-3 text-[12.5px] text-muted-ink">{row.email}</td>
                    <td className="py-2.5 pr-3 text-[12.5px] text-ink-2 tnum">{row.classYear ?? "—"}</td>
                    {NUMBER_COLUMNS.map((key) => (
                      <td key={key} className="py-2.5 pr-3 text-[13px] text-ink tnum">
                        {row[key]}
                      </td>
                    ))}
                    <td className="py-2.5">
                      {row.resume ? <Pill tone="mint">On file</Pill> : <Pill>None</Pill>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      )}
    </AppShell>
  );
}
