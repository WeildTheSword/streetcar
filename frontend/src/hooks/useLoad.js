import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs `load` once on mount, and again when `reload` is called. `data` is null
 * while loading; `error` is the failure's message. `setData` lets a page update
 * what it loaded after a create, edit or delete.
 */
export function useLoad(load) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  // The latest `load`, so a page can pass a fresh closure on every render.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => loadRef.current())
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err?.message || "Something went wrong. Please try again."));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setData(null);
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { data, error, setData, reload };
}
