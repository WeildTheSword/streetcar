import { describe, expect, test } from "vitest";
import { sessionRole } from "./sessionRole";

const base64Url = (value) =>
  btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const jwtWithRole = (role) => `${base64Url({ alg: "HS256" })}.${base64Url({ sub: "1", role })}.signature`;

describe("sessionRole", () => {
  test("reads the role from the JWT, even if the session says otherwise", () => {
    // Arrange
    const session = { token: jwtWithRole("STUDENT"), role: "ADVISOR" };

    // Act
    const role = sessionRole(session);

    // Assert
    expect(role).toBe("STUDENT");
  });

  test("falls back to the session's role for an offline label token", () => {
    // Arrange
    const session = { token: "demo-bill-hudlow", role: "ADVISOR" };

    // Act
    const role = sessionRole(session);

    // Assert
    expect(role).toBe("ADVISOR");
  });

  test("falls back when the token's payload is not JSON", () => {
    // Arrange
    const session = { token: "a.not-json.c", role: "STUDENT" };

    // Act
    const role = sessionRole(session);

    // Assert
    expect(role).toBe("STUDENT");
  });

  test("no session has no role", () => {
    // Arrange
    const session = null;

    // Act
    const role = sessionRole(session);

    // Assert
    expect(role).toBeNull();
  });
});
