import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { Initials, PageHeading, Panel, Pill } from "@/components/PagePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime, localInputToIso } from "@/lib/format";
import {
  cancelAppointment,
  createAppointment,
  fetchAppointments,
  fetchStudents,
} from "@/services/advisorService";

const SECTIONS = advisorSections("appointments");

const byStart = (a, b) => new Date(a.startsAt) - new Date(b.startsAt);

/** Appointments: the advisor's bookings, a form to book a student, and cancel on each row. */
export function AdvisorAppointmentsPage() {
  const { session, logout, restartDemo } = useAuth();
  const [appointments, setAppointments] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchAppointments(), fetchStudents()])
      .then(([booked, roster]) => {
        if (cancelled) return;
        setAppointments(booked);
        setStudents(roster);
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  async function book(event) {
    event.preventDefault();
    setFormError(null);
    const iso = localInputToIso(startsAt);
    if (!studentId || !iso) {
      setFormError("Choose a student and a date and time.");
      return;
    }
    setSaving(true);
    try {
      const created = await createAppointment({ studentId: Number(studentId), startsAt: iso, tags });
      setAppointments((previous) => [...previous, created].sort(byStart));
      setStudentId("");
      setStartsAt("");
      setTags("");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function cancel(id) {
    setError(null);
    setBusyId(id);
    try {
      await cancelAppointment(id);
      setAppointments((previous) => previous.filter((appointment) => appointment.id !== id));
      setConfirmingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell sections={SECTIONS} user={advisorShellUser(session)} onSignOut={logout} onRestart={restartDemo}>
      <PageHeading title="Appointments" lede="Your advising sessions, soonest first." />

      <div className="mt-6 grid grid-cols-[1fr_320px] items-start gap-6">
        <Panel title="Booked" meta={appointments ? `${appointments.length} sessions` : undefined}>
          {error && <p role="alert" className="mb-3 text-[13px] text-rose">{error}</p>}
          {!appointments && !error && <p className="text-[13px] text-muted-ink">Loading appointments…</p>}
          {appointments && appointments.length === 0 && (
            <p className="text-[13px] text-muted-ink">No appointments booked.</p>
          )}
          {appointments && appointments.length > 0 && (
            <ul className="flex flex-col divide-y divide-hairline">
              {appointments.map((appointment) => (
                <li key={appointment.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Initials>{appointment.initials}</Initials>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-[13.5px] font-semibold text-ink">{appointment.studentName}</div>
                    <div className="text-[12px] text-muted-ink tnum">{formatDateTime(appointment.startsAt)}</div>
                    {appointment.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {appointment.tags.map((tag) => (
                          <Pill key={tag}>{tag}</Pill>
                        ))}
                      </div>
                    )}
                  </div>
                  {confirmingId === appointment.id ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busyId === appointment.id}
                        onClick={() => cancel(appointment.id)}
                        className="h-7 rounded-lg text-[11.5px] text-rose"
                      >
                        {busyId === appointment.id ? "Cancelling…" : "Confirm cancel"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setConfirmingId(null)}
                        className="h-7 rounded-lg text-[11.5px]"
                      >
                        Keep
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmingId(appointment.id)}
                      className="h-7 rounded-lg text-[11.5px]"
                    >
                      Cancel
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Book a session">
          <form onSubmit={book} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment-student" className="text-[12.5px] font-medium text-ink-2">
                Student
              </Label>
              <select
                id="appointment-student"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="h-9 rounded-lg border border-hairline-strong bg-white px-2.5 text-[13px] text-ink"
              >
                <option value="">Choose a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment-time" className="text-[12.5px] font-medium text-ink-2">
                Date and time
              </Label>
              <Input
                id="appointment-time"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                className="h-9 rounded-lg border-hairline-strong bg-white text-[13px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment-tags" className="text-[12.5px] font-medium text-ink-2">
                Tags
              </Label>
              <Input
                id="appointment-tags"
                placeholder="First session, Resume review"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                className="h-9 rounded-lg border-hairline-strong bg-white text-[13px]"
              />
            </div>
            {formError && <p role="alert" className="text-[12.5px] text-rose">{formError}</p>}
            <Button
              type="submit"
              disabled={saving}
              className="h-9 rounded-lg bg-ink text-[13px] font-medium hover:bg-ink-2"
            >
              {saving ? "Booking…" : "Book appointment"}
            </Button>
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}
