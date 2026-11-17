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

/** A "YYYY-MM-DD" date as "Nov 3, 2026", read as a calendar day so no time zone shifts it. */
export function formatDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return "";
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Today in the viewer's time zone, as "YYYY-MM-DD", for a date input's value or max. */
export function todayIsoDate(now = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** How long ago an instant was: "just now", "5 min ago", "3 h ago", "2 days ago", or the date past a week. */
export function formatRelative(iso, now = new Date()) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.round((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
