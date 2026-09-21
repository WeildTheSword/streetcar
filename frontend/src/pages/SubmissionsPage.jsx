import { useEffect, useState } from "react";
import { createSubmission, deleteSubmission, fetchSubmissions, updateSubmission } from "../services/submissionService";
import "../App.css";

export default function SubmissionsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [listError, setListError] = useState("");

  useEffect(() => {
    let active = true;
    fetchSubmissions()
      .then((data) => { if (active) setRecords(data); })
      .catch(() => { if (active) setLoadError("Could not load submissions. Refresh to try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setError("");
    setMessage("");
    if ([values.completedCourses, values.major, values.careerGoal].some((value) => !value.trim())) {
      setError("Please fill in every field. Enter None if no courses are completed.");
      return;
    }
    setSaving(true);
    try {
      const record = await createSubmission({ ...values, gpa: Number(values.gpa) });
      setRecords((previous) => [record, ...previous]);
      form.reset();
      setMessage("Academic profile saved.");
    } catch (err) {
      setError(err.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(event, id) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setListError("");
    if ([values.completedCourses, values.major, values.careerGoal].some((value) => !value.trim())) {
      setListError("Please fill in every field. Enter None if no courses are completed.");
      return;
    }
    setBusyId(id);
    try {
      const updated = await updateSubmission(id, { ...values, gpa: Number(values.gpa) });
      setRecords((previous) => previous.map((record) => (record.id === id ? updated : record)));
      setEditingId(null);
    } catch (err) {
      setListError(err.message || "Could not save changes. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this profile? This cannot be undone.")) return;
    setListError("");
    setBusyId(id);
    try {
      await deleteSubmission(id);
      setRecords((previous) => previous.filter((record) => record.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setListError(err.message || "Could not delete. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="collection" aria-labelledby="collection-title">
      <h1 id="collection-title">Academic Profile</h1>
      <p>Collect the academic background and career goal for course planning. Use sample data for this classroom demo.</p>
      <form onSubmit={submit}>
        <fieldset disabled={saving || loading}>
          <legend>All fields are required</legend>
          <label htmlFor="gpa">GPA (0–4)</label>
          <input id="gpa" name="gpa" type="number" min="0" max="4" step="0.01" required />
          <label htmlFor="completedCourses">Completed courses (or None)</label>
          <textarea id="completedCourses" name="completedCourses" maxLength={2000} required />
          <label htmlFor="major">Major</label>
          <input id="major" name="major" maxLength={120} required />
          <label htmlFor="careerGoal">Career goal</label>
          <input id="careerGoal" name="careerGoal" maxLength={200} required />
          <button type="submit">{saving ? "Saving…" : "Save profile"}</button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <h2>Submitted Profiles</h2>
      {loading && <p role="status">Loading submissions…</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {!loading && !loadError && records.length === 0 && <p>No profiles submitted yet.</p>}
      {listError && <p role="alert">{listError}</p>}
      <ul>
        {records.map((record) => (
          <li key={record.id}>
            {editingId === record.id ? (
              <form onSubmit={(event) => saveEdit(event, record.id)}>
                <fieldset disabled={busyId === record.id}>
                  <legend>Edit profile</legend>
                  <label htmlFor={`gpa-${record.id}`}>GPA (0–4)</label>
                  <input id={`gpa-${record.id}`} name="gpa" type="number" min="0" max="4" step="0.01" defaultValue={record.gpa} required />
                  <label htmlFor={`completedCourses-${record.id}`}>Completed courses (or None)</label>
                  <textarea id={`completedCourses-${record.id}`} name="completedCourses" maxLength={2000} defaultValue={record.completedCourses} required />
                  <label htmlFor={`major-${record.id}`}>Major</label>
                  <input id={`major-${record.id}`} name="major" maxLength={120} defaultValue={record.major} required />
                  <label htmlFor={`careerGoal-${record.id}`}>Career goal</label>
                  <input id={`careerGoal-${record.id}`} name="careerGoal" maxLength={200} defaultValue={record.careerGoal} required />
                  <div className="actions">
                    <button type="submit">{busyId === record.id ? "Saving…" : "Save changes"}</button>
                    <button type="button" onClick={() => { setEditingId(null); setListError(""); }}>Cancel</button>
                  </div>
                </fieldset>
              </form>
            ) : (
              <>
                <strong>{record.major} — {record.careerGoal}</strong>
                <p>GPA: {record.gpa} · Completed courses: {record.completedCourses}</p>
                <small>Submitted {new Date(record.createdAt).toLocaleString()}</small>
                <div className="actions">
                  <button type="button" disabled={busyId === record.id} onClick={() => { setEditingId(record.id); setListError(""); }}>Edit</button>
                  <button type="button" disabled={busyId === record.id} onClick={() => remove(record.id)}>
                    {busyId === record.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
