import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { StudentResumePage } from "./StudentResumePage";
import { fetchResume, saveResume } from "@/services/studentService";

vi.mock("@/services/studentService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Morgan Thibodaux", subtitle: "Finance + CS · Junior", initials: "MT" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const RESUME = {
  headline: "Finance + CS, Tulane '27",
  summary: "Junior targeting investment banking.",
  experience: "Analyst intern, Whitney Bank",
  skills: "Excel, Python",
  updatedAt: "2026-11-10T15:00:00Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <StudentResumePage />
    </MemoryRouter>,
  );

describe("StudentResumePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("fills the form with the saved resume and its last-updated time", async () => {
    // Arrange
    fetchResume.mockResolvedValue(RESUME);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByLabelText("Headline")).toHaveValue("Finance + CS, Tulane '27");
    expect(screen.getByLabelText("Experience")).toHaveValue("Analyst intern, Whitney Bank");
    expect(screen.getByText(/^Last updated /)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Resume/ })).toHaveAttribute("aria-current", "page");
  });

  test("saving sends the form and confirms it", async () => {
    // Arrange
    fetchResume.mockResolvedValue({ headline: "", summary: "", experience: "", skills: "", updatedAt: null });
    saveResume.mockResolvedValue({ ...RESUME, updatedAt: "2026-11-17T18:00:00Z" });
    renderPage();
    expect(await screen.findByText("Not saved yet")).toBeInTheDocument();

    // Act
    fireEvent.change(screen.getByLabelText("Headline"), { target: { value: "  Finance + CS, Tulane '27 " } });
    fireEvent.change(screen.getByLabelText("Skills"), { target: { value: "Excel, Python" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Assert
    expect(await screen.findByRole("status")).toHaveTextContent("Saved");
    expect(saveResume).toHaveBeenCalledWith({
      headline: "Finance + CS, Tulane '27", summary: "", experience: "", skills: "Excel, Python",
    });
    expect(screen.getByText(/^Last updated /)).toBeInTheDocument();
  });

  test("a blank headline is shown inline and nothing is saved", async () => {
    // Arrange
    fetchResume.mockResolvedValue(RESUME);
    renderPage();
    await screen.findByLabelText("Headline");

    // Act
    fireEvent.change(screen.getByLabelText("Headline"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a headline.");
    expect(screen.getByLabelText("Headline")).toHaveAttribute("aria-invalid", "true");
    expect(saveResume).not.toHaveBeenCalled();
  });

  test("a server validation error is shown", async () => {
    // Arrange
    fetchResume.mockResolvedValue(RESUME);
    saveResume.mockRejectedValue(new Error("headline must be at most 200 characters"));
    renderPage();
    await screen.findByLabelText("Headline");

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("headline must be at most 200 characters");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
