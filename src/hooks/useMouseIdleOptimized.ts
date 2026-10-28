"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export const useMouseIdleOptimized = (
  delay: number = 500,
  idleThreshold: number = 30
) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const lastPosition = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);
  const isIdleRef = useRef(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Calculate distance
      const distance = Math.sqrt(
        Math.pow(x - lastPosition.current.x, 2) +
          Math.pow(y - lastPosition.current.y, 2)
      );

      if (distance > idleThreshold) {
        lastPosition.current = { x, y };

        if (isIdleRef.current) {
          isIdleRef.current = false;

          if (rafId.current === null) {
            rafId.current = requestAnimationFrame(() => {
              setIsIdle(false);
              rafId.current = null;
            });
          }
        }

        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }

        timeoutId.current = setTimeout(() => {
          isIdleRef.current = true;
          setIsIdle(true);
        }, delay);
      }
    },
    [delay, idleThreshold]
  );

  useEffect(() => {
    // Use capture-phase to avoid components calling stopPropagation() preventing idle detection.
    const useCapture = true;
    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
      capture: useCapture,
    });

    // Set initial timeout
    timeoutId.current = setTimeout(() => {
      isIdleRef.current = true;
      setIsIdle(true);
    }, delay);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove, useCapture);
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleMouseMove, delay]);

  return isIdle;
};
