import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { StudentDashboard } from "./StudentDashboard";
import { fetchStudent } from "@/services/api";
import { FALLBACK_STUDENT } from "@/data/fallback";

vi.mock("@/services/api");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: {
      profileId: "morgan-thibodaux",
      displayName: "Morgan A. Thibodaux",
      subtitle: "Finance + CS · Junior",
      initials: "MT",
    },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

// The walkthrough scrolls its target into view; jsdom has no layout to scroll.
const originalScrollIntoView = Element.prototype.scrollIntoView;

const renderDashboard = async () => {
  fetchStudent.mockResolvedValue(FALLBACK_STUDENT);
  render(<StudentDashboard />);
  await screen.findByText("Welcome back, Morgan.");
};

describe("StudentDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
    vi.restoreAllMocks();
  });

  test("renders the student's name and every section of the path", async () => {
    // Arrange
    await renderDashboard();

    // Act — nothing to act on; this checks what rendered
    // Assert
    expect(fetchStudent).toHaveBeenCalledWith("morgan-thibodaux");
    expect(screen.getByText(FALLBACK_STUDENT.targetRole)).toBeInTheDocument();
    expect(screen.getByText("Your next advising meeting")).toBeInTheDocument();
    expect(screen.getByText("What's on your mind")).toBeInTheDocument();
    expect(screen.getByText("My top firms")).toBeInTheDocument();
    expect(screen.getByText("Strategies for me")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Courses for Spring" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alumni conversations" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "This week" })).toBeInTheDocument();
    expect(screen.getByText(FALLBACK_STUDENT.courses[0].title)).toBeInTheDocument();
    expect(screen.getByText(FALLBACK_STUDENT.firms[0].name)).toBeInTheDocument();
    expect(screen.getByText(FALLBACK_STUDENT.conversations[0].name)).toBeInTheDocument();
  });

  test("advancing the walkthrough moves it from the match score to the courses", async () => {
    // Arrange
    await renderDashboard();
    expect(screen.getByText("The match score, and its alternatives")).toBeInTheDocument();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    // Assert
    expect(screen.getByText("Courses ranked by fit, not popularity")).toBeInTheDocument();
    expect(screen.queryByText("The match score, and its alternatives")).not.toBeInTheDocument();
    expect(screen.getByText("2 of 4")).toBeInTheDocument();
  });
});
