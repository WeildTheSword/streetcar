import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Database,
  Loader2,
  Search,
  ShieldCheck,
  UserCheck,
  Waypoints,
} from "lucide-react";
import fingerprint from "@/assets/fingerprint.png";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { FerpaDialog } from "@/components/FerpaDialog";
import { DemoGuide } from "@/components/DemoGuide";
import { PROFILE_STEPS, SCAN_STEPS, TRANSCRIPT_STEPS } from "@/data/guideSteps";
import { fetchStudent } from "@/services/api";
import { cn } from "@/lib/utils";

const STAGES = [
  { label: "Reading registrar degree audit", detail: "48 credits · GPA 3.89" },
  { label: "Matching cohort outcomes", detail: "Freeman '24 · 73% placed" },
  { label: "Scanning alumni graph", detail: "1,204 alumni · 38 in IB" },
  { label: "Assembling career fingerprint", detail: "5 signals weighted" },
];

const STAGE_MS = 850;
const ROW_MS = 130;

const CAREER_GOALS = [
  "Investment Banking",
  "Private Equity",
  "Management Consulting",
  "Product Management",
  "Software Engineering",
  "Still exploring",
];

const MAJORS = [
  "Finance + Computer Science",
  "Finance",
  "Computer Science",
  "Business Analytics",
  "Economics",
];

const GRAD_TERMS = ["May 2027", "December 2026", "May 2028"];

/** What Streetcar does with the record once it is loaded. */
const PROMISES = [
  {
    icon: Waypoints,
    title: "Tracked live",
    body: "Every course you add or finish updates your fingerprint automatically — you never re-enter anything.",
  },
  {
    icon: UserCheck,
    title: "Shared with your advisor",
    body: "Bill Hudlow sees an assembled pre-brief before each session, so you spend the meeting deciding rather than catching him up.",
  },
  {
    icon: Database,
    title: "Matched against outcomes",
    body: "Your record is compared with 1,204 Tulane alumni records and Freeman placement data for your cohort.",
  },
  {
    icon: ShieldCheck,
    title: "So you always know where you stand",
    body: "Which courses move you toward the work you want, and what to do next to get there.",
  },
];

function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col">
      <label className="text-[13px] font-medium text-ink-2">
        {label}
        {required && <span className="ml-1 font-semibold text-[#2563eb]">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-[12px] leading-[1.4] text-muted-ink">{hint}</p>}
    </div>
  );
}

const controlClass =
  "w-full rounded-lg border border-hairline-strong bg-white px-3 py-2.5 text-[14px] text-ink " +
  "outline-none transition focus:border-burgundy focus:ring-[3px] focus:ring-burgundy/20";

