import { describe, expect, test } from "vitest";
import { advisorSections } from "./advisorNav";

describe("advisorSections", () => {
  test("every item links somewhere, and only the active one is marked", () => {
    // Arrange
    const active = "outcomes";

    // Act
    const all = advisorSections(active).flatMap((section) => section.items);

    // Assert
    expect(all.map((item) => item.to)).toEqual([
      "/advisor",
      "/advisor/students",
      "/advisor/alumni",
      "/advisor/trends",
      "/advisor/appointments",
      "/advisor/performance",
      "/advisor/outcomes",
      "/advisor/reports",
      "/advisor/logs",
      "/account",
    ]);
    expect(all.filter((item) => item.active).map((item) => item.label)).toEqual(["Outcomes"]);
  });
});
