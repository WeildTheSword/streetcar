import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import { TransitionProvider } from "@/transition/TransitionProvider";
import { RequireAuth } from "@/auth/RequireAuth";
import { sessionRole } from "@/auth/sessionRole";
import { useAuth } from "@/auth/useAuth";
import { AccountPage } from "@/pages/AccountPage";
import { AdvisorAppointmentsPage } from "@/pages/AdvisorAppointmentsPage";
import { AdvisorDashboard } from "@/pages/AdvisorDashboard";
import { AdvisorLogsPage } from "@/pages/AdvisorLogsPage";
import { AdvisorOutcomesPage } from "@/pages/AdvisorOutcomesPage";
import { AdvisorPerformancePage } from "@/pages/AdvisorPerformancePage";
import { AdvisorReportsPage } from "@/pages/AdvisorReportsPage";
import { AdvisorStudentsPage } from "@/pages/AdvisorStudentsPage";
import { AdvisorTrendsPage } from "@/pages/AdvisorTrendsPage";
import { AlumniDirectoryPage } from "@/pages/AlumniDirectoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { StudentAlumniPage } from "@/pages/StudentAlumniPage";
import { StudentApplicationsPage } from "@/pages/StudentApplicationsPage";
import { StudentAppointmentsPage } from "@/pages/StudentAppointmentsPage";
import { StudentCoursesPage } from "@/pages/StudentCoursesPage";
import { StudentDashboard } from "@/pages/StudentDashboard";
import { StudentFingerprintPage } from "@/pages/StudentFingerprintPage";
import { StudentResumePage } from "@/pages/StudentResumePage";
import SubmissionsPage from "@/pages/SubmissionsPage";
import { WelcomePage } from "@/pages/WelcomePage";

/** Sends a signed-in user to their own side, and everyone else to sign-in. */
function LandingRedirect() {
  const { session } = useAuth();
  if (!session) return <Navigate to="/sign-in" replace />;
  const role = sessionRole(session);
  if (role === "ADVISOR") return <Navigate to="/advisor" replace />;
  if (role === "ALUMNI") return <Navigate to="/account" replace />;
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
            <Route path="/profiles" element={<SubmissionsPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>

          <Route element={<RequireAuth role="STUDENT" />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<StudentCoursesPage />} />
            <Route path="/student/alumni" element={<StudentAlumniPage />} />
            <Route path="/student/appointments" element={<StudentAppointmentsPage />} />
            <Route path="/student/applications" element={<StudentApplicationsPage />} />
            <Route path="/student/fingerprint" element={<StudentFingerprintPage />} />
            <Route path="/student/resume" element={<StudentResumePage />} />
          </Route>

          <Route element={<RequireAuth role="ADVISOR" />}>
            <Route path="/advisor" element={<AdvisorDashboard />} />
            <Route path="/advisor/students" element={<AdvisorStudentsPage />} />
            <Route path="/advisor/appointments" element={<AdvisorAppointmentsPage />} />
            <Route path="/advisor/alumni" element={<AlumniDirectoryPage />} />
            <Route path="/advisor/trends" element={<AdvisorTrendsPage />} />
            <Route path="/advisor/performance" element={<AdvisorPerformancePage />} />
            <Route path="/advisor/outcomes" element={<AdvisorOutcomesPage />} />
            <Route path="/advisor/reports" element={<AdvisorReportsPage />} />
            <Route path="/advisor/logs" element={<AdvisorLogsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </TransitionProvider>
    </AuthProvider>
  );
}

export default App;
