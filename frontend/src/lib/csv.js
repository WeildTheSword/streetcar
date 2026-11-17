// Builds CSV text in the browser, for downloads that need no server round trip.

function cell(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * CSV for `rows`, one line per row. `columns` is [{ header, value: (row) => any }],
 * and every cell is quoted when it holds a comma, a quote or a line break.
 */
export function toCsv(columns, rows) {
  const lines = [columns.map((column) => cell(column.header)).join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => cell(column.value(row))).join(","));
  }
  return `${lines.join("\r\n")}\r\n`;
}

/** Hands `text` to the browser as a file download named `filename`. */
export function downloadText(filename, text, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
