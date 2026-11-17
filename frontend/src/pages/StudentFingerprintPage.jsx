import { Link } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { studentSections, studentShellUser } from "@/components/student/studentNav";
import { BarRow, LoadError, PageHeading, Panel, Pill, StatTile, TableHead } from "@/components/PagePanel";
import { useLoad } from "@/hooks/useLoad";
import { useStudentCounts } from "@/hooks/useStudentCounts";
import { fetchStudent } from "@/services/api";

/** Fingerprint: the career fingerprint Streetcar assembled, and a way to take it again. */
export function StudentFingerprintPage() {
  const { session, logout, restartDemo } = useAuth();
  const { counts } = useStudentCounts();
  const { data: student, error, reload } = useLoad(() => fetchStudent(session.profileId));

  const adjacent = student?.adjacentPaths ?? [];
  const transcript = student?.transcript ?? [];
  const courses = student?.courses ?? [];

  return (
    <AppShell
      sections={studentSections("fingerprint", counts)}
      user={studentShellUser(session)}
      onSignOut={logout}
      onRestart={restartDemo}
    >
      <PageHeading title="Fingerprint" lede="The career fingerprint Streetcar built from your record.">
        <Link
          to="/onboarding"
          className="inline-flex h-9 items-center rounded-lg bg-ink px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-ink-2"
        >
          Retake fingerprint
        </Link>
      </PageHeading>

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!student && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading your fingerprint…</p>}

      {student && (
        <div className="mt-6 flex max-w-[960px] flex-col gap-4">
          <div className="grid grid-cols-4 gap-3">
            <StatTile label="Major" value={student.major} />
            <StatTile label="Year" value={student.year} />
            <StatTile label="GPA" value={student.gpa} />
            <StatTile label="Match" value={`${student.matchPercent}%`} hint={student.targetRole} />
          </div>

          <Panel title="Target role" meta={student.targetRole}>
            <p className="text-[13px] text-ink-2">{student.matchBasis}</p>
          </Panel>

          <div className="grid grid-cols-2 items-start gap-4">
            <Panel title="Adjacent paths" meta={`${adjacent.length} paths`}>
              {adjacent.length === 0 ? (
                <p className="text-[13px] text-muted-ink">No adjacent paths yet.</p>
              ) : (
                <ul className="flex flex-col">
                  {adjacent.map((path) => (
                    <BarRow
                      key={path.title}
                      label={path.title}
                      value={path.fitPercent}
                      display={`${path.fitPercent}%`}
                      max={100}
                    />
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Recommended courses" meta={`${courses.length} courses`}>
              {courses.length === 0 ? (
                <p className="text-[13px] text-muted-ink">No course recommendations yet.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-hairline">
                  {courses.map((course) => (
                    <li key={course.code} className="py-2.5 leading-tight first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-ink">
                          {course.code} — {course.title}
                        </span>
                        {course.fit && <Pill tone="mint">Fit {course.fit}</Pill>}
                      </div>
                      {course.why && <p className="mt-1 text-[12px] text-muted-ink">{course.why}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title="Transcript" meta={`${transcript.length} courses`}>
            {transcript.length === 0 ? (
              <p className="text-[13px] text-muted-ink">No transcript on file.</p>
            ) : (
              <table className="w-full border-collapse">
                <TableHead headings={["Term", "Course", "Credits", "Grade"]} />
                <tbody>
                  {transcript.map((row) => (
                    <tr key={`${row.term}-${row.code}`} className="border-b border-hairline last:border-0">
                      <td className="py-2 pr-3 text-[12.5px] text-muted-ink">{row.term}</td>
                      <td className="py-2 pr-3 text-[13px] text-ink">
                        <span className="font-medium tnum">{row.code}</span> {row.title}
                      </td>
                      <td className="py-2 pr-3 text-[12.5px] text-ink-2 tnum">{row.credits}</td>
                      <td className="py-2 text-[12.5px] font-medium text-ink">{row.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
