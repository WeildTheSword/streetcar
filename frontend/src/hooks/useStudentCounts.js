import { useCallback, useEffect, useState } from "react";
import { fetchSummary } from "@/services/studentService";

/**
 * The student sidebar's badge counts from GET /me/summary. `counts` stays
 * undefined until it loads, and after a failure, so the badges are left off
 * rather than showing a wrong number. `refresh` re-reads it after a change.
 * Pass `enabled = false` for a page another role can see, so it never asks.
 */
export function useStudentCounts(enabled = true) {
  const [counts, setCounts] = useState(undefined);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const summary = await fetchSummary();
        if (!cancelled && summary) setCounts(summary);
      } catch {
        // The badges are a nicety; the page itself reports its own errors.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, attempt]);

  const refresh = useCallback(() => setAttempt((n) => n + 1), []);

  return { counts, refresh };
}
