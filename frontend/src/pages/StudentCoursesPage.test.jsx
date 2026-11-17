import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { StudentCoursesPage } from "./StudentCoursesPage";
import { fetchCourses } from "@/services/courseService";
import { fetchSubmissions } from "@/services/submissionService";
import { fetchSummary } from "@/services/studentService";

vi.mock("@/services/courseService");
vi.mock("@/services/submissionService");
vi.mock("@/services/studentService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Morgan Thibodaux", subtitle: "Finance + CS · Junior", initials: "MT" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const CATALOGUE = [
  { id: 1, code: "CMPS 1500", title: "Introduction to Computer Science", description: "Foundations." },
  { id: 2, code: "CMPS 2200", title: "Data Structures and Algorithms", description: "Core structures." },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <StudentCoursesPage />
    </MemoryRouter>,
  );

describe("StudentCoursesPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchSummary.mockResolvedValue({ alumni: 3, appointments: 1, applications: 6 });
  });

  test("marks the catalogue courses from the latest submission as completed", async () => {
    // Arrange
    fetchCourses.mockResolvedValue(CATALOGUE);
    fetchSubmissions.mockResolvedValue([
      { id: 1, completedCourses: "CMPS 2200", createdAt: "2026-09-01T12:00:00Z" },
      { id: 2, completedCourses: "cmps-1500, ACCN 2010", createdAt: "2026-11-01T12:00:00Z" },
    ]);

    // Act
    renderPage();

    // Assert
    const row = (await screen.findByText("CMPS 1500")).closest("tr");
    expect(within(row).getByText("Completed")).toBeInTheDocument();
    expect(within(screen.getByText("CMPS 2200").closest("tr")).queryByText("Completed")).not.toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Completed courses not in the catalogue" })).getByText("ACCN 2010"))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Courses/ })).toHaveAttribute("aria-current", "page");
    expect(await screen.findByRole("link", { name: /Applications\s*6/ })).toBeInTheDocument();
  });

  test("with no submission it asks for one and marks nothing", async () => {
    // Arrange
    fetchCourses.mockResolvedValue(CATALOGUE);
    fetchSubmissions.mockResolvedValue([]);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByRole("link", { name: "Submit one" })).toHaveAttribute("href", "/profiles");
    expect(screen.queryByText("Completed")).not.toBeInTheDocument();
  });

  test("a failed load can be retried", async () => {
    // Arrange
    fetchCourses.mockRejectedValueOnce(new Error("Failed to fetch courses")).mockResolvedValue(CATALOGUE);
    fetchSubmissions.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to fetch courses");

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    // Assert
    expect(await screen.findByText("CMPS 1500")).toBeInTheDocument();
    expect(fetchCourses).toHaveBeenCalledTimes(2);
  });
});
