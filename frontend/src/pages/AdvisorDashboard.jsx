import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { DemoGuide } from "@/components/DemoGuide";
import { ADVISOR_STEPS } from "@/data/guideSteps";
import { AlumniRadar } from "@/components/advisor/AlumniRadar";
import { AppointmentHeading } from "@/components/advisor/AppointmentHeading";
import { ConcernsCard } from "@/components/advisor/ConcernsCard";
import { PreBriefHero } from "@/components/advisor/PreBriefHero";
import { StrategiesCard } from "@/components/advisor/StrategiesCard";
import { TalkingToCard } from "@/components/advisor/TalkingToCard";
import { TodaySchedule } from "@/components/advisor/TodaySchedule";
import { TopFirmCard } from "@/components/advisor/TopFirmCard";
import { UpdatesFeed } from "@/components/advisor/UpdatesFeed";
import { fetchAdvisorDashboard } from "@/services/api";

const SECTIONS = advisorSections("portal");

export function AdvisorDashboard() {
  const { session, logout, restartDemo } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdvisorDashboard(session.profileId)
      .then((next) => !cancelled && setData(next))
      .catch(() => !cancelled && setError("Could not load your console."));
    return () => {
      cancelled = true;
    };
  }, [session.profileId]);

  const shellUser = advisorShellUser(session);

  if (error) {
    return (
      <AppShell sections={SECTIONS} user={shellUser} onSignOut={logout} onRestart={restartDemo}>
        <p className="text-[13.5px] text-rose">{error}</p>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell sections={SECTIONS} user={shellUser} onSignOut={logout} onRestart={restartDemo}>
        <p className="text-[13.5px] text-muted-ink">Loading your console…</p>
      </AppShell>
    );
  }

  const { nextStudent, nextAppointment, schedule, updates, alumniRadar } = data;
  const firstName = nextStudent.name.split(" ")[0];

  return (
    <AppShell sections={SECTIONS} user={shellUser} onSignOut={logout} onRestart={restartDemo}>
      <AppointmentHeading
        greetingName={firstName === "Morgan" ? session.displayName.split(" ")[0] : firstName}
      />

      <PreBriefHero nextStudent={nextStudent} nextAppointment={nextAppointment} />

      <div className="mt-3 grid grid-cols-4 gap-3">
        <TalkingToCard firstName={firstName} conversations={nextStudent.conversations} />
        <ConcernsCard firstName={firstName} concerns={nextStudent.concerns} />
        <TopFirmCard
          firstName={firstName}
          topFirm={nextStudent.firms[0]}
          matchPercent={nextStudent.matchPercent}
        />
        <StrategiesCard firstName={firstName} strategies={nextStudent.strategies} />
      </div>

      <div className="mt-7 grid grid-cols-[1fr_360px] gap-7">
        <TodaySchedule schedule={schedule} nextStudentId={nextAppointment?.studentId} />
        <UpdatesFeed updates={updates} />
      </div>

      <AlumniRadar alumniRadar={alumniRadar} />

      <DemoGuide key="advisor" steps={ADVISOR_STEPS} intro />
    </AppShell>
  );
}
