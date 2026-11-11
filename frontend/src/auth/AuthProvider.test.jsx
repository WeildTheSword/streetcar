import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./useAuth";
import { signIn } from "@/services/api";
import { request, setAuthToken } from "@/services/httpClient";

vi.mock("@/services/api");

// A JWT-shaped token whose role claim is ADVISOR; the signature is never checked client side.
const ADVISOR_JWT = ["e30", btoa(JSON.stringify({ sub: "2", role: "ADVISOR" })).replace(/=+$/, ""), "sig"].join(".");

function Probe() {
  const { session, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="role">{session ? session.role : "signed out"}</p>
      <button onClick={() => login("bill.hudlow@tulane.edu", "streetcar")}>Sign in</button>
      <button onClick={logout}>Sign out</button>
    </div>
  );
}

describe("AuthProvider", () => {
  let fetchMock;

  beforeEach(() => {
    sessionStorage.clear();
    setAuthToken(null);
    fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve([]) });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  test("renders signed out when nothing is stored", () => {
    // Arrange + Act
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    // Assert
    expect(screen.getByTestId("role")).toHaveTextContent("signed out");
  });

  test("signing in keeps the JWT, takes the role from it, and sends it until sign-out", async () => {
    // Arrange: the response's role disagrees with the token, to show the token wins
    signIn.mockResolvedValue({ token: ADVISOR_JWT, role: "STUDENT", profileId: "bill-hudlow" });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    // Act
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Sign in" })));
    await request("/courses");

    // Assert
    expect(screen.getByTestId("role")).toHaveTextContent("ADVISOR");
    expect(JSON.parse(sessionStorage.getItem("streetcar.session")).token).toBe(ADVISOR_JWT);
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: `Bearer ${ADVISOR_JWT}` });

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await request("/courses");

    // Assert
    expect(screen.getByTestId("role")).toHaveTextContent("signed out");
    expect(sessionStorage.getItem("streetcar.session")).toBeNull();
    expect(fetchMock.mock.calls[1][1].headers).toBeUndefined();
  });

  test("a stored session's token is sent again after a reload", async () => {
    // Arrange
    sessionStorage.setItem("streetcar.session", JSON.stringify({ token: ADVISOR_JWT, role: "ADVISOR" }));

    // Act
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await request("/courses");

    // Assert
    expect(screen.getByTestId("role")).toHaveTextContent("ADVISOR");
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: `Bearer ${ADVISOR_JWT}` });
  });
});
