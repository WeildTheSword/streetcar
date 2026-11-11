import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "@/auth/authContext";
import { roleFromToken } from "@/auth/tokenClaims";
import { completeFingerprint, resetDemo, signIn, signUp } from "@/services/api";
import { setAuthToken } from "@/services/httpClient";

const STORAGE_KEY = "streetcar.session";

function readStoredSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  try {
    if (session) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // A blocked storage API is not worth failing the demo over.
  }
}

/**
 * The session the app keeps: what the API returned, with the role taken from
 * the JWT when there is one. Offline fixture sessions carry a label instead of
 * a JWT, so they keep the role the response named.
 */
function fromResponse(response) {
  return { ...response, role: roleFromToken(response.token) ?? response.role };
}

// Restores a stored session, and hands its token to the HTTP client before any
// page mounts and makes a request.
function restoreSession() {
  const stored = readStoredSession();
  setAuthToken(stored?.token);
  return stored;
}

/**
 * Holds the signed-in session and its JWT. The token is attached to every API
 * call through the HTTP client and dropped on sign-out.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(restoreSession);

  const remember = useCallback((next) => {
    setAuthToken(next?.token);
    setSession(next);
    writeStoredSession(next);
  }, []);

  const login = useCallback(async (email, password) => {
    const next = fromResponse(await signIn(email, password));
    remember(next);
    return next;
  }, [remember]);

  const register = useCallback(async (details) => {
    const next = fromResponse(await signUp(details));
    remember(next);
    return next;
  }, [remember]);

  const logout = useCallback(() => {
    remember(null);
  }, [remember]);

  const finishOnboarding = useCallback(async () => {
    if (!session) return;
    await completeFingerprint(session.profileId);
    remember({ ...session, onboarded: true });
  }, [session, remember]);

  // Puts the walkthrough back to its opening state between run-throughs.
  const restartDemo = useCallback(async () => {
    await resetDemo();
    remember(null);
  }, [remember]);

  const value = useMemo(
    () => ({ session, login, register, logout, finishOnboarding, restartDemo }),
    [session, login, register, logout, finishOnboarding, restartDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
