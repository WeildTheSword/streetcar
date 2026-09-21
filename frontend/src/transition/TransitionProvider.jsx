import { useCallback, useMemo, useRef, useState } from "react";
import { StageTransition } from "@/components/StageTransition";
import { TransitionContext } from "@/transition/transitionContext";

const COVER_MS = 620;
const HOLD_MS = 620;
const REVEAL_MS = 640;

/**
 * Drives the between-stage curtain.
 *
 * `run(label, action)` covers the screen, invokes `action` while it is covered
 * so the next stage mounts unseen, then reveals. Awaiting it resolves once the
 * curtain is fully out of the way.
 */
export function TransitionProvider({ children }) {
  const [phase, setPhase] = useState("idle");
  const [label, setLabel] = useState("");
  const busy = useRef(false);

  const run = useCallback(async (nextLabel, action) => {
    if (busy.current) return;
    busy.current = true;
    setLabel(nextLabel);
    setPhase("cover");
    await wait(COVER_MS);

    setPhase("hold");
    try {
      await action?.();
    } finally {
      await wait(HOLD_MS);
      setPhase("reveal");
      await wait(REVEAL_MS);
      setPhase("idle");
      busy.current = false;
    }
  }, []);

  const value = useMemo(() => ({ run }), [run]);

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <StageTransition phase={phase} label={label} />
    </TransitionContext.Provider>
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
