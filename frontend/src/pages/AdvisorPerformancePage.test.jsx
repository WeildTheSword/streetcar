import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AdvisorPerformancePage } from "./AdvisorPerformancePage";
import { todayIsoDate } from "@/lib/format";
import { fetchPerformance } from "@/services/advisorService";

vi.mock("@/services/advisorService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Bill Hudlow", subtitle: "Freeman · Consultant", initials: "BH" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const STATS = {
  students: 4, appointmentsTotal: 9, upcoming: 3, completed: 6, thisWeek: 2,
  studentsSeen: 3, coveragePercent: 75,
  weeks: [
    { weekStart: "2020-01-06", appointments: 1 },
    { weekStart: todayIsoDate(), appointments: 2 },
  ],
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdvisorPerformancePage />
    </MemoryRouter>,
  );

describe("AdvisorPerformancePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("shows the stat tiles and one bar per week, the current week marked", async () => {
    // Arrange
    fetchPerformance.mockResolvedValue(STATS);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("75%")).toBeInTheDocument();
    expect(screen.getByText("3 of 4 students seen")).toBeInTheDocument();
    expect(screen.getByText("6 completed")).toBeInTheDocument();
    const weeks = within(screen.getByRole("list", { name: "Appointments by week" })).getAllByRole("listitem");
    expect(weeks).toHaveLength(2);
    expect(weeks[0]).toHaveTextContent("Week of Jan 6, 2020");
    expect(weeks[1]).toHaveTextContent(/^This week/);
    expect(screen.getByRole("link", { name: /Performance/ })).toHaveAttribute("aria-current", "page");
  });

  test("a window with no appointments says so", async () => {
    // Arrange
    fetchPerformance.mockResolvedValue({ ...STATS, weeks: [{ weekStart: "2020-01-06", appointments: 0 }] });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("No appointments in this window yet.")).toBeInTheDocument();
  });

  test("a failed load can be retried", async () => {
    // Arrange
    fetchPerformance
      .mockRejectedValueOnce(new Error("Unable to load performance. Please try again."))
      .mockResolvedValue(STATS);
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load performance.");

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    // Assert
    expect(await screen.findByText("75%")).toBeInTheDocument();
  });
});
