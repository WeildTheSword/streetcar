import { useEffect, useState } from "react";
import {
  CalendarDays,
  FileText,
  Fingerprint,
  Home,
  ListOrdered,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { DemoGuide } from "@/components/DemoGuide";
import { STUDENT_STEPS } from "@/data/guideSteps";
import { AdvisingMeetingCard } from "@/components/student/AdvisingMeetingCard";
import { AlumniConversationsPanel } from "@/components/student/AlumniConversationsPanel";
import { ConcernsCard } from "@/components/student/ConcernsCard";
import { CourseFitPanel } from "@/components/student/CourseFitPanel";
import { MatchHero } from "@/components/student/MatchHero";
import { PathHeader } from "@/components/student/PathHeader";
import { StrategiesCard } from "@/components/student/StrategiesCard";
import { TopFirmsCard } from "@/components/student/TopFirmsCard";
import { WeeklyActionsPanel } from "@/components/student/WeeklyActionsPanel";
import { fetchStudent } from "@/services/api";

export function StudentDashboard() {
  const { session, logout, restartDemo } = useAuth();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchStudent(session.profileId)
      .then((data) => !cancelled && setStudent(data))
      .catch(() => !cancelled && setError("Could not load your path."));
    return () => {
      cancelled = true;
    };
  }, [session.profileId]);

  const sections = [
    {
      items: [{ icon: Home, label: "My Path", active: true }],
    },
    {
      label: "Plan",
      items: [
        { icon: ListOrdered, label: "Courses" },
        { icon: Users, label: "Alumni", count: 3 },
        { icon: CalendarDays, label: "Appointments", count: 1 },
        { icon: FileText, label: "Applications", count: 14 },
      ],
    },
    {
      label: "Me",
      items: [
        { icon: Fingerprint, label: "Fingerprint" },
        { icon: FileText, label: "Resume" },
        { icon: Settings, label: "Settings" },
      ],
    },
  ];

  const shellUser = {
    name: session.displayName,
    subtitle: session.subtitle,
    initials: session.initials,
    email: "morgan@tulane.edu",
  };

  if (error) {
    return (
      <AppShell sections={sections} user={shellUser} onSignOut={logout} onRestart={restartDemo}>
        <p className="text-[13.5px] text-rose">{error}</p>
      </AppShell>
    );
  }

  if (!student) {
    return (
      <AppShell sections={sections} user={shellUser} onSignOut={logout} onRestart={restartDemo}>
        <p className="text-[13.5px] text-muted-ink">Loading your path…</p>
      </AppShell>
    );
  }

  return (
    <AppShell sections={sections} user={shellUser} onSignOut={logout} onRestart={restartDemo}>
      <PathHeader firstName={student.name.split(" ")[0]} />

      <MatchHero
        matchPercent={student.matchPercent}
        targetRole={student.targetRole}
        matchBasis={student.matchBasis}
        matchSource={student.matchSource}
        adjacentPaths={student.adjacentPaths}
      />

      {/* Path row */}
      <div className="mt-3 grid grid-cols-4 gap-3">
        <AdvisingMeetingCard />
        <ConcernsCard concerns={student.concerns} />
        <TopFirmsCard firms={student.firms} />
        <StrategiesCard strategies={student.strategies} />
      </div>

      {/* Two column */}
      <div className="mt-6 grid grid-cols-[1fr_360px] gap-6">
        <CourseFitPanel courses={student.courses} />

        <div className="flex flex-col gap-6">
          <AlumniConversationsPanel conversations={student.conversations} />
          <WeeklyActionsPanel actions={student.weeklyActions} />
        </div>
      </div>

      <div className="mt-8 flex justify-between border-t border-hairline pt-4 text-[11.5px] text-muted-ink-2">
        <span>Tulane University Pilot · New Orleans, LA</span>
        <span>FERPA opt-in · You control what is shared</span>
        <span>Student Portal · v0.4</span>
      </div>

      <DemoGuide key="student" steps={STUDENT_STEPS} />
    </AppShell>
  );
}
