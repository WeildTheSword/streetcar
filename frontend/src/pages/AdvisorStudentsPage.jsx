import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { Initials, PageHeading, Panel, Pill } from "@/components/PagePanel";
import { formatDateTime, initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fetchStudentAccount, fetchStudents } from "@/services/advisorService";

const SECTIONS = advisorSections("students");

/** One student's account as the advisor sees it: details, submissions, conversations, appointments. */
function StudentDetail({ student }) {
  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <div className="flex items-center gap-3">
          <Initials>{initialsOf(student.name)}</Initials>
          <div className="leading-tight">
            <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">{student.name}</h2>
            <p className="text-[12.5px] text-muted-ink">
              {student.email}
              {student.classYear && ` · ${student.classYear}`}
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Submitted profiles" meta={`${student.submissions.length} on file`}>
        {student.submissions.length === 0 ? (
          <p className="text-[13px] text-muted-ink">No profiles submitted yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-hairline">
            {student.submissions.map((submission) => (
              <li key={submission.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="text-[13.5px] font-medium text-ink">
                  {submission.major} — {submission.careerGoal}
                </div>
                <div className="text-[12px] text-muted-ink">
                  GPA {submission.gpa} · Completed {submission.completedCourses}
                </div>
                <div className="text-[11.5px] text-muted-ink-2">
                  Submitted {formatDateTime(submission.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Talking to" meta={`${student.conversations.length} alumni`}>
          {student.conversations.length === 0 ? (
            <p className="text-[13px] text-muted-ink">No alumni conversations yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {student.conversations.map((convo) => (
                <li key={`${convo.name}-${convo.time}`} className="flex items-start gap-2.5">
                  <Initials>{convo.initials}</Initials>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-ink">{convo.name}</span>
                      <Pill>{convo.statusLabel}</Pill>
                    </div>
                    <div className="text-[11.5px] text-muted-ink">{convo.role}</div>
                    <p className="mt-1 line-clamp-2 text-[12px] text-ink-2">{convo.snippet}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Appointments" meta={`${student.appointments.length} booked`}>
          {student.appointments.length === 0 ? (
            <p className="text-[13px] text-muted-ink">No appointments booked.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {student.appointments.map((appointment) => (
                <li key={appointment.id} className="leading-tight">
                  <div className="text-[13px] font-medium text-ink tnum">
                    {formatDateTime(appointment.startsAt)}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {appointment.tags.map((tag) => (
                      <Pill key={tag}>{tag}</Pill>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

/** My Students: every student account in the database, and any one of them opened in full. */
export function AdvisorStudentsPage() {
  const { session, logout, restartDemo } = useAuth();
  const [students, setStudents] = useState(null);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchStudents()
      .then((list) => !cancelled && setStudents(list))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  async function open(id) {
    setSelectedId(id);
    setSelected(null);
    setDetailError(null);
    try {
      setSelected(await fetchStudentAccount(id));
    } catch (err) {
      setDetailError(err.message);
    }
  }

  return (
    <AppShell sections={SECTIONS} user={advisorShellUser(session)} onSignOut={logout} onRestart={restartDemo}>
      <PageHeading
        title="My Students"
        lede="Every student account in the database. Choose one to open their record."
      />

      {error && <p role="alert" className="mt-5 text-[13.5px] text-rose">{error}</p>}
      {!students && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading students…</p>}

      {students && (
        <div className="mt-6 grid grid-cols-[320px_1fr] items-start gap-6">
          <Panel title="Students" meta={`${students.length} accounts`} className="p-3">
            {students.length === 0 ? (
              <p className="px-2 text-[13px] text-muted-ink">No student accounts yet.</p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {students.map((student) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      onClick={() => open(student.id)}
                      aria-pressed={selectedId === student.id}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-[7px] px-2 py-2 text-left transition-colors",
                        "hover:bg-[#efedea] focus-visible:ring-[3px] focus-visible:ring-burgundy/25 focus-visible:outline-none",
                        selectedId === student.id && "bg-[#ebe9e5]",
                      )}
                    >
                      <Initials>{initialsOf(student.name)}</Initials>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-[13px] font-medium text-ink">{student.name}</span>
                        <span className="block truncate text-[11.5px] text-muted-ink">{student.email}</span>
                      </span>
                      <span className="rounded-full border border-hairline bg-white px-1.5 py-px text-[11px] text-muted-ink-2 tnum">
                        {student.submissionCount}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div>
            {!selectedId && (
              <Panel>
                <p className="text-[13px] text-muted-ink">Choose a student to see their record.</p>
              </Panel>
            )}
            {detailError && <p role="alert" className="text-[13.5px] text-rose">{detailError}</p>}
            {selectedId && !selected && !detailError && (
              <p className="text-[13.5px] text-muted-ink">Opening record…</p>
            )}
            {selected && <StudentDetail student={selected} />}
          </div>
        </div>
      )}
    </AppShell>
  );
}
