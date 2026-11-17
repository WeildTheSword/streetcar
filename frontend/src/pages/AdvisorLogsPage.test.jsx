import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AdvisorLogsPage } from "./AdvisorLogsPage";
import { fetchLogs } from "@/services/advisorService";

vi.mock("@/services/advisorService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Bill Hudlow", subtitle: "Freeman · Consultant", initials: "BH" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();

const ENTRIES = [
  { type: "application", actor: "Morgan Thibodaux", detail: "Goldman Sachs · IB Summer Analyst: interview", at: minutesAgo(5) },
  { type: "signup", actor: "Chris Boudreaux", detail: "Created a student account", at: minutesAgo(180) },
  { type: "resume", actor: "Morgan Thibodaux", detail: "Updated their resume", at: minutesAgo(60 * 24 * 2) },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdvisorLogsPage />
    </MemoryRouter>,
  );

describe("AdvisorLogsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders the feed with a type pill and a relative time on each entry", async () => {
    // Arrange
    fetchLogs.mockResolvedValue(ENTRIES);

    // Act
    renderPage();

    // Assert
    const items = within(await screen.findByRole("list", { name: "Activity" })).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Application");
    expect(items[0]).toHaveTextContent("5 min ago");
    expect(items[1]).toHaveTextContent("3 h ago");
    expect(items[2]).toHaveTextContent("2 days ago");
    expect(screen.getByText("3 events")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Logs/ })).toHaveAttribute("aria-current", "page");
  });

  test("filtering by type shows only that kind", async () => {
    // Arrange
    fetchLogs.mockResolvedValue(ENTRIES);
    renderPage();
    await screen.findByRole("list", { name: "Activity" });

    // Act
    fireEvent.change(screen.getByLabelText("Show"), { target: { value: "signup" } });

    // Assert
    expect(screen.getByText("Created a student account")).toBeInTheDocument();
    expect(screen.queryByText("Updated their resume")).not.toBeInTheDocument();
    expect(screen.getByText("1 of 3 events")).toBeInTheDocument();
  });

  test("a filter that matches nothing says so", async () => {
    // Arrange
    fetchLogs.mockResolvedValue(ENTRIES);
    renderPage();
    await screen.findByRole("list", { name: "Activity" });

    // Act
    fireEvent.change(screen.getByLabelText("Show"), { target: { value: "appointment" } });

    // Assert
    expect(screen.getByText("No activity of that kind.")).toBeInTheDocument();
  });

  test("a failed load says so", async () => {
    // Arrange
    fetchLogs.mockRejectedValue(new Error("Unable to load the activity log. Please try again."));

    // Act
    renderPage();

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load the activity log.");
  });
});
