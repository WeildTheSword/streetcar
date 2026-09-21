import { useContext } from "react";
import { TransitionContext } from "@/transition/transitionContext";

export function useStageTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useStageTransition must be used inside TransitionProvider");
  }
  return context;
}
