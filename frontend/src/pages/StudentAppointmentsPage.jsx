import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { studentSections, studentShellUser } from "@/components/student/studentNav";
import { LoadError, PageHeading, Panel, Pill } from "@/components/PagePanel";
import { useLoad } from "@/hooks/useLoad";
import { useStudentCounts } from "@/hooks/useStudentCounts";
import { formatDateTime } from "@/lib/format";
import { fetchMyAppointments } from "@/services/studentService";

function AppointmentList({ appointments, empty }) {
  if (appointments.length === 0) {
    return <p className="text-[13px] text-muted-ink">{empty}</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-hairline">
      {appointments.map((appointment) => (
        <li key={appointment.id} className="py-3 leading-tight first:pt-0 last:pb-0">
          <div className="text-[13.5px] font-semibold text-ink">{appointment.withName}</div>
          <div className="text-[12px] text-muted-ink tnum">{formatDateTime(appointment.startsAt)}</div>
          {appointment.tags?.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {appointment.tags.map((tag) => (
                <Pill key={tag}>{tag}</Pill>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

const time = (appointment) => new Date(appointment.startsAt).getTime();

/** Splits appointments at `now`: upcoming soonest first, past most recent first. */
function split(appointments, now = Date.now()) {
  return {
    upcoming: appointments.filter((a) => time(a) >= now).sort((a, b) => time(a) - time(b)),
    past: appointments.filter((a) => time(a) < now).sort((a, b) => time(b) - time(a)),
  };
}

/** Appointments: the student's advising sessions, split into upcoming and past. */
export function StudentAppointmentsPage() {
  const { session, logout, restartDemo } = useAuth();
  const { counts } = useStudentCounts();
  // Split when the list arrives, so "now" is the moment it loaded.
  const { data, error, reload } = useLoad(() => fetchMyAppointments().then((list) => split(list ?? [])));

  return (
    <AppShell
      sections={studentSections("appointments", counts)}
      user={studentShellUser(session)}
      onSignOut={logout}
      onRestart={restartDemo}
    >
      <PageHeading title="Appointments" lede="Your advising sessions — what is coming up, and what you have had." />

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!data && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading appointments…</p>}

      {data && (
        <div className="mt-6 grid max-w-[860px] grid-cols-2 items-start gap-4">
          <Panel title="Upcoming" meta={`${data.upcoming.length} booked`}>
            <AppointmentList
              appointments={data.upcoming}
              empty="Nothing booked. Your advisor schedules sessions from their console."
            />
          </Panel>
          <Panel title="Past" meta={`${data.past.length} sessions`}>
            <AppointmentList appointments={data.past} empty="No past sessions yet." />
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
