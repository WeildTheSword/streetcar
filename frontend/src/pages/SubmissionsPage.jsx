import { useEffect, useState } from "react";
import { createSubmission, fetchSubmissions } from "../services/submissionService";
import "../App.css";

export default function SubmissionsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");

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
      <ul>
        {records.map((record) => (
          <li key={record.id}>
            <strong>{record.major} — {record.careerGoal}</strong>
            <p>GPA: {record.gpa} · Completed courses: {record.completedCourses}</p>
            <small>Submitted {new Date(record.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
