import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AdvisorReportsPage } from "./AdvisorReportsPage";
import { fetchStudentReports } from "@/services/advisorService";

vi.mock("@/services/advisorService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Bill Hudlow", subtitle: "Freeman · Consultant", initials: "BH" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const ROWS = [
  {
    id: 4, name: "Chris Boudreaux", email: "chris@tulane.edu", classYear: null,
    submissions: 0, applications: 0, offers: 0, appointments: 1, conversations: 0, resume: false,
  },
  {
    id: 2, name: "Morgan Thibodaux", email: "morgan@tulane.edu", classYear: "2027",
    submissions: 3, applications: 6, offers: 1, appointments: 4, conversations: 3, resume: true,
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdvisorReportsPage />
    </MemoryRouter>,
  );

// jsdom has neither, and a real download would try to navigate.
const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;

describe("AdvisorReportsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:report");
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    vi.restoreAllMocks();
  });

  test("renders one row per student, each name linking to their record", async () => {
    // Arrange
    fetchStudentReports.mockResolvedValue(ROWS);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByRole("link", { name: "Morgan Thibodaux" })).toHaveAttribute(
      "href",
      "/advisor/students?student=2",
    );
    expect(screen.getByText("2 accounts")).toBeInTheDocument();
    expect(screen.getByText("On file")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Reports/ })).toHaveAttribute("aria-current", "page");
  });

  test("Download CSV builds the report in the browser and downloads it", async () => {
    // Arrange
    fetchStudentReports.mockResolvedValue(ROWS);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderPage();
    await screen.findByRole("link", { name: "Morgan Thibodaux" });

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Download CSV" }));

    // Assert
    expect(click).toHaveBeenCalledTimes(1);
    const blob = URL.createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe("text/csv;charset=utf-8");
    const text = await blob.text();
    expect(text.split("\r\n")).toEqual([
      "Name,Email,Class year,Submissions,Applications,Offers,Appointments,Conversations,Resume",
      "Chris Boudreaux,chris@tulane.edu,,0,0,0,1,0,No",
      "Morgan Thibodaux,morgan@tulane.edu,2027,3,6,1,4,3,Yes",
      "",
    ]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:report");
  });

  test("with no students the download is disabled", async () => {
    // Arrange
    fetchStudentReports.mockResolvedValue([]);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("No student accounts yet.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download CSV" })).toBeDisabled();
  });

  test("a failed load says so", async () => {
    // Arrange
    fetchStudentReports.mockRejectedValue(new Error("Unable to load the student report. Please try again."));

    // Act
    renderPage();

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load the student report.");
  });
});
