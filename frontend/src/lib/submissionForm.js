// Rules shared by the create and edit forms on the submissions page.

export const BLANK_FIELD_MESSAGE = "Please fill in every field. Enter None if no courses are completed.";

/** True when a text field is empty or only spaces. GPA is checked by the input itself. */
export function hasBlankField(values) {
  return [values.completedCourses, values.major, values.careerGoal].some((value) => !value?.trim());
}

/** Reads a submission form into the shape the API expects. */
export function readSubmission(form) {
  const values = Object.fromEntries(new FormData(form));
  return { ...values, gpa: Number(values.gpa) };
}
