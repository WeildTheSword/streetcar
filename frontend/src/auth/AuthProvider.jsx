import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "@/auth/authContext";
import { completeFingerprint, resetDemo, signIn, signUp } from "@/services/api";

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
 * Holds the signed-in demo session. This is a fake portal for the pitch — the
 * token is a label, nothing is verified client side beyond what the API says.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const login = useCallback(async (email, password) => {
    const next = await signIn(email, password);
    setSession(next);
    writeStoredSession(next);
    return next;
  }, []);

  const register = useCallback(async (details) => {
    const next = await signUp(details);
    setSession(next);
    writeStoredSession(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    writeStoredSession(null);
  }, []);

  const finishOnboarding = useCallback(async () => {
    if (!session) return;
    await completeFingerprint(session.profileId);
    const next = { ...session, onboarded: true };
    setSession(next);
    writeStoredSession(next);
  }, [session]);

  // Puts the walkthrough back to its opening state between run-throughs.
  const restartDemo = useCallback(async () => {
    await resetDemo();
    setSession(null);
    writeStoredSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, login, register, logout, finishOnboarding, restartDemo }),
    [session, login, register, logout, finishOnboarding, restartDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
