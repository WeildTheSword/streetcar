import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { StudentApplicationsPage } from "./StudentApplicationsPage";
import {
  createApplication,
  deleteApplication,
  fetchApplications,
  fetchSummary,
  updateApplication,
} from "@/services/studentService";

vi.mock("@/services/studentService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Morgan Thibodaux", subtitle: "Finance + CS · Junior", initials: "MT" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const GOLDMAN = {
  id: 1, company: "Goldman Sachs", roleTitle: "IB Summer Analyst", status: "interview",
  appliedOn: "2025-10-06", notes: "Round 2 Thursday", updatedAt: "2025-10-20T15:00:00Z",
};
const JPM = {
  id: 2, company: "JPMorgan", roleTitle: "IB Summer Analyst", status: "applied",
  appliedOn: "2025-10-01", notes: null, updatedAt: "2025-10-01T15:00:00Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <StudentApplicationsPage />
    </MemoryRouter>,
  );

const tile = (label) => within(screen.getByLabelText("Applications by status")).getByText(label).parentElement;

describe("StudentApplicationsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchSummary.mockResolvedValue({ alumni: 0, appointments: 0, applications: 2 });
  });

  test("renders the tracker with a count per status", async () => {
    // Arrange
    fetchApplications.mockResolvedValue([GOLDMAN, JPM]);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText("Goldman Sachs")).toBeInTheDocument();
    expect(screen.getByText("Round 2 Thursday")).toBeInTheDocument();
    expect(tile("Total")).toHaveTextContent("2");
    expect(tile("Interview")).toHaveTextContent("1");
    expect(tile("Offer")).toHaveTextContent("0");
    expect(screen.getByRole("link", { name: /Applications\s*2/ })).toHaveAttribute("aria-current", "page");
  });

  test("adding an application sends it and lists it", async () => {
    // Arrange
    fetchApplications.mockResolvedValue([JPM]);
    createApplication.mockResolvedValue({
      id: 3, company: "Evercore", roleTitle: "M&A Summer Analyst", status: "offer",
      appliedOn: "2025-10-10", notes: null, updatedAt: "2025-11-01T15:00:00Z",
    });
    renderPage();
    await screen.findByText("JPMorgan");

    // Act
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: " Evercore " } });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "M&A Summer Analyst" } });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "offer" } });
    fireEvent.change(screen.getByLabelText("Applied on"), { target: { value: "2025-10-10" } });
    fireEvent.click(screen.getByRole("button", { name: "Add application" }));

    // Assert
    expect(await screen.findByText("Evercore")).toBeInTheDocument();
    expect(createApplication).toHaveBeenCalledWith({
      company: "Evercore", roleTitle: "M&A Summer Analyst", status: "offer", appliedOn: "2025-10-10", notes: null,
    });
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Evercore");
    await waitFor(() => expect(fetchSummary).toHaveBeenCalledTimes(2));
  });

  test("a missing company or a future date is caught before anything is sent", async () => {
    // Arrange
    fetchApplications.mockResolvedValue([]);
    renderPage();
    await screen.findByText(/No applications tracked yet/);

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Add application" }));
    const missingCompany = screen.getByRole("alert").textContent;
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Lazard" } });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "Restructuring Analyst" } });
    fireEvent.change(screen.getByLabelText("Applied on"), { target: { value: "2099-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Add application" }));

    // Assert
    expect(missingCompany).toBe("Enter the company.");
    expect(screen.getByRole("alert")).toHaveTextContent("The applied date cannot be in the future.");
    expect(createApplication).not.toHaveBeenCalled();
  });

  test("editing loads the row into the form and saves the change", async () => {
    // Arrange
    fetchApplications.mockResolvedValue([GOLDMAN]);
    updateApplication.mockResolvedValue({ ...GOLDMAN, status: "offer" });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Edit Goldman Sachs" }));

    // Act
    expect(screen.getByLabelText("Company")).toHaveValue("Goldman Sachs");
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "offer" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    // Assert
    const row = (await screen.findByText("Offer", { selector: "td span" })).closest("tr");
    expect(row).toHaveTextContent("Goldman Sachs");
    expect(updateApplication).toHaveBeenCalledWith(1, {
      company: "Goldman Sachs", roleTitle: "IB Summer Analyst", status: "offer",
      appliedOn: "2025-10-06", notes: "Round 2 Thursday",
    });
    expect(screen.getByRole("heading", { name: "Add an application" })).toBeInTheDocument();
  });

  test("deleting asks once more, then removes the row", async () => {
    // Arrange
    fetchApplications.mockResolvedValue([GOLDMAN, JPM]);
    deleteApplication.mockResolvedValue(null);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Delete Goldman Sachs" }));

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

    // Assert
    await waitFor(() => expect(screen.queryByText("Goldman Sachs")).not.toBeInTheDocument());
    expect(deleteApplication).toHaveBeenCalledWith(1);
    expect(screen.getByText("JPMorgan")).toBeInTheDocument();
  });

  test("a server error on save shows in the form", async () => {
    // Arrange
    fetchApplications.mockResolvedValue([]);
    createApplication.mockRejectedValue(new Error("status must be one of applied, interview, offer, rejected"));
    renderPage();
    await screen.findByText(/No applications tracked yet/);

    // Act
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Moelis" } });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "Summer Analyst" } });
    fireEvent.change(screen.getByLabelText("Applied on"), { target: { value: "2025-10-02" } });
    fireEvent.click(screen.getByRole("button", { name: "Add application" }));

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("status must be one of");
  });
});
