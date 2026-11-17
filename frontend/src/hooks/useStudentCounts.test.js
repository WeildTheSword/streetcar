import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useStudentCounts } from "./useStudentCounts";
import { fetchSummary } from "@/services/studentService";

vi.mock("@/services/studentService");

describe("useStudentCounts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("holds the summary once it loads, and re-reads it on refresh", async () => {
    // Arrange
    fetchSummary
      .mockResolvedValueOnce({ alumni: 1, appointments: 0, applications: 2 })
      .mockResolvedValueOnce({ alumni: 1, appointments: 0, applications: 3 });
    const { result } = renderHook(() => useStudentCounts());
    await waitFor(() => expect(result.current.counts?.applications).toBe(2));

    // Act
    act(() => result.current.refresh());

    // Assert
    await waitFor(() => expect(result.current.counts?.applications).toBe(3));
  });

  test("stays undefined after a failure, and never asks when disabled", async () => {
    // Arrange
    fetchSummary.mockRejectedValue(new Error("Forbidden"));

    // Act
    const failed = renderHook(() => useStudentCounts());
    const disabled = renderHook(() => useStudentCounts(false));

    // Assert
    await waitFor(() => expect(fetchSummary).toHaveBeenCalledTimes(1));
    expect(failed.result.current.counts).toBeUndefined();
    expect(disabled.result.current.counts).toBeUndefined();
  });
});
