import { describe, expect, test } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  test("writes a header and one line per row", () => {
    // Arrange
    const columns = [
      { header: "Name", value: (row) => row.name },
      { header: "Count", value: (row) => row.count },
    ];

    // Act
    const csv = toCsv(columns, [{ name: "Morgan", count: 3 }, { name: "Chris", count: 0 }]);

    // Assert
    expect(csv).toBe("Name,Count\r\nMorgan,3\r\nChris,0\r\n");
  });

  test("quotes cells with commas, quotes or line breaks, and leaves null blank", () => {
    // Arrange
    const columns = [{ header: "Note", value: (row) => row.note }];

    // Act
    const csv = toCsv(columns, [{ note: 'Said "yes", then left' }, { note: "two\nlines" }, { note: null }]);

    // Assert
    expect(csv).toBe('Note\r\n"Said ""yes"", then left"\r\n"two\nlines"\r\n\r\n');
  });
});
