import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  FileText,
  Fingerprint,
  Home,
  ListOrdered,
  Plus,
  Settings,
  Star,
  Users,
} from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { DemoGuide } from "@/components/DemoGuide";
import { STUDENT_STEPS } from "@/data/guideSteps";
import { MatchDial } from "@/components/student/MatchDial";
import { Button } from "@/components/ui/button";
import { fetchStudent } from "@/services/api";
import { cn } from "@/lib/utils";

const CONVO_CHIP = {
  reply: "text-mint",
  draft: "text-violet",
  warm: "text-rose",
  sent: "text-muted-ink",
};

function SectionCard({ eyebrow, children, className, ...rest }) {
  return (
    <div
      {...rest}
      className={cn(
        "flex flex-col rounded-[10px] border border-hairline bg-surface px-4 pt-3.5 pb-4",
        className,
      )}
    >
      <div className="text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
        {eyebrow}
      </div>
      {children}
    </div>
  );
}

/** The dashed-rule call to action that closes each path-step card. */
function CardCta({ children }) {
  return (
    <button className="mt-3 border-t border-dashed border-hairline pt-2.5 text-left text-[11.5px] font-medium text-burgundy hover:underline">
      {children}
    </button>
  );
}

/** The thought-bubble motif from the mockup's "what's on your mind" card. */
function MindIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto my-2.5 size-9 text-muted-ink-2"
    >
      <path d="M24 44c-6-2-10-7-10-14 0-9 8-16 18-16s18 7 18 16c0 4-1.5 7.5-4 10v6c0 2-1.5 3-3 3h-3v4" />
      <path d="M24 44v8c0 1.5 1 2.5 2.5 2.5H30" />
      <circle cx="50" cy="48" r="2" />
      <circle cx="55" cy="54" r="1.3" />
      <circle cx="58.5" cy="59" r="0.9" />
    </svg>
  );
}

