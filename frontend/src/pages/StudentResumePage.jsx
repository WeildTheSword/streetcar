import { useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { studentSections, studentShellUser } from "@/components/student/studentNav";
import { LoadError, PageHeading, Panel } from "@/components/PagePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoad } from "@/hooks/useLoad";
import { useStudentCounts } from "@/hooks/useStudentCounts";
import { formatDateTime } from "@/lib/format";
import { fetchResume, saveResume } from "@/services/studentService";

const FIELDS = [
  { name: "headline", label: "Headline", max: 200, rows: 0, placeholder: "Finance + CS at Tulane, targeting investment banking" },
  { name: "summary", label: "Summary", max: 2000, rows: 4, placeholder: "Two or three sentences on who you are and what you want next." },
  { name: "experience", label: "Experience", max: 4000, rows: 7, placeholder: "One role per line — where, what, and what changed because of you." },
  { name: "skills", label: "Skills", max: 1000, rows: 3, placeholder: "Excel modeling, Python, SQL, valuation" },
];

const BLANK = { headline: "", summary: "", experience: "", skills: "" };

/** The editable fields of a resume, with blanks for anything missing. */
const toForm = (resume) => ({
  headline: resume?.headline ?? "",
  summary: resume?.summary ?? "",
  experience: resume?.experience ?? "",
  skills: resume?.skills ?? "",
});

/** Field-by-field problems, the same checks PUT /me/resume makes. */
function problemsWith(form) {
  const problems = {};
  if (!form.headline.trim()) problems.headline = "Enter a headline.";
  for (const field of FIELDS) {
    if (form[field.name].length > field.max) {
      problems[field.name] = `Keep the ${field.label.toLowerCase()} to ${field.max} characters.`;
    }
  }
  return problems;
}

/** Resume: the student's resume, edited in place and saved to their account. */
export function StudentResumePage() {
  const { session, logout, restartDemo } = useAuth();
  const { counts } = useStudentCounts();
  const [form, setForm] = useState(BLANK);
  const { data: resume, error, setData: setResume, reload } = useLoad(() =>
    fetchResume().then((loaded) => {
      setForm(toForm(loaded));
      return loaded;
    }),
  );
  const [problems, setProblems] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function change(name) {
    return (event) => {
      setForm((previous) => ({ ...previous, [name]: event.target.value }));
      setSaved(false);
    };
  }

  async function save(event) {
    event.preventDefault();
    setSaved(false);
    setSaveError(null);
    const found = problemsWith(form);
    setProblems(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      setResume(await saveResume({ ...form, headline: form.headline.trim() }));
      setSaved(true);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell
      sections={studentSections("resume", counts)}
      user={studentShellUser(session)}
      onSignOut={logout}
      onRestart={restartDemo}
    >
      <PageHeading title="Resume" lede="What your advisor sees before each session. Keep it current." />

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!resume && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading your resume…</p>}

      {resume && (
        <Panel
          className="mt-6 max-w-[760px]"
          title="Your resume"
          meta={resume.updatedAt ? `Last updated ${formatDateTime(resume.updatedAt)}` : "Not saved yet"}
        >
          <form onSubmit={save} className="flex flex-col gap-4" noValidate>
            {FIELDS.map((field) => {
              const id = `resume-${field.name}`;
              const problem = problems[field.name];
              const shared = {
                id,
                value: form[field.name],
                onChange: change(field.name),
                placeholder: field.placeholder,
                "aria-invalid": problem ? true : undefined,
                "aria-describedby": problem ? `${id}-error` : undefined,
              };
              return (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <Label htmlFor={id} className="text-[12.5px] font-medium text-ink-2">
                      {field.label}
                    </Label>
                    <span className="text-[11px] text-muted-ink-2 tnum">
                      {form[field.name].length}/{field.max}
                    </span>
                  </div>
                  {field.rows === 0 ? (
                    <Input {...shared} className="h-9 rounded-lg border-hairline-strong bg-white text-[13px]" />
                  ) : (
                    <textarea
                      {...shared}
                      rows={field.rows}
                      className="rounded-lg border border-hairline-strong bg-white px-2.5 py-2 text-[13px] text-ink focus-visible:ring-[3px] focus-visible:ring-burgundy/25 focus-visible:outline-none"
                    />
                  )}
                  {problem && (
                    <p id={`${id}-error`} role="alert" className="text-[12px] text-rose">
                      {problem}
                    </p>
                  )}
                </div>
              );
            })}

            {saveError && <p role="alert" className="text-[12.5px] text-rose">{saveError}</p>}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="h-9 rounded-lg bg-ink px-4 text-[13px] font-medium hover:bg-ink-2"
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              {saved && (
                <span role="status" className="text-[12.5px] text-[#047857]">
                  Saved
                </span>
              )}
            </div>
          </form>
        </Panel>
      )}
    </AppShell>
  );
}
