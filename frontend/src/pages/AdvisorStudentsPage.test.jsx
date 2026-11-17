import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AdvisorStudentsPage } from "./AdvisorStudentsPage";
import { fetchStudentAccount, fetchStudents } from "@/services/advisorService";

vi.mock("@/services/advisorService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Bill Hudlow", subtitle: "Freeman · Consultant", initials: "BH" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const STUDENTS = [
  { id: 4, name: "Chris Boudreaux", email: "chris@tulane.edu", submissionCount: 1 },
  { id: 2, name: "Morgan Thibodaux", email: "morgan@tulane.edu", submissionCount: 0 },
];

const CHRIS = {
  id: 4,
  name: "Chris Boudreaux",
  email: "chris@tulane.edu",
  classYear: "2027",
  submissions: [
    {
      id: 9,
      gpa: 3.5,
      completedCourses: "CMPS 1500",
      major: "Finance",
      careerGoal: "Analyst",
      createdAt: "2026-11-17T18:00:00Z",
    },
  ],
  conversations: [
    {
      initials: "SK",
      name: "Sarah Kim",
      role: "Freeman '16 · Goldman IBD",
      snippet: "Happy to chat Thursday.",
      prefix: null,
      status: "reply",
      statusLabel: "Replied",
      meta: "NYC",
      time: "12 min",
      unread: true,
    },
  ],
  appointments: [
    { id: 3, studentId: 4, studentName: "Chris Boudreaux", initials: "CB", startsAt: "2026-11-18T17:30:00Z", tags: ["First session"] },
  ],
  applications: [
    {
      id: 21, company: "Evercore", roleTitle: "M&A Summer Analyst", status: "interview",
      appliedOn: "2026-10-20", notes: "Superday next week", updatedAt: "2026-11-01T15:00:00Z",
    },
  ],
  resume: {
    headline: "Finance at Freeman, Tulane '27",
    summary: "Junior focused on M&A.",
    experience: "Summer intern, Hancock Whitney",
    skills: "Excel, PowerPoint",
    updatedAt: "2026-11-12T15:00:00Z",
  },
};

const renderPage = (entry = "/advisor/students") =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <AdvisorStudentsPage />
    </MemoryRouter>,
  );

describe("AdvisorStudentsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("lists every student account from the database", async () => {
    // Arrange
    fetchStudents.mockResolvedValue(STUDENTS);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("Chris Boudreaux")).toBeInTheDocument();
    expect(screen.getByText("Morgan Thibodaux")).toBeInTheDocument();
    expect(screen.getByText("2 accounts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /My Students/ })).toHaveAttribute("aria-current", "page");
  });

  test("choosing a student opens their submissions, conversations and appointments", async () => {
    // Arrange
    fetchStudents.mockResolvedValue(STUDENTS);
    fetchStudentAccount.mockResolvedValue(CHRIS);
    renderPage();

    // Act
    fireEvent.click(await screen.findByRole("button", { name: /Chris Boudreaux/ }));

    // Assert
    expect(await screen.findByRole("heading", { name: "Chris Boudreaux" })).toBeInTheDocument();
    expect(fetchStudentAccount).toHaveBeenCalledWith(4);
    expect(screen.getByText("Finance — Analyst")).toBeInTheDocument();
    expect(screen.getByText("Sarah Kim")).toBeInTheDocument();
    expect(screen.getByText("First session")).toBeInTheDocument();
  });

  test("a student's record shows their applications and resume", async () => {
    // Arrange
    fetchStudents.mockResolvedValue(STUDENTS);
    fetchStudentAccount.mockResolvedValue(CHRIS);
    renderPage();

    // Act
    fireEvent.click(await screen.findByRole("button", { name: /Chris Boudreaux/ }));

    // Assert
    const application = (await screen.findByText("Evercore · M&A Summer Analyst")).closest("li");
    expect(within(application).getByText("Interview")).toBeInTheDocument();
    expect(within(application).getByText("Superday next week")).toBeInTheDocument();
    expect(screen.getByText("Finance at Freeman, Tulane '27")).toBeInTheDocument();
    expect(screen.getByText("Summer intern, Hancock Whitney")).toBeInTheDocument();
  });

  test("a student with no resume or applications says so", async () => {
    // Arrange
    fetchStudents.mockResolvedValue(STUDENTS);
    fetchStudentAccount.mockResolvedValue({ ...CHRIS, applications: [], resume: null });
    renderPage();

    // Act
    fireEvent.click(await screen.findByRole("button", { name: /Chris Boudreaux/ }));

    // Assert
    expect(await screen.findByText("No resume on file.")).toBeInTheDocument();
    expect(screen.getByText("No applications tracked yet.")).toBeInTheDocument();
  });

  test("a ?student= link opens that student's record on arrival", async () => {
    // Arrange
    fetchStudents.mockResolvedValue(STUDENTS);
    fetchStudentAccount.mockResolvedValue(CHRIS);

    // Act
    renderPage("/advisor/students?student=4");

    // Assert
    expect(await screen.findByRole("heading", { name: "Chris Boudreaux" })).toBeInTheDocument();
    expect(fetchStudentAccount).toHaveBeenCalledWith(4);
    expect(screen.getByRole("button", { name: /Chris Boudreaux/ })).toHaveAttribute("aria-pressed", "true");
  });

  test("a failed load says so", async () => {
    // Arrange
    fetchStudents.mockRejectedValue(new Error("Unable to load students. Please try again."));

    // Act
    renderPage();

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load students. Please try again.");
  });
});
