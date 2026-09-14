import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import { TransitionProvider } from "@/transition/TransitionProvider";
import { RequireAuth } from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import { AdvisorDashboard } from "@/pages/AdvisorDashboard";
import { LoginPage } from "@/pages/LoginPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { StudentDashboard } from "@/pages/StudentDashboard";
import { WelcomePage } from "@/pages/WelcomePage";

/** Sends a signed-in user to their own side, and everyone else to sign-in. */
function LandingRedirect() {
  const { session } = useAuth();
  if (!session) return <Navigate to="/sign-in" replace />;
  if (session.role === "ADVISOR") return <Navigate to="/advisor" replace />;
  return <Navigate to={session.onboarded ? "/student" : "/onboarding"} replace />;
}

function App() {
  return (
    <AuthProvider>
      <TransitionProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingRedirect />} />
          <Route path="/sign-in" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/welcome" element={<WelcomePage />} />
          </Route>

          <Route element={<RequireAuth role="STUDENT" />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/student" element={<StudentDashboard />} />
          </Route>

          <Route element={<RequireAuth role="ADVISOR" />}>
            <Route path="/advisor" element={<AdvisorDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </TransitionProvider>
    </AuthProvider>
  );
}

export default App;
