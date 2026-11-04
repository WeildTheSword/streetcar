import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AuthContext } from "@/auth/authContext";
import SubmissionsPage from "./SubmissionsPage";
import {
  deleteSubmission,
  fetchSubmissions,
  updateSubmission,
} from "../services/submissionService";

vi.mock("../services/submissionService");

const renderPage = (role = "STUDENT") =>
  render(
    <AuthContext.Provider value={{ session: { role } }}>
      <SubmissionsPage />
    </AuthContext.Provider>,
  );

const record = {
  id: 7,
  gpa: 3.5,
  completedCourses: "CMPS 1500",
  major: "Computer Science",
  careerGoal: "Data analyst",
  createdAt: "2026-09-28T12:00:00Z",
};

const renderWithRecord = async (role = "ADVISOR") => {
  fetchSubmissions.mockResolvedValue([record]);
  renderPage(role);
  await screen.findByText("Computer Science — Data analyst");
};

// The create form and the edit form carry the same labels, so edit queries are
// scoped to the edit fieldset — its legend gives the group its accessible name.
const editForm = () => within(screen.getByRole("group", { name: "Edit profile" }));

describe("SubmissionsPage — the submitted list", () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => vi.restoreAllMocks());

  test("renders a submitted profile with its edit and delete actions", async () => {
    // Arrange
    await renderWithRecord();

    // Act — nothing to act on; this checks what rendered
    // Assert
    expect(screen.getByText(/GPA: 3.5/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  test("a student is not offered the delete control", async () => {
    // Arrange + Act
    await renderWithRecord("STUDENT");

    // Assert
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  test("the API's refusal of a delete is shown to the user", async () => {
    // Arrange
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await renderWithRecord("ADVISOR");
    deleteSubmission.mockRejectedValue(new Error("You do not have permission to do that."));

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("You do not have permission to do that.");
    expect(screen.getByText("Computer Science — Data analyst")).toBeInTheDocument();
  });

  test("a student's list is headed as their own", async () => {
    // Arrange
    fetchSubmissions.mockResolvedValue([record]);

    // Act
    renderPage("STUDENT");

    // Assert
    expect(await screen.findByRole("heading", { name: "Your Submitted Profiles" })).toBeInTheDocument();
  });

  test("an advisor's list is headed as everyone's", async () => {
    // Arrange
    fetchSubmissions.mockResolvedValue([record]);

    // Act
    renderPage("ADVISOR");

    // Assert
    expect(await screen.findByRole("heading", { name: "All Submitted Profiles" })).toBeInTheDocument();
  });

  test("editing sends the changed values to PUT and updates the row in place", async () => {
    // Arrange
    await renderWithRecord();
    updateSubmission.mockResolvedValue({ ...record, careerGoal: "Data engineer" });

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(editForm().getByLabelText("Career goal"), {
      target: { value: "Data engineer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    // Assert
    await waitFor(() => expect(updateSubmission).toHaveBeenCalledTimes(1));
    expect(updateSubmission).toHaveBeenCalledWith(7, {
      gpa: 3.5,
      completedCourses: "CMPS 1500",
      major: "Computer Science",
      careerGoal: "Data engineer",
    });
    expect(await screen.findByText("Computer Science — Data engineer")).toBeInTheDocument();
  });

  test("the edit form opens pre-filled with the record's current values", async () => {
    // Arrange
    await renderWithRecord();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    // Assert
    expect(editForm().getByLabelText("Major")).toHaveValue("Computer Science");
    expect(editForm().getByLabelText("GPA (0–4)")).toHaveValue(3.5);
  });

  test("cancelling an edit leaves the record untouched", async () => {
    // Arrange
    await renderWithRecord();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // Assert
    expect(screen.getByText("Computer Science — Data analyst")).toBeInTheDocument();
    expect(updateSubmission).not.toHaveBeenCalled();
  });

  test("confirming a delete calls DELETE and removes the row without a reload", async () => {
    // Arrange
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await renderWithRecord();
    deleteSubmission.mockResolvedValue(null);

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    // Assert
    await waitFor(() => expect(deleteSubmission).toHaveBeenCalledWith(7));
    expect(await screen.findByText("No profiles submitted yet.")).toBeInTheDocument();
  });

  test("dismissing the confirmation deletes nothing", async () => {
    // Arrange
    vi.spyOn(window, "confirm").mockReturnValue(false);
    await renderWithRecord();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    // Assert
    expect(deleteSubmission).not.toHaveBeenCalled();
    expect(screen.getByText("Computer Science — Data analyst")).toBeInTheDocument();
  });

  test("a failed delete keeps the row and shows the error", async () => {
    // Arrange
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await renderWithRecord();
    deleteSubmission.mockRejectedValue(new Error("Unable to reach the server."));

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    // Assert
    expect(await screen.findByText("Unable to reach the server.")).toBeInTheDocument();
    expect(screen.getByText("Computer Science — Data analyst")).toBeInTheDocument();
  });
});
