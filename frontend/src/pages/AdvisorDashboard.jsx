import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Database,
  Eye,
  FileBarChart,
  Home,
  LayoutGrid,
  Plus,
  ScrollText,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import predators from "@/assets/predators.png";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { DemoGuide } from "@/components/DemoGuide";
import { ADVISOR_STEPS } from "@/data/guideSteps";
import { BankerPortrait } from "@/components/advisor/BankerPortrait";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAdvisorDashboard } from "@/services/api";
import { cn } from "@/lib/utils";

const TONE_DOT = {
  rose: "bg-rose",
  amber: "bg-amber",
  violet: "bg-violet",
  sky: "bg-sky",
};

const STATUS_CHIP = {
  reply: "bg-mint/12 text-mint",
  sent: "bg-hairline text-muted-ink",
  draft: "bg-highlight text-brass",
  warm: "bg-rose/10 text-rose",
};

const FEED_ICON = {
  alert: { icon: CircleAlert, className: "text-rose" },
  check: { icon: CheckCircle2, className: "text-mint" },
  spark: { icon: Sparkles, className: "text-amber" },
  report: { icon: FileBarChart, className: "text-violet" },
};

function Card({ title, icon: Icon, className, children, ...rest }) {
  return (
    <div
      {...rest}
      className={cn(
        "flex flex-col rounded-[10px] border border-hairline bg-surface p-3.5",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[12px] font-medium text-ink-2">
        {Icon && <Icon className="size-3.5 text-muted-ink-2" strokeWidth={1.8} />}
        {title}
      </div>
      {children}
    </div>
  );
}

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

  const sections = [
    { items: [{ icon: Home, label: "Advisor Portal", active: true }] },
    {
      label: "Navigate",
      items: [
        { icon: Users, label: "My Students", count: 28 },
        { icon: Database, label: "Alumni Database" },
        { icon: TrendingUp, label: "Internal Hiring Trends" },
        { icon: CalendarDays, label: "Appointments", count: 7 },
        { icon: BarChart3, label: "Performance" },
      ],
    },
    {
      label: "Manage",
      items: [
        { icon: BarChart3, label: "Outcomes" },
        { icon: LayoutGrid, label: "Reports" },
        { icon: ScrollText, label: "Logs" },
        { icon: Settings, label: "Settings" },
      ],
    },
  ];

  const shellUser = {
    name: session.displayName,
    subtitle: session.subtitle,
    initials: session.initials,
    email: "bill.hudlow@tulane.edu",
    badge: predators,
  };

  if (error) {
    return (
      <AppShell sections={sections} user={shellUser} onSignOut={logout} onRestart={restartDemo}>
        <p className="text-[13.5px] text-rose">{error}</p>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell sections={sections} user={shellUser} onSignOut={logout} onRestart={restartDemo}>
        <p className="text-[13.5px] text-muted-ink">Loading your console…</p>
      </AppShell>
    );
  }

  const { nextStudent, nextAppointment, schedule, updates, alumniRadar } = data;
  const firstName = nextStudent.name.split(" ")[0];
  const topFirm = nextStudent.firms[0];

  return (
    <AppShell sections={sections} user={shellUser} onSignOut={logout} onRestart={restartDemo}>
      <div className="mb-7 flex items-center justify-between gap-4">
        <h1 className="text-[19px] font-semibold tracking-[-0.015em] text-ink">
          Advisor Portal
        </h1>
        <Button
          variant="outline"
          className="h-8 rounded-lg border-hairline-strong bg-white text-[12.5px] font-medium"
        >
          <LayoutGrid className="size-3.5" />
          Customize My Dashboard
        </Button>
      </div>

      <div className="text-[11px] font-medium tracking-[0.12em] text-brass uppercase">
        Hi, {firstName === "Morgan" ? session.displayName.split(" ")[0] : firstName}.
      </div>
      <h2 className="mt-3 text-[46px] leading-[1.02] font-bold tracking-[-0.03em] text-ink uppercase">
        Your next upcoming appointment
      </h2>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="text-[13.5px] text-muted-ink">
          Pre-brief auto-assembled and ready to review.
        </p>
        <button className="text-[13px] font-medium text-ink hover:underline">
          View full schedule →
        </button>
      </div>

      {/* Hero pre-brief */}
      <div data-tour="prebrief" className="mt-4 rounded-[10px] border border-hairline bg-surface">
        <div className="h-[3px] rounded-t-[9px] bg-gradient-to-r from-burgundy via-brass to-transparent" />
        <div className="grid grid-cols-[200px_1fr_260px] items-center gap-8 p-7">
          <BankerPortrait className="mx-auto h-[210px] w-auto" />

          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
              <span className="size-1.5 rounded-full bg-mint" />
              Career profile · High confidence
            </div>
            <p className="mt-2.5 text-[13.5px] text-muted-ink">
              Pre-brief for{" "}
              <span className="font-semibold text-ink">{nextStudent.name}</span> ·{" "}
              {nextAppointment.time} · {nextAppointment.year} · {nextAppointment.major}
            </p>
            <div className="mt-3 text-[42px] leading-[1.05] font-bold tracking-[-0.03em] text-ink uppercase">
              {nextStudent.targetRole}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-1.5 w-[130px] overflow-hidden rounded-full bg-hairline">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mint/70 to-mint"
                  style={{ width: `${nextStudent.matchPercent}%` }}
                />
              </div>
              <span className="text-[13.5px] font-semibold text-ink tnum">
                {nextStudent.matchPercent}% match
              </span>
              <span className="text-[12.5px] text-muted-ink">
                · based on GPA {nextStudent.gpa}, ACCN-2010 (A+) &amp; 3 other metrics
              </span>
            </div>
          </div>

          <div className="border-l border-hairline pl-7">
            <Button
              variant="outline"
              className="h-8 rounded-lg border-hairline-strong bg-white text-[12.5px] font-medium"
            >
              <Eye className="size-3.5" />
              See Student View
            </Button>
            <div className="mt-6 text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
              Adjacent paths
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {nextStudent.adjacentPaths.map((path) => (
                <div key={path.title} className="flex items-baseline justify-between gap-3">
                  <span className="text-[12.5px] text-ink-2">{path.title}</span>
                  <span className="text-[12.5px] font-semibold text-ink tnum">
                    {path.fitPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Four cards */}
      <div className="mt-3 grid grid-cols-4 gap-3">
        <Card title={`${firstName} is talking to`} icon={Users}>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[12.5px] font-semibold text-ink">
              {nextStudent.conversations.length} alumni
            </span>
            <span className="rounded bg-hairline px-1.5 py-0.5 text-[9.5px] font-medium tracking-wide text-muted-ink uppercase">
              IB · Goldman
            </span>
          </div>
          <ul className="mt-2.5 flex flex-col gap-2">
            {nextStudent.conversations.map((convo) => (
              <li key={convo.name} className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#d7d2c8] text-[9.5px] font-semibold text-[#3d3a35]">
                  {convo.initials}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[11.5px] font-medium text-ink">
                    {convo.name}
                  </span>
                  <span className="block truncate text-[10px] text-muted-ink-2">
                    {convo.role}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wide uppercase",
                    STATUS_CHIP[convo.status] ?? "bg-hairline text-muted-ink",
                  )}
                >
                  {convo.statusLabel}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`${firstName} is concerned about`} icon={CircleAlert} data-tour="concerns">
          <ul className="mt-3 flex flex-col gap-2">
            {nextStudent.concerns.map((concern) => (
              <li key={concern.title} className="flex gap-2 text-[11.5px] leading-snug">
                <span
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full",
                    TONE_DOT[concern.tone] ?? "bg-muted-ink-2",
                  )}
                />
                <span className="text-muted-ink">
                  <b className="font-semibold text-ink">{concern.title}:</b> {concern.detail}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`${firstName}'s top firm pick`} icon={TrendingUp}>
          <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-ink p-3">
            <span className="flex size-8 items-center justify-center rounded-md bg-white/12 text-[11px] font-bold text-white">
              {topFirm.mark}
            </span>
            <span className="leading-tight">
              <span className="block text-[13px] font-semibold text-white">
                {topFirm.name}
              </span>
              <span className="block text-[10.5px] text-white/50">
                IB Summer Analyst · NYC
              </span>
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-hairline p-2.5">
              <div className="text-[9px] font-medium tracking-wide text-muted-ink-2 uppercase">
                Freeman placement
              </div>
              <div className="mt-1 text-[19px] font-semibold text-ink tnum">
                73<span className="text-[11px] text-muted-ink-2">%</span>
              </div>
            </div>
            <div className="rounded-lg border border-hairline p-2.5">
              <div className="text-[9px] font-medium tracking-wide text-muted-ink-2 uppercase">
                {firstName}&apos;s fit
              </div>
              <div className="mt-1 text-[19px] font-semibold text-ink tnum">
                {nextStudent.matchPercent}
                <span className="text-[11px] text-muted-ink-2">%</span>
              </div>
            </div>
          </div>
          <div className="mt-2 rounded-lg border border-hairline p-2.5">
            <div className="text-[9px] font-medium tracking-wide text-muted-ink-2 uppercase">
              Hired from Tulane &apos;24
            </div>
            <div className="mt-1 text-[19px] font-semibold text-ink tnum">
              5<span className="ml-1.5 text-[11px] font-normal text-muted-ink">in IBD role</span>
            </div>
          </div>
        </Card>

        <Card
          title={`Strategies for ${firstName}`}
          icon={Sparkles}
          className="border-brass/35 bg-highlight"
        >
          <ul className="mt-3 flex flex-1 flex-col gap-2">
            {nextStudent.strategies.map((strategy) => (
              <li
                key={strategy.number}
                className="grid grid-cols-[24px_1fr] items-center gap-2 rounded-lg border border-brass/25 bg-white px-2.5 py-2"
              >
                <span className="rounded bg-hairline px-1 py-0.5 text-center text-[9.5px] font-semibold text-muted-ink tnum">
                  {strategy.number}
                </span>
                <span className="text-[11.5px] font-medium text-ink">{strategy.text}</span>
              </li>
            ))}
          </ul>
          <Button className="mt-3 h-7 rounded-lg bg-ink text-[11.5px] hover:bg-ink-2">
            Open full playbook →
          </Button>
        </Card>
      </div>

      {/* Schedule + updates */}
      <div className="mt-7 grid grid-cols-[1fr_360px] gap-7">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">
              Today&apos;s Schedule
            </h3>
            <div className="flex items-center gap-2">
              <Tabs defaultValue="24h">
                <TabsList className="h-7 rounded-lg bg-hairline/60 p-0.5">
                  {["24h", "7d", "30d", "90d"].map((range) => (
                    <TabsTrigger
                      key={range}
                      value={range}
                      className="h-6 rounded-md px-2.5 text-[11.5px] data-[state=active]:bg-ink data-[state=active]:text-white"
                    >
                      {range}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button className="h-7 rounded-lg bg-ink text-[11.5px] hover:bg-ink-2">
                <Plus className="size-3.5" />
                New appointment
              </Button>
            </div>
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-3">
            {schedule.map((appointment) => (
              <div
                key={appointment.id}
                className={cn(
                  "rounded-[10px] border bg-surface p-3.5",
                  appointment.studentId === nextStudent.id
                    ? "border-brass/45"
                    : "border-hairline",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d7d2c8] text-[10px] font-semibold text-[#3d3a35]">
                    {appointment.initials}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-[13px] font-semibold text-ink">
                      {appointment.studentName}
                    </div>
                    <div className="text-[11px] text-muted-ink">
                      {appointment.major} · {appointment.year} · {appointment.gpa}
                    </div>
                  </div>
                  <span className="shrink-0 text-[11.5px] text-muted-ink tnum">
                    {appointment.time}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-ink-2">
                  <span className="size-1.5 rounded-full bg-brass" />
                  Track: {appointment.track}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {appointment.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-hairline/70 px-1.5 py-0.5 text-[10px] text-muted-ink"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">Updates</h3>
          <div className="mt-3.5 flex flex-col">
            {updates.map((item) => {
              const { icon: Icon, className } = FEED_ICON[item.kind] ?? FEED_ICON.report;
              return (
                <div
                  key={item.title}
                  className="flex gap-2.5 border-b border-hairline py-3 last:border-0"
                >
                  <Icon className={cn("mt-0.5 size-4 shrink-0", className)} strokeWidth={1.8} />
                  <div>
                    <div className="text-[11px] text-muted-ink-2">{item.time}</div>
                    <div className="mt-0.5 text-[12.5px] font-semibold text-ink">
                      {item.title}
                    </div>
                    <p className="mt-1 text-[11.5px] leading-snug text-muted-ink">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alumni radar */}
      <section data-tour="radar" className="mt-7 rounded-[10px] border border-hairline bg-surface p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              Alumni Radar
            </h3>
            <span className="text-[12px] text-muted-ink">
              Recent role announcements matching open student tracks
            </span>
          </div>
          <button className="text-[12.5px] font-medium text-ink hover:underline">
            View all →
          </button>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-hairline text-left">
              {["Alum", "New role", "City", "Matches", ""].map((heading, index) => (
                <th
                  key={heading || index}
                  className="pb-2 text-[10.5px] font-medium tracking-wide text-muted-ink-2 uppercase"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alumniRadar.map((row) => (
              <tr key={row.name} className="border-b border-hairline last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d7d2c8] text-[10px] font-semibold text-[#3d3a35]">
                      {row.initials}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[12.5px] font-semibold text-ink">
                        {row.name}
                      </span>
                      <span className="block text-[11px] text-muted-ink-2">{row.school}</span>
                    </span>
                  </div>
                </td>
                <td className="py-3 text-[12.5px] text-ink-2">{row.newRole}</td>
                <td className="py-3 text-[12.5px] text-muted-ink">{row.city}</td>
                <td className="py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[12px]",
                      row.matches > 0 ? "text-ink-2" : "text-muted-ink-2",
                    )}
                  >
                    {row.matches > 0 && <span className="size-1.5 rounded-full bg-mint" />}
                    {row.matchLabel}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="text-[12.5px] font-medium text-ink hover:underline">
                    {row.matches > 0 ? "Draft intro →" : "Archive →"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <DemoGuide key="advisor" steps={ADVISOR_STEPS} intro />
    </AppShell>
  );
}
