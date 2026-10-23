/**
 * The four fields of an academic profile, used by both the create form and the
 * inline edit form. `idSuffix` keeps ids unique when several forms are on the
 * page; `values` pre-fills the fields when editing.
 */
export default function SubmissionFields({ idSuffix = "", values = {} }) {
  const id = (name) => (idSuffix ? `${name}-${idSuffix}` : name);
  return (
    <>
      <label htmlFor={id("gpa")}>GPA (0–4)</label>
      <input id={id("gpa")} name="gpa" type="number" min="0" max="4" step="0.01" defaultValue={values.gpa} required />
      <label htmlFor={id("completedCourses")}>Completed courses (or None)</label>
      <textarea id={id("completedCourses")} name="completedCourses" maxLength={2000} defaultValue={values.completedCourses} required />
      <label htmlFor={id("major")}>Major</label>
      <input id={id("major")} name="major" maxLength={120} defaultValue={values.major} required />
      <label htmlFor={id("careerGoal")}>Career goal</label>
      <input id={id("careerGoal")} name="careerGoal" maxLength={200} defaultValue={values.careerGoal} required />
    </>
  );
}
