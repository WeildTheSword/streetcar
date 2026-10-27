import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ROW_MS, useTranscriptReveal } from "./useTranscriptReveal";

const TRANSCRIPT = [
  { code: "ACCN 2010", credits: 3 },
  { code: "CMPS 1500", credits: 4 },
];

async function advance(ms) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("useTranscriptReveal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("an empty transcript is never reported as done", async () => {
    // Arrange
    const { result } = renderHook(() =>
      useTranscriptReveal({ transcript: [], streaming: true, scanning: false, stageCount: 4 }),
    );

    // Act
    await advance(ROW_MS * 5);

    // Assert
    expect(result.current.shown).toEqual([]);
    expect(result.current.transcriptDone).toBe(false);
  });

  test("rows stop streaming when streaming turns off, and keep what was shown", async () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ streaming }) =>
        useTranscriptReveal({ transcript: TRANSCRIPT, streaming, scanning: false, stageCount: 4 }),
      { initialProps: { streaming: true } },
    );
    await advance(ROW_MS);

    // Act
    rerender({ streaming: false });
    await advance(ROW_MS * 5);

    // Assert
    expect(result.current.shown).toEqual([TRANSCRIPT[0]]);
    expect(result.current.credits).toBe(3);
    expect(result.current.transcriptDone).toBe(false);
    expect(result.current.stage).toBe(0);
  });
});
