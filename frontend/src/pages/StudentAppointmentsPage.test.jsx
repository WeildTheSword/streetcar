import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { StudentAppointmentsPage } from "./StudentAppointmentsPage";
import { fetchMyAppointments } from "@/services/studentService";

vi.mock("@/services/studentService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Morgan Thibodaux", subtitle: "Finance + CS · Junior", initials: "MT" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <StudentAppointmentsPage />
    </MemoryRouter>,
  );

const panel = (heading) => screen.getByRole("heading", { name: heading }).closest("section");

describe("StudentAppointmentsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("splits appointments into upcoming and past", async () => {
    // Arrange
    fetchMyAppointments.mockResolvedValue([
      { id: 1, withName: "Bill Hudlow", startsAt: "2020-03-02T15:00:00Z", tags: ["First session"] },
      { id: 2, withName: "Bill Hudlow", startsAt: "2099-03-02T15:00:00Z", tags: ["Mock interview"] },
    ]);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("Mock interview")).toBeInTheDocument();
    expect(within(panel("Upcoming")).getByText("Mock interview")).toBeInTheDocument();
    expect(within(panel("Past")).getByText("First session")).toBeInTheDocument();
    expect(screen.getByText("1 booked")).toBeInTheDocument();
  });

  test("with nothing booked both lists say so", async () => {
    // Arrange
    fetchMyAppointments.mockResolvedValue([]);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText(/Nothing booked/)).toBeInTheDocument();
    expect(screen.getByText("No past sessions yet.")).toBeInTheDocument();
  });

  test("a failed load can be retried", async () => {
    // Arrange
    fetchMyAppointments
      .mockRejectedValueOnce(new Error("Unable to load your appointments. Please try again."))
      .mockResolvedValue([{ id: 2, withName: "Bill Hudlow", startsAt: "2099-03-02T15:00:00Z", tags: [] }]);
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load your appointments.");

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    // Assert
    expect(await screen.findByText("Bill Hudlow")).toBeInTheDocument();
  });
});
