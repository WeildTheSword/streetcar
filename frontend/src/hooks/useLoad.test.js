import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useLoad } from "./useLoad";

describe("useLoad", () => {
  test("starts empty, then holds what the loader resolved", async () => {
    // Arrange
    const load = vi.fn().mockResolvedValue(["row"]);

    // Act
    const { result } = renderHook(() => useLoad(load));

    // Assert
    expect(result.current.data).toBeNull();
    await waitFor(() => expect(result.current.data).toEqual(["row"]));
    expect(result.current.error).toBeNull();
    expect(load).toHaveBeenCalledTimes(1);
  });

  test("a failure becomes its message, and reload tries again", async () => {
    // Arrange
    const load = vi.fn().mockRejectedValueOnce(new Error("Server down.")).mockResolvedValue("ok");
    const { result } = renderHook(() => useLoad(load));
    await waitFor(() => expect(result.current.error).toBe("Server down."));

    // Act
    act(() => result.current.reload());

    // Assert
    expect(result.current.error).toBeNull();
    await waitFor(() => expect(result.current.data).toBe("ok"));
    expect(load).toHaveBeenCalledTimes(2);
  });

  test("setData replaces what was loaded", async () => {
    // Arrange
    const { result } = renderHook(() => useLoad(() => Promise.resolve([1])));
    await waitFor(() => expect(result.current.data).toEqual([1]));

    // Act
    act(() => result.current.setData((previous) => [...previous, 2]));

    // Assert
    expect(result.current.data).toEqual([1, 2]);
  });
});
