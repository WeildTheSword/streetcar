import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { LoginPage } from "./LoginPage";
import { useAuth } from "@/auth/useAuth";
import { useStageTransition } from "@/transition/useStageTransition";

vi.mock("@/auth/useAuth");
vi.mock("@/transition/useStageTransition");

const auth = { login: vi.fn(), logout: vi.fn(), register: vi.fn() };
const transition = { run: vi.fn() };

const renderAs = (roleTitle) => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  // The role name also appears in the chooser's footnote, so take the card button.
  const card = screen
    .getAllByText(roleTitle)
    .map((element) => element.closest("button"))
    .find(Boolean);
  fireEvent.click(card);
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useAuth.mockReturnValue(auth);
    useStageTransition.mockReturnValue(transition);
  });

  test("opens on the sign-up form for the chosen role", () => {
    // Arrange
    renderAs("Student");

    // Act — nothing to act on; this checks what rendered
    // Assert
    expect(screen.getByText("Student sign up")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(
      screen.getByText("Takes a moment. Streetcar builds the rest from your record."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Not a student?" })).toBeInTheDocument();
  });

  test("switching between sign-up and sign-in changes the heading and the button", () => {
    // Arrange
    renderAs("Advisor");

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Already have an account? Sign in" }));

    // Assert
    expect(screen.getByText("Advisor sign in")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByText("Use your Tulane credentials to continue.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Not an advisor?" })).toBeInTheDocument();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Need an account? Create one" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
  });

  test("signing in with the other role's account names the mismatch", async () => {
    // Arrange
    auth.login.mockResolvedValue({ role: "STUDENT", onboarded: true });
    renderAs("Advisor");
    fireEvent.click(screen.getByRole("button", { name: "Already have an account? Sign in" }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "morgan@tulane.edu" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "streetcar" } });

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That is a student account. Choose Student, or use advisor credentials.",
    );
    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(transition.run).not.toHaveBeenCalled();
  });

  test("a matching sign-in plays the role's transition", async () => {
    // Arrange
    auth.login.mockResolvedValue({ role: "ADVISOR", onboarded: true });
    renderAs("Advisor");
    fireEvent.click(screen.getByRole("button", { name: "Already have an account? Sign in" }));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "bill.hudlow@tulane.edu" },
    });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "streetcar" } });

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    // Assert
    await waitFor(() =>
      expect(transition.run).toHaveBeenCalledWith("Opening your console", expect.any(Function)),
    );
  });
});