export function OnboardingPage() {
  const { session, finishOnboarding } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("profile");
  const [student, setStudent] = useState(null);
  const [splashId, setSplashId] = useState("425006469");
  const [major, setMajor] = useState(MAJORS[0]);
  const [gradTerm, setGradTerm] = useState(GRAD_TERMS[0]);
  const [goal, setGoal] = useState(CAREER_GOALS[0]);
  const [focus, setFocus] = useState("");
  const [rows, setRows] = useState(0);
  const [stage, setStage] = useState(0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchStudent(session.profileId)
      .then((data) => !cancelled && setStudent(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session.profileId]);

  const transcript = useMemo(() => student?.transcript ?? [], [student]);

  // Stream transcript rows in once the record is pulled.
  useEffect(() => {
    if (phase !== "transcript" || rows >= transcript.length) return undefined;
    const timer = setTimeout(() => setRows((current) => current + 1), ROW_MS);
    return () => clearTimeout(timer);
  }, [phase, rows, transcript.length]);

  useEffect(() => {
    if (phase !== "scan" || stage >= STAGES.length) return undefined;
    const timer = setTimeout(() => setStage((current) => current + 1), STAGE_MS);
    return () => clearTimeout(timer);
  }, [phase, stage]);

  const shown = transcript.slice(0, rows);
  const credits = shown.reduce((total, entry) => total + entry.credits, 0);
  const transcriptDone = transcript.length > 0 && rows >= transcript.length;
  const scanComplete = stage >= STAGES.length;

  async function handleContinue() {
    setPending(true);
    await finishOnboarding();
    navigate("/student", { replace: true });
  }

  /* ---------------- Phase 1: profile form ---------------- */
  if (phase === "profile") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-[640px] rounded-[10px] border border-hairline bg-surface p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-2.5 py-1 text-[12px] font-semibold text-[#2563eb]">
            <span className="size-1.5 rounded-full bg-[#2563eb]" />
            First session
          </span>

          <h1 className="mt-2.5 text-[22px] font-bold tracking-[-0.02em] text-ink">
            Load your student profile
          </h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-ink">
            Streetcar will pull your degree audit and assemble your career fingerprint —
            your match scores, the courses that actually move you toward your goal, and the
            alumni already doing that work.
          </p>

          <form
            className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setPhase("transcript");
            }}
          >
            <div className="col-span-2" data-tour="splash">
              <Field
                label="Student Splash Card ID"
                required
                hint="Nine digits, no letters. Your information is pulled directly from the registrar degree audit."
              >
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink-2" />
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    pattern="\d{9}"
                    maxLength={9}
                    title="Splash Card numbers are 9 digits, no letters."
                    value={splashId}
                    // Splash Card IDs are 9 digits — strip anything else as it is typed.
                    onChange={(event) =>
                      setSplashId(event.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    placeholder="Tap or scan Splash Card, or enter 9-digit ID"
                    className={cn(controlClass, "pl-9 tnum tracking-[0.04em]")}
                  />
                </div>
              </Field>
            </div>

            <Field label="Major / program">
              <select
                value={major}
                onChange={(event) => setMajor(event.target.value)}
                className={controlClass}
              >
                {MAJORS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="Expected graduation">
              <select
                value={gradTerm}
                onChange={(event) => setGradTerm(event.target.value)}
                className={controlClass}
              >
                {GRAD_TERMS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>

            <div className="col-span-2" data-tour="goal">
              <Field
                label="Where do you want to end up?"
                hint="Streetcar weights your course and alumni matches toward this goal. You can change it any time."
              >
                <select
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  className={controlClass}
                >
                  {CAREER_GOALS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="col-span-2">
              <Field
                label={
                  <>
                    Anything Streetcar should weigh{" "}
                    <span className="font-normal text-muted-ink-2">(optional)</span>
                  </>
                }
              >
                <input
                  type="text"
                  value={focus}
                  onChange={(event) => setFocus(event.target.value)}
                  placeholder="e.g. NYC only — and I need to understand the cost of living math"
                  className={controlClass}
                />
              </Field>
            </div>

            <div
              data-tour="consent"
              className="col-span-2 flex items-start gap-3 rounded-[10px] border border-hairline bg-[#fafafa] p-4"
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] bg-[#2563eb]">
                <Check className="size-3 text-white" strokeWidth={3} />
              </span>
              <div className="flex-1 text-[12.5px] leading-relaxed">
                <p className="font-semibold text-ink">
                  I authorize Streetcar to read my degree audit under the FERPA
                  School-Official Authorization.
                </p>
                <p className="mt-1 text-muted-ink">
                  Streetcar logs every lookup to the audit trail. Every view is
                  attributable.
                </p>
                <div className="mt-2">
                  <FerpaDialog />
                </div>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-between gap-4 border-t border-hairline pt-5">
              <span className="flex items-center gap-1.5 text-[12px] text-muted-ink">
                <ShieldCheck className="size-4 text-mint" />
                Read-only. No data leaves Tulane systems.
              </span>
              <Button
                type="submit"
                className="h-9 rounded-lg bg-ink text-[13px] font-medium hover:bg-ink-2"
              >
                Pull my transcript
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </div>
        <DemoGuide key="profile" steps={PROFILE_STEPS} intro />
      </div>
    );
  }

  /* ---------------- Phase 2: transcript + what happens next ---------------- */
  if (phase === "transcript") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
        <div className="grid w-full max-w-[1080px] gap-6 md:grid-cols-[1.15fr_1fr]">
          {/* Transcript streaming in */}
          <div data-tour="transcript" className="rounded-[10px] border border-hairline bg-surface p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
                  Registrar · degree audit
                </div>
                <h2 className="mt-1.5 text-[18px] font-semibold tracking-[-0.015em] text-ink">
                  {student?.name ?? session.displayName}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-[19px] font-semibold text-ink tnum">
                  {credits.toFixed(0)}
                </div>
                <div className="text-[11px] text-muted-ink-2">credits read</div>
              </div>
            </div>

            <div className="mt-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    <th className="pb-2 text-[10.5px] font-medium tracking-wide text-muted-ink-2 uppercase">
                      Term
                    </th>
                    <th className="pb-2 text-[10.5px] font-medium tracking-wide text-muted-ink-2 uppercase">
                      Course
                    </th>
                    <th className="pb-2 text-right text-[10.5px] font-medium tracking-wide text-muted-ink-2 uppercase">
                      Cr
                    </th>
                    <th className="pb-2 text-right text-[10.5px] font-medium tracking-wide text-muted-ink-2 uppercase">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((entry) => (
                    <tr
                      key={entry.code}
                      className="animate-in fade-in slide-in-from-bottom-1 border-b border-hairline duration-300 last:border-0"
                    >
                      <td className="py-1.5 text-[11.5px] whitespace-nowrap text-muted-ink-2">
                        {entry.term}
                      </td>
                      <td className="py-1.5">
                        <div className="text-[12.5px] font-medium text-ink">{entry.code}</div>
                        <div className="text-[11.5px] text-muted-ink">{entry.title}</div>
                      </td>
                      <td className="py-1.5 text-right text-[12px] text-muted-ink tnum">
                        {entry.credits}
                      </td>
                      <td className="py-1.5 text-right text-[12.5px] font-semibold text-ink tnum">
                        {entry.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!transcriptDone && (
                <div className="flex items-center gap-2 py-3 text-[12px] text-muted-ink">
                  <Loader2 className="size-3.5 animate-spin" />
                  Reading your record…
                </div>
              )}
            </div>
          </div>

          {/* What happens once you sign in with the fingerprint */}
          <div data-tour="promises" className="rounded-[10px] border border-hairline bg-surface p-6">
            <div className="text-[10.5px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
              What happens next
            </div>
            <h2 className="mt-1.5 text-[18px] leading-snug font-semibold tracking-[-0.015em] text-ink">
              Once your fingerprint is live, this stays current on its own.
            </h2>

            <ul className="mt-5 flex flex-col gap-4">
              {PROMISES.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-hairline bg-canvas">
                    <item.icon className="size-3.5 text-burgundy" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-ink">{item.title}</h3>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted-ink">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-hairline pt-5">
              <Button
                onClick={() => setPhase("scan")}
                disabled={!transcriptDone}
                className="h-9 w-full rounded-lg bg-ink text-[13px] font-medium hover:bg-ink-2"
              >
                {transcriptDone ? (
                  <>
                    Build my fingerprint
                    <ArrowRight className="size-4" />
                  </>
                ) : (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Reading your record
                  </>
                )}
              </Button>
              <p className="mt-3 text-[11.5px] text-muted-ink-2">
                You control what is shared. Revoke access any time in Settings.
              </p>
            </div>
          </div>
        </div>
        <DemoGuide key="transcript" steps={TRANSCRIPT_STEPS} />
      </div>
    );
  }

  /* ---------------- Phase 3 & 4: fingerprint scan and reveal ---------------- */
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 py-12">
      <div className="w-full max-w-[860px]">
        <div className="text-[15px] font-semibold tracking-[-0.01em] text-white">
          Streetcar
        </div>

        <div className="mt-10 grid items-center gap-12 md:grid-cols-[300px_1fr]">
          <div data-tour="fingerprint" className="relative mx-auto size-[300px]">
            <img
              src={fingerprint}
              alt="Career fingerprint"
              className={cn(
                "size-full rounded-full object-cover transition-all duration-[1200ms]",
                scanComplete ? "opacity-100 saturate-100" : "opacity-70 saturate-50",
              )}
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
            {!scanComplete && (
              <div
                className="absolute inset-x-0 h-px bg-brass shadow-[0_0_18px_4px_rgba(184,147,90,0.55)]"
                style={{
                  top: `${(stage / STAGES.length) * 100}%`,
                  transition: "top 850ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            )}
          </div>

          <div>
            <div className="text-[11px] font-medium tracking-[0.14em] text-brass uppercase">
              {scanComplete ? "Fingerprint complete" : "Building your fingerprint"}
            </div>
            <h1 className="mt-3.5 text-[34px] leading-[1.12] font-semibold tracking-[-0.02em] text-white">
              {scanComplete ? (
                <>
                  {session?.displayName?.split(" ")[0] ?? "Morgan"}, your strongest path
                  <br />
                  is <span className="text-brass">{student?.targetRole ?? "Investment Banker"}</span>.
                </>
              ) : (
                <>
                  Hold still, {session?.displayName?.split(" ")[0] ?? "there"}.
                  <br />
                  This takes a moment.
                </>
              )}
            </h1>

            <ul className="mt-8 flex flex-col gap-3">
              {STAGES.map((item, index) => {
                const done = index < stage;
                const active = index === stage;
                return (
                  <li
                    key={item.label}
                    className={cn(
                      "flex items-center gap-3 text-[13.5px] transition-opacity duration-500",
                      done || active ? "opacity-100" : "opacity-30",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border",
                        done ? "border-mint bg-mint text-ink" : "border-white/25 text-white/40",
                      )}
                    >
                      {done ? (
                        <Check className="size-3" strokeWidth={3} />
                      ) : active ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : null}
                    </span>
                    <span className="text-white/85">{item.label}</span>
                    <span className="ml-auto text-[12px] text-white/35 tnum">
                      {done || active ? item.detail : ""}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-9 h-9">
              {scanComplete && (
                <Button
                  onClick={handleContinue}
                  disabled={pending}
                  className="h-9 rounded-lg bg-white text-[13.5px] font-medium text-ink hover:bg-white/90"
                >
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Opening your path
                    </>
                  ) : (
                    <>
                      Continue to my path
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-12 text-[11.5px] text-white/30">
          Streetcar reads only what you opted in to share under the FERPA School-Official
          Authorization. Every view is attributable.
        </p>
      </div>
      <DemoGuide key="scan" steps={SCAN_STEPS} tone="dark" />
    </div>
  );
}
