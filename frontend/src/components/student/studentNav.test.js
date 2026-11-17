import { describe, expect, test } from "vitest";
import { studentSections, studentShellUser } from "./studentNav";

const items = (sections) => sections.flatMap((section) => section.items);

describe("studentSections", () => {
  test("every item links somewhere, and only the active one is marked", () => {
    // Arrange
    const active = "resume";

    // Act
    const all = items(studentSections(active));

    // Assert
    expect(all.map((item) => item.to)).toEqual([
      "/student",
      "/student/courses",
      "/student/alumni",
      "/student/appointments",
      "/student/applications",
      "/student/fingerprint",
      "/student/resume",
      "/account",
    ]);
    expect(all.filter((item) => item.active).map((item) => item.label)).toEqual(["Resume"]);
  });

  test("counts are left off until the summary has loaded", () => {
    // Arrange
    const counts = { alumni: 3, appointments: 0, applications: 6 };

    // Act
    const before = items(studentSections("path"));
    const after = items(studentSections("path", counts));

    // Assert
    expect(before.every((item) => item.count === undefined)).toBe(true);
    const countOf = (label) => after.find((item) => item.label === label).count;
    expect(countOf("Alumni")).toBe(3);
    expect(countOf("Appointments")).toBe(0);
    expect(countOf("Applications")).toBe(6);
    expect(countOf("Courses")).toBeUndefined();
  });
});

describe("studentShellUser", () => {
  test("uses the session's email when it has one", () => {
    // Arrange
    const session = { displayName: "Alex Rivera", subtitle: "CS · Senior", initials: "AR", email: "alex@tulane.edu" };

    // Act
    const user = studentShellUser(session);

    // Assert
    expect(user).toEqual({ name: "Alex Rivera", subtitle: "CS · Senior", initials: "AR", email: "alex@tulane.edu" });
  });
});
