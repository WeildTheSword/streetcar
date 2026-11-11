const ROLES = ["STUDENT", "ADVISOR"];

/**
 * The role claim inside a JWT, or null when the token is not a JWT (the
 * offline fixtures issue plain labels) or carries no known role.
 *
 * This only decodes the token; it cannot check the signature. It decides what
 * the UI shows, and the backend still checks every request.
 */
export function roleFromToken(token) {
  const payload = typeof token === "string" ? token.split(".")[1] : undefined;
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const { role } = JSON.parse(atob(padded));
    return ROLES.includes(role) ? role : null;
  } catch {
    return null;
  }
}
