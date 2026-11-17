import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { StudentAlumniPage } from "./StudentAlumniPage";
import { fetchMyAlumni, fetchSummary, startConversation } from "@/services/studentService";

vi.mock("@/services/studentService");
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    session: { displayName: "Morgan Thibodaux", subtitle: "Finance + CS · Junior", initials: "MT" },
    logout: vi.fn(),
    restartDemo: vi.fn(),
  }),
}));

const SARAH = {
  id: 10, name: "Sarah Kim", initials: "SK", school: "Freeman", gradYear: 2016,
  currentRole: "VP · Goldman Sachs", city: "New York, NY",
  status: "reply", statusLabel: "Replied", snippet: "Happy to chat Thursday.",
};
const DEV = {
  id: 11, name: "Dev Patel", initials: "DP", school: "Freeman", gradYear: 2019,
  currentRole: "Associate · Evercore", city: "New York, NY",
  status: null, statusLabel: null, snippet: null,
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <StudentAlumniPage />
    </MemoryRouter>,
  );

const rowOf = (name) => screen.getByText(new RegExp(`^${name}`)).closest("li");

describe("StudentAlumniPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchSummary.mockResolvedValue({ alumni: 1, appointments: 0, applications: 0 });
  });

  test("lists alumni with a status pill, or a Reach out button when there is no conversation", async () => {
    // Arrange
    fetchMyAlumni.mockResolvedValue([SARAH, DEV]);

    // Act
    renderPage();

    // Assert
    await screen.findByText(/Sarah Kim/);
    expect(within(rowOf("Sarah Kim")).getByText("Replied")).toBeInTheDocument();
    expect(within(rowOf("Sarah Kim")).getByText("Happy to chat Thursday.")).toBeInTheDocument();
    expect(within(rowOf("Dev Patel")).getByRole("button", { name: "Reach out" })).toBeInTheDocument();
    expect(screen.getByText("2 alumni · talking to 1")).toBeInTheDocument();
  });

  test("reaching out sends the message and updates the row in place", async () => {
    // Arrange
    fetchMyAlumni.mockResolvedValue([SARAH, DEV]);
    startConversation.mockResolvedValue({ ...DEV, status: "sent", statusLabel: "Sent", snippet: "Hi Dev, could we talk?" });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Reach out" }));

    // Act
    fireEvent.change(screen.getByLabelText("Message to Dev Patel"), { target: { value: "  Hi Dev, could we talk?  " } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    // Assert
    expect(await within(rowOf("Dev Patel")).findByText("Sent")).toBeInTheDocument();
    expect(startConversation).toHaveBeenCalledWith(11, "Hi Dev, could we talk?");
    expect(within(rowOf("Dev Patel")).getByText("Hi Dev, could we talk?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reach out" })).not.toBeInTheDocument();
  });

  test("a conflict from the server shows inline under the alum", async () => {
    // Arrange
    fetchMyAlumni.mockResolvedValue([DEV]);
    startConversation.mockRejectedValue(new Error("You are already talking to Dev Patel."));
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Reach out" }));

    // Act
    fireEvent.change(screen.getByLabelText("Message to Dev Patel"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("You are already talking to Dev Patel.");
    expect(screen.getByLabelText("Message to Dev Patel")).toBeInTheDocument();
  });

  test("an empty message is caught before anything is sent", async () => {
    // Arrange
    fetchMyAlumni.mockResolvedValue([DEV]);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Reach out" }));

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent("Write a message first.");
    expect(startConversation).not.toHaveBeenCalled();
  });
});
