function roleFromToken(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).role ?? null;
  } catch {
    return null;
  }
}

/**
 * The session's role, read from its JWT. This only decides what the UI shows:
 * it can't check the signature, so the backend still enforces every rule. The
 * offline fixtures in api.js issue plain labels, not JWTs, so those sessions
 * fall back to the role they were given.
 */
export function sessionRole(session) {
  if (!session) return null;
  return roleFromToken(session.token) ?? session.role;
}
