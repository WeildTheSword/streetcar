import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { WaveGuide } from "@/components/WaveGuide";
import { cn } from "@/lib/utils";

const CARD_WIDTH = 380;
const INTRO_KEY = "streetcar.guideIntroduced";

const INTRO_STEP = {
  title: "Hey — I'm the Wave",
  body: "I'll walk you through Streetcar one piece at a time. I'll point at whatever I'm talking about, so just hit Next when you're ready. Close me with the × any time.",
  intro: true,
};

function alreadyIntroduced() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroduced() {
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    // A blocked storage API just means he introduces himself again.
  }
}
const GAP = 18;
const EDGE = 24;

/**
 * Guided walkthrough.
 *
 * Each step may name a `target`, matched against `[data-tour="<target>"]`. The
 * targeted element is spotlit — everything else dims — and this card moves to
 * sit beside it. Steps without a target park the card in the bottom-left.
 *
 * Advancing is manual: the reader clicks Next.
 */
export function DemoGuide({ steps: rawSteps, tone = "light", intro = false }) {
  // The Wave introduces himself once per demo run, on the first screen that asks.
  const [withIntro] = useState(() => intro && !alreadyIntroduced());
  const steps = withIntro ? [INTRO_STEP, ...(rawSteps ?? [])] : rawSteps;

  useEffect(() => {
    if (withIntro) markIntroduced();
  }, [withIntro]);

  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [rect, setRect] = useState(null);
  const cardRef = useRef(null);
  const [cardHeight, setCardHeight] = useState(210);

  const step = steps?.[Math.min(index, (steps?.length ?? 1) - 1)];
  const target = step?.target;

  const measure = useCallback(() => {
    if (!target) {
      setRect(null);
      return;
    }
    const node = document.querySelector(`[data-tour="${target}"]`);
    setRect(node ? node.getBoundingClientRect() : null);
  }, [target]);

  // Bring the target into view, then track it while the reader scrolls.
  useLayoutEffect(() => {
    if (dismissed) return undefined;
    const node = target ? document.querySelector(`[data-tour="${target}"]`) : null;
    node?.scrollIntoView({ behavior: "smooth", block: "center" });

    // Measuring layout is exactly the "synchronise with an external system"
    // case this rule exempts — the DOM rect cannot be derived during render.
    // oxlint-disable-next-line react/set-state-in-effect
    measure();
    const settle = setTimeout(measure, 420);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure, target, dismissed]);

  useEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [index, dismissed]);

  if (dismissed || !steps?.length || !step) return null;

  const isLast = index >= steps.length - 1;
  const dark = tone === "dark";

  // Park bottom-left when nothing is targeted; otherwise sit beside the target.
  let placement = { left: EDGE, top: window.innerHeight - cardHeight - EDGE };
  if (rect) {
    const below = rect.bottom + GAP;
    const above = rect.top - cardHeight - GAP;
    placement.top =
      below + cardHeight + EDGE < window.innerHeight
        ? below
        : above > EDGE
          ? above
          : Math.max(EDGE, window.innerHeight - cardHeight - EDGE);
    placement.left = Math.min(
      Math.max(rect.left, EDGE),
      Math.max(EDGE, window.innerWidth - CARD_WIDTH - EDGE),
    );
  }

  return (
    <>
      {/* Spotlight: one element dims the whole page except the target. */}
      {rect && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-40 rounded-[12px] transition-all duration-300"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(9,10,12,0.55)",
            outline: "2px solid #4A9FE0",
            outlineOffset: "0px",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      )}
      {rect && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-40 rounded-[12px] transition-all duration-300"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 4px rgba(74,159,224,0.28), 0 0 34px 6px rgba(74,159,224,0.35)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      )}

      <div
        ref={cardRef}
        className={cn(
          "fixed z-50 rounded-[10px] border py-4 pr-4 pl-[74px] shadow-[0_18px_50px_rgba(0,0,0,0.28)]",
          "transition-all duration-300",
          dark ? "border-white/15 bg-[#1B1A19]" : "border-hairline bg-surface",
        )}
        style={{
          width: CARD_WIDTH,
          top: placement.top,
          left: placement.left,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <Mascot key={index} large={step.intro} />

        <div className="flex">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn("text-[13px] font-semibold", dark ? "text-white" : "text-ink")}>
                {step.title}
              </h3>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Skip walkthrough"
                className={cn(
                  "-mt-0.5 -mr-0.5 rounded p-1 transition-colors",
                  dark
                    ? "text-white/40 hover:bg-white/10 hover:text-white"
                    : "text-muted-ink-2 hover:bg-hairline hover:text-ink",
                )}
              >
                <X className="size-3.5" />
              </button>
            </div>

            <p
              className={cn(
                "mt-1 text-[12.5px] leading-relaxed",
                dark ? "text-white/65" : "text-muted-ink",
              )}
            >
              {step.body}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {steps.map((item, dotIndex) => (
                  <span
                    key={item.title}
                    className={cn(
                      "size-1.5 rounded-full transition-colors",
                      dotIndex === index
                        ? "bg-[#4A9FE0]"
                        : dark
                          ? "bg-white/20"
                          : "bg-hairline-strong",
                    )}
                  />
                ))}
              </div>

              <span
                className={cn(
                  "ml-1 text-[11px] tnum",
                  dark ? "text-white/35" : "text-muted-ink-2",
                )}
              >
                {index + 1} of {steps.length}
              </span>

              <div className="ml-auto flex items-center gap-1.5">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => setIndex((current) => current - 1)}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium transition-colors",
                      dark
                        ? "text-white/60 hover:bg-white/10 hover:text-white"
                        : "text-muted-ink hover:bg-hairline hover:text-ink",
                    )}
                  >
                    <ArrowLeft className="size-3" />
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    isLast ? setDismissed(true) : setIndex((current) => current + 1)
                  }
                  className="flex items-center gap-1 rounded-md bg-[#4A9FE0] px-2.5 py-1 text-[12px] font-medium text-white transition-colors hover:bg-[#3B8FD0]"
                >
                  {isLast ? "Got it" : "Next"}
                  {!isLast && <ArrowRight className="size-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * The Tulane Angry Wave if it has been dropped at public/mascot.png, otherwise
 * the original wave character. Loaded at runtime so a missing file cannot break
 * the build — see public/README-mascot.txt.
 */
function Mascot({ large = false }) {
  const [failed, setFailed] = useState(false);
  // The Angry Wave is a wide mark (248x178), so the box follows its aspect
  // rather than forcing it into a square where it would render small.
  const width = large ? 132 : 108;
  const height = Math.round(width * 0.72);

  // Keyed by step index at the call site, so this replays on every new sentence.
  return (
    <>
      <span
        className="pointer-events-none absolute -top-9 -left-9 z-10 animate-[sc-talk_680ms_cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width,
          height,
          transformOrigin: "60% 85%",
          // Grounds him in front of the bubble rather than pasted on it.
          filter:
            "drop-shadow(0 10px 14px rgba(9,10,12,0.32)) drop-shadow(0 2px 3px rgba(9,10,12,0.24))",
        }}
      >
        {failed ? (
          <WaveGuide className="size-full" />
        ) : (
          <img
            src="/mascot.svg"
            alt=""
            onError={() => setFailed(true)}
            className="size-full object-contain"
          />
        )}
      </span>
      <style>{`
        @keyframes sc-talk {
          0%   { transform: rotate(0deg)    translateY(0)    scale(1); }
          16%  { transform: rotate(-7deg)   translateY(-4px) scale(1.07); }
          34%  { transform: rotate(6deg)    translateY(0)    scale(0.97); }
          52%  { transform: rotate(-4deg)   translateY(-2px) scale(1.04); }
          70%  { transform: rotate(2.5deg)  translateY(0)    scale(1); }
          86%  { transform: rotate(-1.2deg) translateY(-1px) scale(1.01); }
          100% { transform: rotate(0deg)    translateY(0)    scale(1); }
        }
      `}</style>
    </>
  );
}

