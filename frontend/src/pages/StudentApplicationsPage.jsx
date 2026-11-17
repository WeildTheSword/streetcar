import { useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { studentSections, studentShellUser } from "@/components/student/studentNav";
import { LoadError, PageHeading, Panel, Pill, StatTile, TableHead } from "@/components/PagePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoad } from "@/hooks/useLoad";
import { useStudentCounts } from "@/hooks/useStudentCounts";
import { APPLICATION_STATUSES, applicationStatus } from "@/lib/applicationStatus";
import { formatDate, todayIsoDate } from "@/lib/format";
import {
  createApplication,
  deleteApplication,
  fetchApplications,
  updateApplication,
} from "@/services/studentService";

const STATUSES = APPLICATION_STATUSES;

const BLANK = { company: "", roleTitle: "", status: "applied", appliedOn: "", notes: "" };

// The order GET /me/applications uses: appliedOn desc, then id desc.
const byApplied = (a, b) => b.appliedOn.localeCompare(a.appliedOn) || b.id - a.id;

/** The client-side checks the API also makes, so most mistakes never leave the page. */
function problemWith(form) {
  if (!form.company.trim()) return "Enter the company.";
  if (form.company.trim().length > 120) return "Keep the company to 120 characters.";
  if (!form.roleTitle.trim()) return "Enter the role.";
  if (form.roleTitle.trim().length > 160) return "Keep the role to 160 characters.";
  if (!form.appliedOn) return "Choose the date you applied.";
  if (form.appliedOn > todayIsoDate()) return "The applied date cannot be in the future.";
  if (form.notes.length > 500) return "Keep the notes to 500 characters.";
  return null;
}

const fieldClass = "h-9 rounded-lg border-hairline-strong bg-white text-[13px]";
const labelClass = "text-[12.5px] font-medium text-ink-2";

/** Applications: a tracker for every job the student has applied to, with add, edit and delete. */
export function StudentApplicationsPage() {
  const { session, logout, restartDemo } = useAuth();
  const { counts, refresh } = useStudentCounts();
  const { data: applications, error, setData: setApplications, reload } = useLoad(fetchApplications);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState(null);

  const set = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  function startEdit(application) {
    setEditingId(application.id);
    setForm({
      company: application.company,
      roleTitle: application.roleTitle,
      status: application.status,
      appliedOn: application.appliedOn,
      notes: application.notes ?? "",
    });
    setFormError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(BLANK);
    setFormError(null);
  }

  async function save(event) {
    event.preventDefault();
    const problem = problemWith(form);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError(null);
    setSaving(true);
    const body = {
      company: form.company.trim(),
      roleTitle: form.roleTitle.trim(),
      status: form.status,
      appliedOn: form.appliedOn,
      notes: form.notes.trim() || null,
    };
    try {
      if (editingId) {
        const saved = await updateApplication(editingId, body);
        setApplications((previous) => previous.map((a) => (a.id === saved.id ? saved : a)).sort(byApplied));
      } else {
        const saved = await createApplication(body);
        setApplications((previous) => [...previous, saved].sort(byApplied));
        refresh();
      }
      resetForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    setRowError(null);
    setBusyId(id);
    try {
      await deleteApplication(id);
      setApplications((previous) => previous.filter((a) => a.id !== id));
      setConfirmingId(null);
      if (editingId === id) resetForm();
      refresh();
    } catch (err) {
      setRowError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const tally = Object.fromEntries(STATUSES.map((status) => [status.value, 0]));
  for (const application of applications ?? []) {
    if (application.status in tally) tally[application.status] += 1;
  }

  return (
    <AppShell
      sections={studentSections("applications", counts)}
      user={studentShellUser(session)}
      onSignOut={logout}
      onRestart={restartDemo}
    >
      <PageHeading title="Applications" lede="Every role you have applied to, and where each one stands." />

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!applications && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading applications…</p>}

      {applications && (
        <>
          <div className="mt-6 grid grid-cols-5 gap-3" role="group" aria-label="Applications by status">
            <StatTile label="Total" value={applications.length} />
            {STATUSES.map((status) => (
              <StatTile key={status.value} label={status.label} value={tally[status.value]} />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-[1fr_320px] items-start gap-6">
            <Panel title="Tracker" meta={`${applications.length} applications`}>
              {rowError && <p role="alert" className="mb-3 text-[13px] text-rose">{rowError}</p>}
              {applications.length === 0 ? (
                <p className="text-[13px] text-muted-ink">No applications tracked yet. Add your first one with the form.</p>
              ) : (
                <table className="w-full border-collapse">
                  <TableHead headings={["Company and role", "Status", "Applied", ""]} />
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application.id} className="border-b border-hairline align-top last:border-0">
                        <td className="py-3 pr-3">
                          <div className="text-[13px] font-semibold text-ink">{application.company}</div>
                          <div className="text-[12px] text-ink-2">{application.roleTitle}</div>
                          {application.notes && (
                            <p className="mt-1 line-clamp-2 text-[11.5px] text-muted-ink">{application.notes}</p>
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          <Pill tone={applicationStatus(application.status).tone}>
                            {applicationStatus(application.status).label}
                          </Pill>
                        </td>
                        <td className="py-3 pr-3 text-[12.5px] whitespace-nowrap text-ink-2 tnum">
                          {formatDate(application.appliedOn)}
                        </td>
                        <td className="py-3">
                          {confirmingId === application.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                disabled={busyId === application.id}
                                onClick={() => remove(application.id)}
                                className="h-7 rounded-lg text-[11.5px] text-rose"
                              >
                                {busyId === application.id ? "Deleting…" : "Confirm delete"}
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
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                aria-label={`Edit ${application.company}`}
                                onClick={() => startEdit(application)}
                                className="h-7 rounded-lg text-[11.5px]"
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                aria-label={`Delete ${application.company}`}
                                onClick={() => setConfirmingId(application.id)}
                                className="h-7 rounded-lg text-[11.5px]"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>

            <Panel title={editingId ? "Edit application" : "Add an application"}>
              <form onSubmit={save} className="flex flex-col gap-3.5" noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="application-company" className={labelClass}>Company</Label>
                  <Input
                    id="application-company"
                    value={form.company}
                    onChange={set("company")}
                    placeholder="Goldman Sachs"
                    className={fieldClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="application-role" className={labelClass}>Role</Label>
                  <Input
                    id="application-role"
                    value={form.roleTitle}
                    onChange={set("roleTitle")}
                    placeholder="IB Summer Analyst"
                    className={fieldClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="application-status" className={labelClass}>Status</Label>
                    <select
                      id="application-status"
                      value={form.status}
                      onChange={set("status")}
                      className="h-9 rounded-lg border border-hairline-strong bg-white px-2.5 text-[13px] text-ink"
                    >
                      {STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="application-applied" className={labelClass}>Applied on</Label>
                    <Input
                      id="application-applied"
                      type="date"
                      max={todayIsoDate()}
                      value={form.appliedOn}
                      onChange={set("appliedOn")}
                      className={fieldClass}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="application-notes" className={labelClass}>Notes</Label>
                  <textarea
                    id="application-notes"
                    rows={3}
                    value={form.notes}
                    onChange={set("notes")}
                    placeholder="Referral from Sarah Kim"
                    className="rounded-lg border border-hairline-strong bg-white px-2.5 py-2 text-[13px] text-ink focus-visible:ring-[3px] focus-visible:ring-burgundy/25 focus-visible:outline-none"
                  />
                </div>
                {formError && <p role="alert" className="text-[12.5px] text-rose">{formError}</p>}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-9 flex-1 rounded-lg bg-ink text-[13px] font-medium hover:bg-ink-2"
                  >
                    {saving ? "Saving…" : editingId ? "Save changes" : "Add application"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="ghost" onClick={resetForm} className="h-9 rounded-lg text-[13px]">
                      Cancel edit
                    </Button>
                  )}
                </div>
              </form>
            </Panel>
          </div>
        </>
      )}
    </AppShell>
  );
}
