import { useEffect, useState } from "react";

export const ROW_MS = 130;
export const STAGE_MS = 850;

/**
 * The onboarding page's animated reveal: transcript rows stream in one at a time
 * while `streaming` is true, then the fingerprint scan steps through `stageCount`
 * stages while `scanning` is true. Each step schedules the next from an effect, so
 * the reveal pauses (and keeps its progress) whenever its flag goes false.
 *
 * @param {object} options
 * @param {Array<{credits: number}>} options.transcript rows to reveal, in order
 * @param {boolean} options.streaming whether rows should be streaming in
 * @param {boolean} options.scanning whether the scan stages should be advancing
 * @param {number} options.stageCount how many scan stages there are
 */
export function useTranscriptReveal({ transcript, streaming, scanning, stageCount }) {
  const [rows, setRows] = useState(0);
  const [stage, setStage] = useState(0);

  // Stream transcript rows in once the record is pulled.
  useEffect(() => {
    if (!streaming || rows >= transcript.length) return undefined;
    const timer = setTimeout(() => setRows((current) => current + 1), ROW_MS);
    return () => clearTimeout(timer);
  }, [streaming, rows, transcript.length]);

  useEffect(() => {
    if (!scanning || stage >= stageCount) return undefined;
    const timer = setTimeout(() => setStage((current) => current + 1), STAGE_MS);
    return () => clearTimeout(timer);
  }, [scanning, stage, stageCount]);

  const shown = transcript.slice(0, rows);
  const credits = shown.reduce((total, entry) => total + entry.credits, 0);
  const transcriptDone = transcript.length > 0 && rows >= transcript.length;
  const scanComplete = stage >= stageCount;

  return { shown, credits, transcriptDone, stage, scanComplete };
}
