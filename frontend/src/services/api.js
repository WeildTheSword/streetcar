import {
  FALLBACK_ADVISOR_DASHBOARD,
  FALLBACK_STUDENT,
  FALLBACK_USERS,
} from "@/data/fallback";

// Kept in sync with backend/.../config/CorsConfig.java, which allows exactly
// http://localhost:5173. Change one port and you must change the other.
const API_URL = "http://localhost:8080";

/** Thrown when the API answered but rejected the request. */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Tracks whether the last call reached the backend, so the UI can show that
 * the demo is running on fixtures rather than silently looking identical.
 */
export const connection = { live: true };

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${response.status}`);
  }
  connection.live = true;
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

/**
 * Runs `call`, falling back to local fixtures only when the backend is
 * unreachable. A rejection the API actually returned (a bad password, say)
 * is rethrown so the UI still reports it.
 */
async function withFallback(call, fallback) {
  try {
    return await call();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    connection.live = false;
    return fallback();
  }
}

// Onboarding lives on the server, but the fallback path needs somewhere to
// remember that the fingerprint was completed.
let offlineOnboarded = false;

export function signIn(email, password) {
  return withFallback(
    () =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    () => {
      const normalized = email.trim().toLowerCase();
      const user = FALLBACK_USERS.find(
        (candidate) =>
          candidate.email === normalized && candidate.password === password,
      );
      if (!user) {
        throw new ApiError(401, "Invalid credentials");
      }
      return {
        token: `demo-${user.profileId}`,
        role: user.role,
        profileId: user.profileId,
        displayName: user.displayName,
        initials: user.initials,
        subtitle: user.subtitle,
        onboarded: user.role !== "STUDENT" || offlineOnboarded,
      };
    },
  );
}

export function signUp({ name, email, password, role }) {
  return withFallback(
    () =>
      request("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      }),
    () => {
      // Offline: mint a session over the fixture profile, same as the server.
      const profileId = role === "ADVISOR" ? "bill-hudlow" : "morgan-thibodaux";
      const parts = name.trim().split(/\s+/).filter(Boolean);
      const initials = (
        (parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")
      ).toUpperCase();
      return {
        token: `demo-${profileId}`,
        role,
        profileId,
        displayName: name.trim(),
        initials,
        subtitle: role === "ADVISOR" ? "Freeman · Consultant" : "Finance + CS · Junior",
        onboarded: role === "ADVISOR",
      };
    },
  );
}

export function fetchStudent(id) {
  return withFallback(
    () => request(`/students/${id}`),
    () => ({ ...FALLBACK_STUDENT, onboarded: offlineOnboarded }),
  );
}

export function completeFingerprint(id) {
  return withFallback(
    () => request(`/students/${id}/fingerprint`, { method: "POST" }),
    () => {
      offlineOnboarded = true;
      return { ...FALLBACK_STUDENT, onboarded: true };
    },
  );
}

export function fetchAdvisorDashboard(id) {
  return withFallback(
    () => request(`/advisors/${id}/dashboard`),
    () => FALLBACK_ADVISOR_DASHBOARD,
  );
}

export function resetDemo() {
  offlineOnboarded = false;
  return withFallback(
    () => request("/auth/reset", { method: "POST" }),
    () => null,
  );
}
