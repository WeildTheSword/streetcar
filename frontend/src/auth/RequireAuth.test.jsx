import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";
import { AuthContext } from "@/auth/authContext";
import { RequireAuth } from "@/auth/RequireAuth";

const base64Url = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "");
const jwtWithRole = (role) => `${base64Url({ alg: "HS256" })}.${base64Url({ sub: "1", role })}.signature`;

const renderAt = (path, session) =>
  render(
    <AuthContext.Provider value={{ session }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/sign-in" element={<p>Sign-in page</p>} />
          <Route path="/onboarding" element={<p>Onboarding page</p>} />
          <Route element={<RequireAuth />}>
            <Route path="/profiles" element={<p>Profiles page</p>} />
          </Route>
          <Route element={<RequireAuth role="STUDENT" />}>
            <Route path="/student" element={<p>Student page</p>} />
          </Route>
          <Route element={<RequireAuth role="ADVISOR" />}>
            <Route path="/advisor" element={<p>Advisor page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe("RequireAuth", () => {
  test("sends someone who is not signed in to sign-in", () => {
    // Arrange + Act
    renderAt("/profiles", null);

    // Assert
    expect(screen.getByText("Sign-in page")).toBeInTheDocument();
  });

  test("lets any signed-in user through when no role is required", () => {
    // Arrange + Act
    renderAt("/profiles", { token: jwtWithRole("STUDENT"), onboarded: true });

    // Assert
    expect(screen.getByText("Profiles page")).toBeInTheDocument();
  });

  test("routes by the role in the token, not the one stored beside it", () => {
    // Arrange
    const session = { token: jwtWithRole("STUDENT"), role: "ADVISOR", onboarded: true };

    // Act
    renderAt("/advisor", session);

    // Assert
    expect(screen.getByText("Student page")).toBeInTheDocument();
  });

  test("lets an advisor token reach the advisor page", () => {
    // Arrange + Act
    renderAt("/advisor", { token: jwtWithRole("ADVISOR") });

    // Assert
    expect(screen.getByText("Advisor page")).toBeInTheDocument();
  });

  test("holds a student who has not onboarded at onboarding", () => {
    // Arrange + Act
    renderAt("/student", { token: jwtWithRole("STUDENT"), onboarded: false });

    // Assert
    expect(screen.getByText("Onboarding page")).toBeInTheDocument();
  });
});
