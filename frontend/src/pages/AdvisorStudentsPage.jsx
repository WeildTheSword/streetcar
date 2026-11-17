import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { Initials, PageHeading, Panel, Pill } from "@/components/PagePanel";
import { applicationStatus } from "@/lib/applicationStatus";
import { formatDate, formatDateTime, initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fetchStudentAccount, fetchStudents } from "@/services/advisorService";

const SECTIONS = advisorSections("students");

/** The student's tracked applications, most recently applied first. */
function ApplicationsPanel({ applications }) {
  return (
    <Panel title="Applications" meta={`${applications.length} tracked`}>
      {applications.length === 0 ? (
        <p className="text-[13px] text-muted-ink">No applications tracked yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-hairline">
          {applications.map((application) => {
            const status = applicationStatus(application.status);
            return (
              <li key={application.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[13px] font-medium text-ink">
                    {application.company} · {application.roleTitle}
                  </div>
                  {application.notes && (
                    <p className="mt-0.5 line-clamp-1 text-[11.5px] text-muted-ink">{application.notes}</p>
                  )}
                </div>
                <span className="text-[11.5px] text-muted-ink tnum">{formatDate(application.appliedOn)}</span>
                <Pill tone={status.tone}>{status.label}</Pill>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/** The student's resume, or a line saying there is none on file. */
function ResumePanel({ resume }) {
  return (
    <Panel
      title="Resume"
      meta={resume?.updatedAt ? `Updated ${formatDateTime(resume.updatedAt)}` : undefined}
    >
      {!resume ? (
        <p className="text-[13px] text-muted-ink">No resume on file.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-[14px] font-semibold text-ink">{resume.headline}</p>
          {[
            ["Summary", resume.summary],
            ["Experience", resume.experience],
            ["Skills", resume.skills],
          ]
            .filter(([, text]) => text)
            .map(([label, text]) => (
              <div key={label}>
                <h3 className="text-[10.5px] font-medium tracking-wide text-muted-ink-2 uppercase">{label}</h3>
                <p className="mt-0.5 text-[12.5px] whitespace-pre-line text-ink-2">{text}</p>
              </div>
            ))}
        </div>
      )}
    </Panel>
  );
}

/**
 * One student's account as the advisor sees it: details, submissions,
 * applications, resume, conversations and appointments.
 */
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

      <div className="grid grid-cols-2 items-start gap-4">
        <ApplicationsPanel applications={student.applications ?? []} />
        <ResumePanel resume={student.resume ?? null} />
      </div>

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

/**
 * My Students: every student account in the database, and any one of them
 * opened in full. `?student=<id>` opens that student's record on arrival,
 * which is how Reports and Outcomes link here.
 */
export function AdvisorStudentsPage() {
  const { session, logout, restartDemo } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedId = Number(searchParams.get("student")) || null;
  const [students, setStudents] = useState(null);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(requestedId);
  const [selected, setSelected] = useState(null);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchStudents()
      .then((list) => !cancelled && setStudents(list))
      .catch((err) => !cancelled && setError(err.message));
    // A link from Reports or Outcomes names the student to open on arrival.
    if (requestedId) {
      fetchStudentAccount(requestedId)
        .then((account) => !cancelled && setSelected(account))
        .catch((err) => !cancelled && setDetailError(err.message));
    }
    return () => {
      cancelled = true;
    };
  }, [requestedId]);

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
