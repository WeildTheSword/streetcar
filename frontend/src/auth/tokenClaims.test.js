import { describe, expect, test } from "vitest";
import { roleFromToken } from "./tokenClaims";

// Builds an unsigned JWT-shaped token; only the payload matters to roleFromToken.
const jwtWith = (claims) =>
  ["e30", btoa(JSON.stringify(claims)).replace(/=+$/, ""), "signature"].join(".");

describe("roleFromToken", () => {
  test("reads the role claim from a JWT", () => {
    // Arrange
    const token = jwtWith({ sub: "7", role: "ADVISOR" });

    // Act
    const role = roleFromToken(token);

    // Assert
    expect(role).toBe("ADVISOR");
  });

  test("returns null for a label token, a missing token, garbage, or an unknown role", () => {
    // Arrange
    const tokens = ["demo-morgan-thibodaux", undefined, "a.%%%.c", jwtWith({ role: "ADMIN" })];

    // Act
    const roles = tokens.map(roleFromToken);

    // Assert
    expect(roles).toEqual([null, null, null, null]);
  });
});
