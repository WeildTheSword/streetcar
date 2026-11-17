import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AdvisorAppointmentsPage } from "./AdvisorAppointmentsPage";
import {
  cancelAppointment,
  createAppointment,
  fetchAppointments,
  fetchStudents,
} from "@/services/advisorService";

vi.mock("@/services/advisorService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Bill Hudlow", subtitle: "Freeman · Consultant", initials: "BH" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const MORGAN_AT_1130 = {
  id: 1,
  studentId: 2,
  studentName: "Morgan Thibodaux",
  initials: "MT",
  startsAt: "2026-11-17T17:30:00Z",
  tags: ["Interview Thursday"],
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdvisorAppointmentsPage />
    </MemoryRouter>,
  );

describe("AdvisorAppointmentsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchStudents.mockResolvedValue([
      { id: 2, name: "Morgan Thibodaux", email: "morgan@tulane.edu", submissionCount: 1 },
      { id: 4, name: "Chris Boudreaux", email: "chris@tulane.edu", submissionCount: 0 },
    ]);
  });

  test("renders the advisor's booked appointments", async () => {
    // Arrange
    fetchAppointments.mockResolvedValue([MORGAN_AT_1130]);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("Interview Thursday")).toBeInTheDocument();
    expect(screen.getByText("Morgan Thibodaux", { selector: "div" })).toBeInTheDocument();
    expect(screen.getByText("1 sessions")).toBeInTheDocument();
  });

  test("booking a student adds the new appointment to the list", async () => {
    // Arrange
    fetchAppointments.mockResolvedValue([]);
    createAppointment.mockResolvedValue({
      id: 7,
      studentId: 4,
      studentName: "Chris Boudreaux",
      initials: "CB",
      startsAt: "2026-11-18T20:00:00Z",
      tags: ["First session"],
    });
    renderPage();
    await screen.findByText("No appointments booked.");

    // Act
    fireEvent.change(screen.getByLabelText("Student"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Date and time"), { target: { value: "2026-11-18T14:00" } });
    fireEvent.change(screen.getByLabelText("Tags"), { target: { value: "First session" } });
    fireEvent.click(screen.getByRole("button", { name: "Book appointment" }));

    // Assert
    expect(await screen.findByText("First session")).toBeInTheDocument();
    expect(createAppointment).toHaveBeenCalledWith({
      studentId: 4,
      startsAt: new Date("2026-11-18T14:00").toISOString(),
      tags: "First session",
    });
  });

  test("booking without a student asks for one and sends nothing", async () => {
    // Arrange
    fetchAppointments.mockResolvedValue([]);
    renderPage();
    await screen.findByText("No appointments booked.");

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Book appointment" }));

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a student and a date and time.");
    expect(createAppointment).not.toHaveBeenCalled();
  });

  test("cancelling asks once more, then removes the appointment", async () => {
    // Arrange
    fetchAppointments.mockResolvedValue([MORGAN_AT_1130]);
    cancelAppointment.mockResolvedValue(null);
    renderPage();
    await screen.findByText("Interview Thursday");

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm cancel" }));

    // Assert
    await waitFor(() => expect(screen.queryByText("Interview Thursday")).not.toBeInTheDocument());
    expect(cancelAppointment).toHaveBeenCalledWith(1);
  });
});
