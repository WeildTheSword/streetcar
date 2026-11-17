import { Link } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { studentSections, studentShellUser } from "@/components/student/studentNav";
import { LoadError, PageHeading, Panel, Pill, TableHead } from "@/components/PagePanel";
import { useLoad } from "@/hooks/useLoad";
import { useStudentCounts } from "@/hooks/useStudentCounts";
import { formatDateTime } from "@/lib/format";
import { fetchCourses } from "@/services/courseService";
import { fetchSubmissions } from "@/services/submissionService";

// "CMPS 1500", "cmps-1500" and "CMPS1500" are the same course.
const normalize = (code) => code.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** The most recent submission, by createdAt and then id. */
function latestOf(submissions) {
  return [...submissions].sort(
    (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0) || (b.id ?? 0) - (a.id ?? 0),
  )[0];
}

/** The course codes a submission lists as completed, trimmed and without blanks. */
const completedCodes = (submission) =>
  (submission?.completedCourses ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);

/** Courses: the catalogue, with the courses from the latest submitted profile marked completed. */
export function StudentCoursesPage() {
  const { session, logout, restartDemo } = useAuth();
  const { counts } = useStudentCounts();
  const { data, error, reload } = useLoad(() =>
    Promise.all([fetchCourses(), fetchSubmissions()]).then(([courses, submissions]) => ({
      courses,
      latest: latestOf(submissions ?? []),
    })),
  );

  const completed = completedCodes(data?.latest);
  const completedKeys = new Set(completed.map(normalize));
  const catalogueKeys = new Set((data?.courses ?? []).map((course) => normalize(course.code)));
  const outsideCatalogue = completed.filter((code) => !catalogueKeys.has(normalize(code)));
  const doneInCatalogue = (data?.courses ?? []).filter((course) => completedKeys.has(normalize(course.code)));

  return (
    <AppShell
      sections={studentSections("courses", counts)}
      user={studentShellUser(session)}
      onSignOut={logout}
      onRestart={restartDemo}
    >
      <PageHeading title="Courses" lede="The course catalogue, with what you have already completed marked." />

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!data && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading courses…</p>}

      {data && (
        <div className="mt-6 grid grid-cols-[1fr_300px] items-start gap-6">
          <Panel
            title="Catalogue"
            meta={`${data.courses.length} courses · ${doneInCatalogue.length} completed`}
          >
            {data.courses.length === 0 ? (
              <p className="text-[13px] text-muted-ink">No courses in the catalogue yet.</p>
            ) : (
              <table className="w-full border-collapse">
                <TableHead headings={["Course", "Description", "Status"]} />
                <tbody>
                  {data.courses.map((course) => (
                    <tr key={course.id ?? course.code} className="border-b border-hairline align-top last:border-0">
                      <td className="py-3 pr-3">
                        <div className="text-[13px] font-semibold text-ink tnum">{course.code}</div>
                        <div className="text-[12px] text-ink-2">{course.title}</div>
                      </td>
                      <td className="py-3 pr-3 text-[12.5px] text-muted-ink">{course.description}</td>
                      <td className="py-3">
                        {completedKeys.has(normalize(course.code)) ? (
                          <Pill tone="mint">Completed</Pill>
                        ) : (
                          <span className="text-[12px] text-muted-ink-2">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          <Panel title="Your record" meta={data.latest ? `${completed.length} completed` : undefined}>
            {!data.latest ? (
              <p className="text-[13px] text-muted-ink">
                No profile submitted yet. <Link to="/profiles" className="font-medium text-burgundy underline-offset-2 hover:underline">Submit one</Link> to mark the courses you have completed.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[12px] text-muted-ink">
                  From your profile submitted {formatDateTime(data.latest.createdAt)}.
                </p>
                <div>
                  <h3 className="text-[12.5px] font-medium text-ink-2">Not in the catalogue</h3>
                  {outsideCatalogue.length === 0 ? (
                    <p className="mt-1 text-[12.5px] text-muted-ink">Every completed course is in the catalogue.</p>
                  ) : (
                    <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Completed courses not in the catalogue">
                      {outsideCatalogue.map((code) => (
                        <li key={code}>
                          <Pill>{code}</Pill>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
