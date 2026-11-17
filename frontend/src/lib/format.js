/** "Tue, Nov 17, 11:30 AM" in the viewer's time zone, or "" for a missing value. */
export function formatDateTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Up to two capital initials from a display name. */
/** First and last initials, as the backend makes them: "Morgan A. Thibodaux" is "MT". */
export function initialsOf(name) {
  const parts = (name ?? "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** A datetime-local input's value ("2026-11-17T14:30") as an ISO string with the viewer's offset. */
export function localInputToIso(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
