import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AccountPage } from "./AccountPage";
import { useAuth } from "@/auth/useAuth";
import { fetchAccount } from "@/services/advisorService";

vi.mock("@/services/advisorService");
vi.mock("@/auth/useAuth");

const logout = vi.fn();

const signedInAs = (role, displayName) =>
  useAuth.mockReturnValue({
    session: { role, displayName, subtitle: "", initials: "XX" },
    logout,
    restartDemo: vi.fn(),
  });

const renderPage = () =>
  render(
    <MemoryRouter>
      <AccountPage />
    </MemoryRouter>,
  );

describe("AccountPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("an alum sees their alumni profile and the students they are talking to", async () => {
    // Arrange
    signedInAs("ALUMNI", "Sarah Kim");
    fetchAccount.mockResolvedValue({
      id: 10,
      name: "Sarah Kim",
      email: "sarah.kim@alumni.tulane.edu",
      role: "ALUMNI",
      classYear: null,
      alumni: { school: "Freeman", gradYear: 2016, currentRole: "VP · Goldman Sachs", city: "New York, NY" },
      submissionCount: 0,
      appointments: [],
      conversations: [
        { id: 1, withName: "Morgan Thibodaux", status: "reply", statusLabel: "Replied", snippet: "Thursday works." },
      ],
    });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByRole("heading", { name: "Sarah Kim" })).toBeInTheDocument();
    expect(screen.getByText("sarah.kim@alumni.tulane.edu")).toBeInTheDocument();
    expect(screen.getByText("Freeman '16")).toBeInTheDocument();
    expect(screen.getByText("VP · Goldman Sachs")).toBeInTheDocument();
    expect(screen.getByText("Morgan Thibodaux")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Advisor Portal/ })).not.toBeInTheDocument();
  });

  test("a student sees their account under the student sidebar", async () => {
    // Arrange
    signedInAs("STUDENT", "Morgan Thibodaux");
    fetchAccount.mockResolvedValue({
      id: 2,
      name: "Morgan Thibodaux",
      email: "morgan@tulane.edu",
      role: "STUDENT",
      classYear: "2027",
      alumni: null,
      submissionCount: 3,
      appointments: [{ id: 1, withName: "Bill Hudlow", startsAt: "2026-11-17T17:30:00Z", tags: ["Pre-brief ready"] }],
      conversations: [],
    });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("Bill Hudlow")).toBeInTheDocument();
    const details = screen.getByText("Profiles submitted").closest("dl");
    expect(within(details).getByText("2027")).toBeInTheDocument();
    expect(within(details).getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /My Path/ })).toHaveAttribute("href", "/student");
  });

  test("an advisor gets the advisor sidebar with My Account marked current", async () => {
    // Arrange
    signedInAs("ADVISOR", "Bill Hudlow");
    fetchAccount.mockResolvedValue({
      id: 3,
      name: "Bill Hudlow",
      email: "bill.hudlow@tulane.edu",
      role: "ADVISOR",
      classYear: null,
      alumni: null,
      submissionCount: 0,
      appointments: [],
      conversations: [],
    });

    // Act
    renderPage();
    await screen.findByRole("heading", { name: "Bill Hudlow" });

    // Assert
    expect(screen.getByRole("link", { name: /My Account/ })).toHaveAttribute("aria-current", "page");
    const details = screen.getByText("Role").closest("dl");
    expect(within(details).getByText("Advisor")).toBeInTheDocument();
  });

  test("signing out from the account menu calls logout", async () => {
    // Arrange
    signedInAs("ALUMNI", "Sarah Kim");
    fetchAccount.mockResolvedValue({
      id: 10, name: "Sarah Kim", email: "s@x", role: "ALUMNI", classYear: null, alumni: null,
      submissionCount: 0, appointments: [], conversations: [],
    });
    renderPage();
    await screen.findByRole("heading", { name: "Sarah Kim" });

    // Act
    fireEvent.pointerDown(screen.getByRole("button", { name: /Sarah Kim/ }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }));

    // Assert
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
