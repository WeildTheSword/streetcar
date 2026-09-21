import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { useStageTransition } from "@/transition/useStageTransition";
import { cn } from "@/lib/utils";

const HOLD_MS = 3400;

/**
 * Shown once, straight after an account is created: their name, large, over a
 * New Orleans night ground. Auto-continues so a presenter never has to click,
 * but the button is there to move early.
 */
export function WelcomePage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { run } = useStageTransition();
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const firstName = session?.displayName?.trim().split(/\s+/)[0] ?? "there";
  const advisor = session?.role === "ADVISOR";

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => continueOn(), HOLD_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function continueOn() {
    if (leaving) return;
    setLeaving(true);
    await run(advisor ? "Opening your console" : "Building your fingerprint", () => {
      navigate(advisor ? "/advisor" : "/onboarding", { replace: true });
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6">
      {/* Night ground */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #4A1F5C 0%, #2E1338 48%, #140B06 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(232,197,71,0.16) 0%, transparent 62%)",
        }}
      />
      {SPARKS.map((spark) => (
        <span
          key={`${spark.left}-${spark.top}`}
          aria-hidden
          className="absolute size-[5px] rounded-full"
          style={{
            left: `${spark.left}%`,
            top: `${spark.top}%`,
            background: spark.color,
            opacity: entered ? 0.6 : 0,
            transform: entered ? "translateY(0)" : "translateY(14px)",
            transition: `opacity 900ms ease ${spark.delay}ms, transform 1100ms cubic-bezier(0.16,1,0.3,1) ${spark.delay}ms`,
          }}
        />
      ))}

      <div className="relative text-center">
        <div
          className={cn("flex items-center justify-center gap-1.5 transition-all duration-700")}
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0)" : "translateY(10px)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span className="h-0.5 w-7 rounded-full bg-[#8E55A6]" />
          <span className="h-0.5 w-7 rounded-full bg-[#5A9368]" />
          <span className="h-0.5 w-7 rounded-full bg-[#E8C547]" />
        </div>

        <p
          className="mt-6 text-[11px] font-medium tracking-[0.18em] text-brass uppercase transition-all duration-700"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0)" : "translateY(12px)",
            transitionDelay: "120ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          Account created
        </p>

        {/* Name blurs in, word by word */}
        <h1 className="mt-4 flex flex-wrap items-baseline justify-center gap-x-4 text-[54px] leading-[1.05] font-semibold tracking-[-0.03em] text-white">
          {["Welcome,", `${firstName}.`].map((word, index) => (
            <span
              key={word}
              className="inline-block transition-all duration-[900ms]"
              style={{
                opacity: entered ? 1 : 0,
                filter: entered ? "blur(0px)" : "blur(14px)",
                transform: entered ? "translateY(0)" : "translateY(18px)",
                transitionDelay: `${240 + index * 160}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                color: index === 1 ? "#E8C547" : undefined,
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        <p
          className="mx-auto mt-5 max-w-[460px] text-[15px] leading-relaxed text-white/55 transition-all duration-700"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0)" : "translateY(12px)",
            transitionDelay: "620ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {advisor
            ? "Your console is ready. Your caseload, assembled pre-briefs, and the alumni radar are waiting."
            : "Next we'll read your degree audit and build your career fingerprint. It takes about a minute."}
        </p>

        <div
          className="mt-10 transition-all duration-700"
          style={{
            opacity: entered ? 1 : 0,
            transitionDelay: "820ms",
          }}
        >
          <Button
            onClick={continueOn}
            className="h-10 rounded-lg bg-white px-5 text-[13.5px] font-medium text-ink hover:bg-white/90"
          >
            {advisor ? "Open my console" : "Build my fingerprint"}
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Auto-advance indicator */}
        <div className="mx-auto mt-8 h-px w-[220px] overflow-hidden bg-white/12">
          <div
            className="h-full bg-brass"
            style={{
              width: entered ? "100%" : "0%",
              transition: `width ${HOLD_MS}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

const SPARKS = [
  { left: 12, top: 22, color: "#8E55A6", delay: 120 },
  { left: 24, top: 68, color: "#E8C547", delay: 300 },
  { left: 33, top: 16, color: "#5A9368", delay: 200 },
  { left: 68, top: 24, color: "#E8C547", delay: 420 },
  { left: 77, top: 70, color: "#8E55A6", delay: 260 },
  { left: 88, top: 34, color: "#5A9368", delay: 360 },
  { left: 8, top: 78, color: "#E8C547", delay: 480 },
  { left: 92, top: 62, color: "#8E55A6", delay: 160 },
];
