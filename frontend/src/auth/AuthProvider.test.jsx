import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AuthProvider } from "@/auth/AuthProvider";
import { useAuth } from "@/auth/useAuth";
import { request } from "@/services/httpClient";

const STORAGE_KEY = "streetcar.session";

function ShowSession() {
  const { session } = useAuth();
  return <p>{session ? `Signed in as ${session.displayName}` : "Signed out"}</p>;
}

const respondWith = (status) =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ message: "No" }),
  }));

describe("AuthProvider", () => {
  beforeEach(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ displayName: "Alex", role: "STUDENT" }));
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  test("restores the stored session on render", () => {
    // Arrange + Act
    render(<AuthProvider><ShowSession /></AuthProvider>);

    // Assert
    expect(screen.getByText("Signed in as Alex")).toBeInTheDocument();
  });

  test("a 401 from the API signs the user out", async () => {
    // Arrange
    render(<AuthProvider><ShowSession /></AuthProvider>);
    respondWith(401);

    // Act
    await act(() => request("/submissions").catch(() => {}));

    // Assert
    expect(screen.getByText("Signed out")).toBeInTheDocument();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test("a 403 from the API leaves the user signed in", async () => {
    // Arrange
    render(<AuthProvider><ShowSession /></AuthProvider>);
    respondWith(403);

    // Act
    await act(() => request("/submissions/1", { method: "DELETE" }).catch(() => {}));

    // Assert
    expect(screen.getByText("Signed in as Alex")).toBeInTheDocument();
  });
});
