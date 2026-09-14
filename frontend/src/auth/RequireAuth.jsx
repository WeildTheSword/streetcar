import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

/**
 * Gates the app behind sign-in, and holds students at the fingerprint splash
 * until they have completed it.
 */
export function RequireAuth({ role }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  if (role && session.role !== role) {
    return <Navigate to={session.role === "ADVISOR" ? "/advisor" : "/student"} replace />;
  }

  // /welcome runs before onboarding, so it is exempt from the gate.
  const preOnboarding = ["/onboarding", "/welcome"];
  const needsOnboarding = session.role === "STUDENT" && !session.onboarded;
  if (needsOnboarding && !preOnboarding.includes(location.pathname)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
