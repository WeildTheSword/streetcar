import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AdvisorDashboard } from "./AdvisorDashboard";
import { fetchAdvisorDashboard } from "@/services/api";
import { FALLBACK_ADVISOR_DASHBOARD } from "@/data/fallback";

vi.mock("@/services/api");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: {
      profileId: "bill-hudlow",
      displayName: "Bill Hudlow",
      subtitle: "Freeman · Consultant",
      initials: "BH",
    },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

// The walkthrough scrolls its target into view; jsdom has no layout to scroll.
const originalScrollIntoView = Element.prototype.scrollIntoView;

const renderDashboard = async () => {
  fetchAdvisorDashboard.mockResolvedValue(FALLBACK_ADVISOR_DASHBOARD);
  const view = render(<AdvisorDashboard />);
  await screen.findByRole("heading", { name: "Your next upcoming appointment" });
  return view;
};

describe("AdvisorDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
    // Skip the Wave's one-time introduction so the walkthrough opens on the advisor steps.
    sessionStorage.setItem("streetcar.guideIntroduced", "1");
  });
  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  test("renders the advisor's greeting and every section of the console", async () => {
    // Arrange
    const { nextStudent, schedule, updates, alumniRadar } = FALLBACK_ADVISOR_DASHBOARD;
    const { container } = await renderDashboard();

    // Act — nothing to act on; this checks what rendered
    // Assert
    expect(fetchAdvisorDashboard).toHaveBeenCalledWith("bill-hudlow");
    expect(screen.getByText("Hi, Bill.")).toBeInTheDocument();
    expect(screen.getByText(nextStudent.targetRole)).toBeInTheDocument();
    expect(screen.getByText("Morgan is talking to")).toBeInTheDocument();
    expect(screen.getByText("Morgan is concerned about")).toBeInTheDocument();
    expect(screen.getByText("Morgan's top firm pick")).toBeInTheDocument();
    expect(screen.getByText("Strategies for Morgan")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Today's Schedule" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Updates" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alumni Radar" })).toBeInTheDocument();
    expect(screen.getByText(schedule[1].studentName)).toBeInTheDocument();
    expect(screen.getByText(updates[0].title)).toBeInTheDocument();
    expect(screen.getByText(alumniRadar[0].name)).toBeInTheDocument();
    for (const target of ["prebrief", "concerns", "radar"]) {
      expect(container.querySelector(`[data-tour="${target}"]`)).toBeInTheDocument();
    }
  });

  test("advancing the walkthrough moves it from the pre-brief to the concerns", async () => {
    // Arrange
    await renderDashboard();
    expect(screen.getByText("The same record, the other side")).toBeInTheDocument();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    // Assert
    expect(screen.getByText("What the student is actually worried about")).toBeInTheDocument();
    expect(screen.queryByText("The same record, the other side")).not.toBeInTheDocument();
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
  });

  test("a failed load says so instead of rendering the console", async () => {
    // Arrange
    fetchAdvisorDashboard.mockRejectedValue(new Error("offline"));

    // Act
    render(<AdvisorDashboard />);

    // Assert
    expect(await screen.findByText("Could not load your console.")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Your next upcoming appointment" }),
    ).not.toBeInTheDocument();
  });
});
