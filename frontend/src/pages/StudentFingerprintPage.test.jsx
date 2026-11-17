import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { StudentFingerprintPage } from "./StudentFingerprintPage";
import { fetchStudent } from "@/services/api";
import { FALLBACK_STUDENT } from "@/data/fallback";

vi.mock("@/services/api");
vi.mock("@/services/studentService");
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

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/student/fingerprint"]}>
      <Routes>
        <Route path="/student/fingerprint" element={<StudentFingerprintPage />} />
        <Route path="/onboarding" element={<p>Onboarding splash</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("StudentFingerprintPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders the fingerprint's fields, paths, transcript and courses", async () => {
    // Arrange
    fetchStudent.mockResolvedValue(FALLBACK_STUDENT);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText(FALLBACK_STUDENT.matchBasis)).toBeInTheDocument();
    expect(fetchStudent).toHaveBeenCalledWith("morgan-thibodaux");
    expect(screen.getByText(FALLBACK_STUDENT.major)).toBeInTheDocument();
    expect(screen.getByText(String(FALLBACK_STUDENT.gpa))).toBeInTheDocument();
    expect(screen.getByText(`${FALLBACK_STUDENT.matchPercent}%`)).toBeInTheDocument();
    expect(screen.getByText(FALLBACK_STUDENT.adjacentPaths[0].title)).toBeInTheDocument();
    expect(screen.getByText(FALLBACK_STUDENT.transcript[0].title)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(FALLBACK_STUDENT.courses[0].title))).toBeInTheDocument();
  });

  test("Retake fingerprint goes back to onboarding", async () => {
    // Arrange
    fetchStudent.mockResolvedValue(FALLBACK_STUDENT);
    renderPage();
    await screen.findByText(FALLBACK_STUDENT.matchBasis);

    // Act
    fireEvent.click(screen.getByRole("link", { name: "Retake fingerprint" }));

    // Assert
    expect(screen.getByText("Onboarding splash")).toBeInTheDocument();
  });

  test("a failed load says so", async () => {
    // Arrange
    fetchStudent.mockRejectedValue(new Error("Request failed: 500"));

    // Act
    renderPage();

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("Request failed: 500");
  });
});
