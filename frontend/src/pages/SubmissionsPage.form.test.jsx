import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import SubmissionsPage from "./SubmissionsPage";
import {
  createSubmission,
  fetchSubmissions,
} from "../services/submissionService";

vi.mock("../services/submissionService");

const fill = () => {
  fireEvent.change(screen.getByLabelText("GPA (0–4)"), { target: { value: "3.5" } });
  fireEvent.change(screen.getByLabelText("Completed courses (or None)"), {
    target: { value: "CMPS 1500" },
  });
  fireEvent.change(screen.getByLabelText("Major"), { target: { value: "Computer Science" } });
  fireEvent.change(screen.getByLabelText("Career goal"), { target: { value: "Data analyst" } });
};

describe("SubmissionsPage — the create form", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchSubmissions.mockResolvedValue([]);
  });

  test("renders every required field and the submit button", async () => {
    // Arrange
    render(<SubmissionsPage />);

    // Act — nothing to act on; this checks what rendered
    // Assert
    expect(await screen.findByText("No profiles submitted yet.")).toBeInTheDocument();
    expect(screen.getByLabelText("GPA (0–4)")).toBeInTheDocument();
    expect(screen.getByLabelText("Completed courses (or None)")).toBeInTheDocument();
    expect(screen.getByLabelText("Major")).toBeInTheDocument();
    expect(screen.getByLabelText("Career goal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save profile" })).toBeInTheDocument();
  });

  test("submitting sends the typed values to the API once and confirms the save", async () => {
    // Arrange
    createSubmission.mockResolvedValue({
      id: 1,
      gpa: 3.5,
      completedCourses: "CMPS 1500",
      major: "Computer Science",
      careerGoal: "Data analyst",
      createdAt: "2026-09-28T12:00:00Z",
    });
    render(<SubmissionsPage />);
    await screen.findByText("No profiles submitted yet.");
    fill();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    // Assert
    await waitFor(() => expect(createSubmission).toHaveBeenCalledTimes(1));
    expect(createSubmission).toHaveBeenCalledWith({
      gpa: 3.5,
      completedCourses: "CMPS 1500",
      major: "Computer Science",
      careerGoal: "Data analyst",
    });
    expect(await screen.findByText("Academic profile saved.")).toBeInTheDocument();
    expect(screen.getByText("Computer Science — Data analyst")).toBeInTheDocument();
  });

  test("a blank major is rejected in the browser, before any request is made", async () => {
    // Arrange
    render(<SubmissionsPage />);
    await screen.findByText("No profiles submitted yet.");
    fill();
    fireEvent.change(screen.getByLabelText("Major"), { target: { value: "   " } });

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    // Assert
    expect(
      await screen.findByText("Please fill in every field. Enter None if no courses are completed."),
    ).toBeInTheDocument();
    expect(createSubmission).not.toHaveBeenCalled();
  });

  test("an API failure surfaces the service's message instead of a saved confirmation", async () => {
    // Arrange
    createSubmission.mockRejectedValue(new Error("Unable to reach the server."));
    render(<SubmissionsPage />);
    await screen.findByText("No profiles submitted yet.");
    fill();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    // Assert
    expect(await screen.findByText("Unable to reach the server.")).toBeInTheDocument();
    expect(screen.queryByText("Academic profile saved.")).not.toBeInTheDocument();
  });
});
