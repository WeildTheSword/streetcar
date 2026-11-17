import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AdvisorTrendsPage } from "./AdvisorTrendsPage";
import { fetchHiringTrends } from "@/services/advisorService";

vi.mock("@/services/advisorService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Bill Hudlow", subtitle: "Freeman · Consultant", initials: "BH" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const TRENDS = {
  studentApplications: [
    { company: "Goldman Sachs", applications: 3, interviews: 2, offers: 0 },
    { company: "McKinsey", applications: 1, interviews: 0, offers: 1 },
  ],
  alumniEmployers: [{ employer: "Goldman Sachs", alumni: 2 }],
  alumniCities: [{ city: "New York, NY", alumni: 4 }, { city: "New Orleans, LA", alumni: 1 }],
  totalApplications: 4,
  totalAlumni: 5,
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdvisorTrendsPage />
    </MemoryRouter>,
  );

describe("AdvisorTrendsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("shows applications by company and alumni by employer and city", async () => {
    // Arrange
    fetchHiringTrends.mockResolvedValue(TRENDS);

    // Act
    renderPage();

    // Assert
    const byCompany = await screen.findByRole("list", { name: "Student applications by company" });
    expect(within(byCompany).getByText("Goldman Sachs")).toBeInTheDocument();
    expect(within(byCompany).getByText("2 interviews · 0 offers")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Alumni by employer" })).getByText("Goldman Sachs")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Alumni by city" })).getByText("New Orleans, LA")).toBeInTheDocument();
    expect(screen.getByText("4 applications")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Internal Hiring Trends/ })).toHaveAttribute("aria-current", "page");
  });

  test("with no data each panel says so", async () => {
    // Arrange
    fetchHiringTrends.mockResolvedValue({
      studentApplications: [], alumniEmployers: [], alumniCities: [], totalApplications: 0, totalAlumni: 0,
    });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("No student has tracked an application yet.")).toBeInTheDocument();
    expect(screen.getByText("No alumni employers on file.")).toBeInTheDocument();
    expect(screen.getByText("No alumni cities on file.")).toBeInTheDocument();
  });

  test("a failed load can be retried", async () => {
    // Arrange
    fetchHiringTrends
      .mockRejectedValueOnce(new Error("Unable to load hiring trends. Please try again."))
      .mockResolvedValue(TRENDS);
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load hiring trends.");

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    // Assert
    expect(await screen.findByText("McKinsey")).toBeInTheDocument();
    expect(fetchHiringTrends).toHaveBeenCalledTimes(2);
  });
});
