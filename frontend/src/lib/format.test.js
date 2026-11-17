import { describe, expect, test } from "vitest";
import { formatDate, formatRelative, todayIsoDate } from "./format";

describe("formatDate", () => {
  test("reads a calendar date without shifting it by time zone", () => {
    // Arrange
    const value = "2026-11-03";

    // Act
    const shown = formatDate(value);

    // Assert
    expect(shown).toBe("Nov 3, 2026");
  });

  test("anything else is blank", () => {
    // Arrange + Act + Assert
    expect(formatDate(null)).toBe("");
    expect(formatDate("not a date")).toBe("");
  });
});

describe("todayIsoDate", () => {
  test("pads the month and day", () => {
    // Arrange
    const now = new Date(2026, 0, 5, 23, 30);

    // Act
    const iso = todayIsoDate(now);

    // Assert
    expect(iso).toBe("2026-01-05");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-11-17T12:00:00Z");
  const before = (minutes) => new Date(now.getTime() - minutes * 60000).toISOString();

  test("counts minutes, hours and days, then falls back to the date", () => {
    // Arrange
    const instants = [before(0), before(5), before(120), before(60 * 24), before(60 * 24 * 3), before(60 * 24 * 30)];

    // Act
    const shown = instants.map((iso) => formatRelative(iso, now));

    // Assert
    expect(shown).toEqual(["just now", "5 min ago", "2 h ago", "1 day ago", "3 days ago", "Oct 18, 2026"]);
  });
});
