import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AdvisorOutcomesPage } from "./AdvisorOutcomesPage";
import { fetchOutcomes } from "@/services/advisorService";

vi.mock("@/services/advisorService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Bill Hudlow", subtitle: "Freeman · Consultant", initials: "BH" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const OUTCOMES = {
  funnel: { applied: 3, interview: 2, offer: 2, rejected: 1 },
  total: 8,
  offerRate: 25,
  offers: [
    { studentId: 5, studentName: "Jasmine Carter", company: "McKinsey", roleTitle: "Business Analyst", appliedOn: "2025-10-12" },
  ],
  byStudent: [
    { studentId: 2, studentName: "Morgan Thibodaux", applications: 6, interviews: 2, offers: 1 },
    { studentId: 5, studentName: "Jasmine Carter", applications: 2, interviews: 0, offers: 2 },
  ],
};

function Where() {
  const location = useLocation();
  return <p>At {location.pathname + location.search}</p>;
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/advisor/outcomes"]}>
      <Routes>
        <Route path="/advisor/outcomes" element={<AdvisorOutcomesPage />} />
        <Route path="/advisor/students" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );

describe("AdvisorOutcomesPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("shows the funnel, the offer rate, the offers and the per-student table", async () => {
    // Arrange
    fetchOutcomes.mockResolvedValue(OUTCOMES);

    // Act
    renderPage();

    // Assert
    const funnel = await screen.findByRole("group", { name: "Application funnel" });
    expect(within(funnel).getByText("Interview").parentElement).toHaveTextContent("2");
    expect(within(funnel).getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("McKinsey · Business Analyst")).toBeInTheDocument();
    const morgan = screen.getByRole("link", { name: "Morgan Thibodaux" }).closest("tr");
    expect(morgan).toHaveTextContent("621");
  });

  test("a student's name opens their record on My Students", async () => {
    // Arrange
    fetchOutcomes.mockResolvedValue(OUTCOMES);
    renderPage();

    // Act
    fireEvent.click(await screen.findByRole("link", { name: "Morgan Thibodaux" }));

    // Assert
    expect(screen.getByText("At /advisor/students?student=2")).toBeInTheDocument();
  });

  test("with no applications the lists say so", async () => {
    // Arrange
    fetchOutcomes.mockResolvedValue({
      funnel: { applied: 0, interview: 0, offer: 0, rejected: 0 }, total: 0, offerRate: 0, offers: [], byStudent: [],
    });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("No offers yet.")).toBeInTheDocument();
    expect(screen.getByText("No student has tracked an application yet.")).toBeInTheDocument();
  });

  test("a failed load says so", async () => {
    // Arrange
    fetchOutcomes.mockRejectedValue(new Error("Unable to load outcomes. Please try again."));

    // Act
    renderPage();

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load outcomes. Please try again.");
  });
});