function Panel({ title, sub, action, children, ...rest }) {
  return (
    <section {...rest} className="rounded-[10px] border border-hairline bg-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
          {sub && <p className="mt-1 text-[12.5px] text-muted-ink">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

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

  const doneCount = student.weeklyActions.filter((action) => action.done).length;

  return (
    <AppShell sections={sections} user={shellUser} onSignOut={logout} onRestart={restartDemo}>
      {/* Page head */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[19px] font-semibold tracking-[-0.015em] text-ink">My Path</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 rounded-lg border-hairline-strong bg-white text-[12.5px] font-medium"
          >
            <Plus className="size-3.5" />
            Log a move
          </Button>
          <Button className="h-8 rounded-lg bg-ink text-[12.5px] font-medium hover:bg-ink-2">
            <CalendarDays className="size-3.5" />
            Book with Bill
          </Button>
        </div>
      </div>

      {/* Intro */}
      <div className="text-[11px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
        November 18 · 26 weeks to graduation
      </div>
      <div className="mt-3 flex items-end justify-between gap-6">
        <div>
          <div className="text-[30px] leading-tight font-semibold tracking-[-0.02em] text-ink">
            Welcome back, {student.name.split(" ")[0]}.
          </div>
          <p className="mt-3 max-w-[720px] text-[15px] leading-relaxed text-muted-ink">
            The first job is a ten-year bet —{" "}
            <em className="text-ink-2">and most graduates lose it.</em> Let&apos;s make sure
            you don&apos;t.
          </p>
        </div>
        <button className="shrink-0 text-[12.5px] font-medium text-burgundy hover:underline">
          View fingerprint →
        </button>
      </div>

      {/* Hero */}
      <div
        data-tour="hero"
        className="relative mt-6 grid grid-cols-[140px_1fr_280px] items-center gap-8 overflow-hidden rounded-[10px] border border-hairline bg-surface px-8 py-7"
      >
        {/* Mockup's .hero::before accent rule */}
        <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-burgundy via-brass to-amber opacity-70" />
        <MatchDial percent={student.matchPercent} />

        <div>
          <div className="text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
            Target role · locked
          </div>
          <div className="mt-2 text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">
            {student.targetRole}
          </div>
          <p className="mt-3 max-w-[520px] text-[13.5px] leading-relaxed text-muted-ink">
            {student.matchBasis}
          </p>
          <p className="mt-3 text-[11.5px] text-muted-ink-2">{student.matchSource}</p>
        </div>

        <div className="border-l border-hairline pl-6">
          <div className="text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
            Adjacent paths
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {student.adjacentPaths.map((path) => (
              <div key={path.title} className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-ink-2">{path.title}</span>
                <span className="text-[12.5px] font-medium text-muted-ink tnum">
                  {path.fitPercent}% fit
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Path row */}
      <div className="mt-3 grid grid-cols-4 gap-3">
        <SectionCard
          eyebrow="Your next advising meeting"
          className="border-[#f3e7c4] bg-highlight"
          data-tour="meeting"
        >
          <div className="mt-2 flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#3d3a35] text-[12px] font-semibold tracking-[0.02em] text-[#f4efe2]">
              BH
            </span>
            <div className="leading-tight">
              <div className="text-[14px] font-semibold tracking-[-0.005em] text-ink">
                Bill Hudlow
              </div>
              <div className="mt-px text-[11.5px] text-muted-ink">
                Freeman Career Consultant · Your navigator
              </div>
            </div>
          </div>
          <p className="mt-2.5 border-t border-dashed border-[#eacf96] pt-2 text-[12.5px] leading-[1.45] text-ink-2">
            <b className="font-semibold text-ink">Today · 11:30</b> · Goldring-Woldenberg 340.
            Pre-brief auto-loaded; bring questions on Goldman Round 2.
          </p>
        </SectionCard>

        <SectionCard eyebrow="What's on your mind">
          <MindIcon />
          <ul className="flex flex-1 flex-col gap-2">
            {student.concerns.map((concern) => (
              <li key={concern.title} className="flex gap-2 text-[12px] leading-[1.45]">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-ink-2" />
                <span className="text-muted-ink">
                  <b className="font-semibold text-ink">{concern.title}.</b> {concern.detail}
                </span>
              </li>
            ))}
          </ul>
          <CardCta>Articulate your concerns →</CardCta>
        </SectionCard>

        <SectionCard eyebrow="My top firms">
          <ul className="mt-3 flex flex-1 flex-col gap-2">
            {student.firms.map((firm) => (
              <li
                key={firm.name}
                className={cn(
                  "grid grid-cols-[32px_1fr_14px] items-center gap-2.5 rounded-lg border px-2.5 py-2",
                  firm.favorite
                    ? "border-[#f3e7c4] bg-highlight"
                    : "border-hairline bg-white",
                )}
              >
                <span className="flex size-8 items-center justify-center rounded-[7px] bg-[#0b2340] text-[11px] font-bold tracking-[0.02em] text-white">
                  {firm.mark}
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[12.5px] font-semibold text-ink">
                    {firm.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-[1.3] text-muted-ink">
                    {firm.subtitle}
                  </span>
                </span>
                <Star
                  className={cn(
                    "size-3.5",
                    firm.favorite ? "fill-[#d9a441] text-[#d9a441]" : "text-hairline-strong",
                  )}
                />
              </li>
            ))}
          </ul>
          <CardCta>Refine your target list →</CardCta>
        </SectionCard>

        <SectionCard eyebrow="Strategies for me">
          <ul className="mt-3 flex flex-1 flex-col gap-2">
            {student.strategies.map((strategy) => (
              <li
                key={strategy.number}
                className="grid grid-cols-[26px_1fr] items-center gap-2.5 rounded-lg border border-hairline bg-white px-3 py-2.5"
              >
                <span className="text-[11px] font-medium text-muted-ink-2 tnum">
                  {strategy.number}
                </span>
                <span className="text-[12.5px] font-medium text-ink">{strategy.text}</span>
              </li>
            ))}
          </ul>
          <CardCta>Open full playbook →</CardCta>
        </SectionCard>
      </div>

      {/* Two column */}
      <div className="mt-6 grid grid-cols-[1fr_360px] gap-6">
        <Panel
          data-tour="courses"
          title="Courses for Spring"
          sub="Ranked by fit to your target — not by what's popular."
          action={
            <Button
              variant="outline"
              className="h-7 rounded-lg border-hairline-strong bg-white text-[12px]"
            >
              See all 8 →
            </Button>
          }
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-hairline text-left">
                <th className="w-[110px] pb-2 text-[11px] font-medium tracking-wide text-muted-ink-2 uppercase">
                  Code
                </th>
                <th className="pb-2 text-[11px] font-medium tracking-wide text-muted-ink-2 uppercase">
                  Course
                </th>
                <th className="w-[150px] pb-2 text-[11px] font-medium tracking-wide text-muted-ink-2 uppercase">
                  Instructor
                </th>
                <th className="w-[90px] pb-2 text-right text-[11px] font-medium tracking-wide text-muted-ink-2 uppercase">
                  Fit
                </th>
              </tr>
            </thead>
            <tbody>
              {student.courses.map((course) => (
                <tr key={course.code} className="border-b border-hairline last:border-0">
                  <td className="py-3.5 align-top text-[12px] font-medium text-muted-ink tnum">
                    {course.code}
                  </td>
                  <td className="py-3.5 pr-6 align-top">
                    <div className="text-[13.5px] font-medium text-ink">{course.title}</div>
                    <div className="mt-1 text-[12px] leading-relaxed text-muted-ink">
                      {course.why}
                    </div>
                  </td>
                  <td className="py-3.5 align-top text-[12.5px] text-ink-2">
                    {course.instructor}
                    <div className="text-[11.5px] text-muted-ink-2">{course.meeting}</div>
                  </td>
                  <td className="py-3.5 text-right align-top">
                    <span className="text-[15px] font-semibold text-ink tnum">
                      {course.fit}
                    </span>
                    <span className="ml-1 text-[11px] text-muted-ink-2">fit</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel
            title="Alumni conversations"
            sub="4 active · sorted by most recent"
            action={
              <Button
                variant="outline"
                className="h-7 rounded-lg border-hairline-strong bg-white text-[12px]"
              >
                Inbox →
              </Button>
            }
          >
            <div className="flex flex-col">
              {student.conversations.map((convo) => (
                <div
                  key={convo.name}
                  className="grid grid-cols-[36px_1fr_auto] gap-3 border-b border-hairline py-3 last:border-0"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#d7d2c8] text-[11px] font-semibold text-[#3d3a35]">
                    {convo.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-semibold text-ink">{convo.name}</span>
                      <span className="truncate text-[11px] text-muted-ink-2">
                        {convo.role}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-ink">
                      {convo.prefix && (
                        <span className="font-medium text-ink-2">{convo.prefix} </span>
                      )}
                      {convo.snippet}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                      <span
                        className={cn(
                          "font-medium",
                          CONVO_CHIP[convo.status] ?? "text-muted-ink",
                        )}
                      >
                        {convo.statusLabel}
                      </span>
                      <span className="text-muted-ink-2">·</span>
                      <span className="text-muted-ink-2">{convo.meta}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[11px] whitespace-nowrap text-muted-ink-2">
                      {convo.time}
                    </span>
                    {convo.unread && <span className="size-1.5 rounded-full bg-burgundy" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3.5 flex gap-2 border-t border-hairline pt-3.5">
              <Button className="h-8 flex-1 rounded-lg bg-ink text-[12.5px] hover:bg-ink-2">
                Open Sarah&apos;s reply
              </Button>
              <Button
                variant="outline"
                className="h-8 flex-1 rounded-lg border-hairline-strong bg-white text-[12.5px]"
              >
                Send Rachel&apos;s draft
              </Button>
            </div>
          </Panel>

          <Panel
            title="This week"
            sub={`${student.weeklyActions.length} actions`}
            action={
              <span className="text-[12px] text-muted-ink tnum">
                {doneCount} of {student.weeklyActions.length} done
              </span>
            }
          >
            <div className="flex flex-col gap-3.5">
              {student.weeklyActions.map((action) => (
                <div key={action.title} className="flex gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-md border",
                      action.done
                        ? "border-mint bg-mint text-white"
                        : "border-hairline-strong bg-white",
                    )}
                  >
                    {action.done && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <div className={cn(action.done && "opacity-55")}>
                    <h5 className="text-[13px] font-medium text-ink">{action.title}</h5>
                    <p className="mt-0.5 text-[12px] leading-snug text-muted-ink">
                      {action.detail}
                    </p>
                    <div className="mt-1 text-[11px] text-muted-ink-2">{action.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
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
