import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AlumniDirectoryPage } from "./AlumniDirectoryPage";
import { fetchAlumni } from "@/services/advisorService";

vi.mock("@/services/advisorService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Bill Hudlow", subtitle: "Freeman · Consultant", initials: "BH" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const ALUMNI = [
  {
    id: 10,
    name: "Sarah Kim",
    initials: "SK",
    email: "sarah.kim@alumni.tulane.edu",
    school: "Freeman",
    gradYear: 2016,
    currentRole: "VP, Investment Banking · Goldman Sachs",
    city: "New York, NY",
    studentCount: 2,
  },
  {
    id: 11,
    name: "Rahul Patel",
    initials: "RP",
    email: "rahul.patel@alumni.tulane.edu",
    school: "SSE",
    gradYear: 2023,
    currentRole: "SWE-III · Anthropic",
    city: "San Francisco, CA",
    studentCount: 0,
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <AlumniDirectoryPage />
    </MemoryRouter>,
  );

describe("AlumniDirectoryPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders every alumni account with role, city and student count", async () => {
    // Arrange
    fetchAlumni.mockResolvedValue(ALUMNI);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("Sarah Kim '16")).toBeInTheDocument();
    expect(screen.getByText("VP, Investment Banking · Goldman Sachs")).toBeInTheDocument();
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    expect(screen.getByText("2 of 2")).toBeInTheDocument();
  });

  test("searching narrows the table to matching alumni", async () => {
    // Arrange
    fetchAlumni.mockResolvedValue(ALUMNI);
    renderPage();
    await screen.findByText("Sarah Kim '16");

    // Act
    fireEvent.change(screen.getByLabelText("Search alumni"), { target: { value: "anthropic" } });

    // Assert
    expect(screen.getByText("Rahul Patel '23")).toBeInTheDocument();
    expect(screen.queryByText("Sarah Kim '16")).not.toBeInTheDocument();
    expect(screen.getByText("1 of 2")).toBeInTheDocument();
  });
});
