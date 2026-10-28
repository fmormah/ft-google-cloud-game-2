"use client";

import { useCallback, useRef } from "react";
import { debugWarn } from "@/utils/log";

interface UseRateLimitOptions {
  limit: number; // Maximum calls allowed within the time window
  windowMs: number; // Time window in milliseconds
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  options: UseRateLimitOptions
): T {
  const { limit, windowMs } = options;
  const callTimesRef = useRef<number[]>([]);

  const rateLimitedFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      callTimesRef.current = callTimesRef.current.filter(
        (time) => now - time < windowMs
      );

      if (callTimesRef.current.length >= limit) {
        debugWarn("Rate limit exceeded, call ignored");
        return;
      }

      callTimesRef.current.push(now);

      return fn(...args);
    },
    [fn, limit, windowMs]
  );

  return rateLimitedFn as T;
}

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delayMs);
    },
    [fn, delayMs]
  );

  return debouncedFn as T;
}
