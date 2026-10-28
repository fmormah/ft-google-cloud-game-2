import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRateLimit } from "./useRateLimit";

describe("useRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should execute function within rate limit", () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() =>
      useRateLimit(mockFn, { limit: 2, windowMs: 1000 })
    );

    act(() => {
      result.current("arg1", "arg2");
    });

    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should limit function calls within time window", () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() =>
      useRateLimit(mockFn, { limit: 2, windowMs: 1000 })
    );
    act(() => {
      result.current();
      result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
    act(() => {
      result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("should reset limit after time window", () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() =>
      useRateLimit(mockFn, { limit: 1, windowMs: 1000 })
    );
    act(() => {
      result.current();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);
    act(() => {
      result.current();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(1001);
    });
    act(() => {
      result.current();
    });
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("should handle different configurations", () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() =>
      useRateLimit(mockFn, { limit: 3, windowMs: 500 })
    );
    act(() => {
      result.current();
      result.current();
      result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(3);
    act(() => {
      result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it("should return the same function reference", () => {
    const mockFn = vi.fn();
    const { result, rerender } = renderHook(() =>
      useRateLimit(mockFn, { limit: 2, windowMs: 1000 })
    );

    const firstRef = result.current;
    rerender();

    expect(result.current).toBe(firstRef);
  });
});
