import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import SubmissionFields from "./SubmissionFields";
import { hasBlankField } from "../lib/submissionForm";

describe("SubmissionFields", () => {
  test("renders the four fields with the record's values and suffixed ids", () => {
    // Arrange
    const values = { gpa: 3.5, completedCourses: "CMPS 1500", major: "Finance", careerGoal: "Analyst" };

    // Act
    render(<SubmissionFields idSuffix="7" values={values} />);

    // Assert
    expect(screen.getByLabelText("GPA (0–4)")).toHaveValue(3.5);
    expect(screen.getByLabelText("GPA (0–4)")).toHaveAttribute("id", "gpa-7");
    expect(screen.getByLabelText("Completed courses (or None)")).toHaveValue("CMPS 1500");
    expect(screen.getByLabelText("Major")).toHaveValue("Finance");
    expect(screen.getByLabelText("Career goal")).toHaveValue("Analyst");
  });

  test("renders empty fields with plain ids when no record is given", () => {
    // Arrange + Act
    render(<SubmissionFields />);

    // Assert
    expect(screen.getByLabelText("Major")).toHaveValue("");
    expect(screen.getByLabelText("Major")).toHaveAttribute("id", "major");
  });

  test("typing into a field updates its value", () => {
    // Arrange
    render(<SubmissionFields />);
    const goal = screen.getByLabelText("Career goal");

    // Act
    fireEvent.change(goal, { target: { value: "Data engineer" } });

    // Assert
    expect(goal).toHaveValue("Data engineer");
  });

  test("hasBlankField flags a text field that is empty or only spaces", () => {
    // Arrange
    const filled = { gpa: "3", completedCourses: "None", major: "Finance", careerGoal: "Analyst" };

    // Act + Assert
    expect(hasBlankField(filled)).toBe(false);
    expect(hasBlankField({ ...filled, major: "   " })).toBe(true);
    expect(hasBlankField({ ...filled, careerGoal: "" })).toBe(true);
  });
});
