"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface MousePosition {
  x: number;
  y: number;
}

interface UseMousePositionOptions {
  // Use RAF to throttle updates to screen refresh rate
  useRAF?: boolean;
  // Optional throttle delay in ms (alternative to RAF)
  throttleMs?: number;
  // Use direct DOM manipulation for cursor element
  directDOM?: boolean;
  // Selector or ref for the cursor element when using direct DOM
  cursorElementRef?: React.RefObject<HTMLElement>;
}

export const useMousePositionOptimized = (
  options: UseMousePositionOptions = {}
) => {
  const {
    useRAF = true,
    throttleMs,
    directDOM = false,
    cursorElementRef,
  } = options;

  const [position, setPosition] = useState<MousePosition>({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const pendingPosition = useRef<MousePosition>({ x: -100, y: -100 });

  const updatePosition = useCallback(
    (x: number, y: number) => {
      if (directDOM && cursorElementRef?.current) {
        // Direct DOM manipulation - bypass React reconciliation
        const element = cursorElementRef.current;
        element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      } else {
        setPosition({ x, y });
      }
    },
    [directDOM, cursorElementRef]
  );

  useEffect(() => {
    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };

      if (useRAF && !throttleMs) {
        // Use RequestAnimationFrame for smooth 60fps updates
        pendingPosition.current = newPosition;

        if (rafId.current === null) {
          rafId.current = requestAnimationFrame(() => {
            updatePosition(
              pendingPosition.current.x,
              pendingPosition.current.y
            );
            rafId.current = null;
          });
        }
      } else if (throttleMs) {
        // Use time-based throttling
        const now = Date.now();
        if (now - lastUpdateTime.current >= throttleMs) {
          updatePosition(newPosition.x, newPosition.y);
          lastUpdateTime.current = now;
        } else if (!throttleTimeout) {
          // Schedule an update for the remaining time
          throttleTimeout = setTimeout(
            () => {
              updatePosition(newPosition.x, newPosition.y);
              lastUpdateTime.current = Date.now();
              throttleTimeout = null;
            },
            throttleMs - (now - lastUpdateTime.current)
          );
        }
      } else {
        // No throttling (not recommended)
        updatePosition(newPosition.x, newPosition.y);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [useRAF, throttleMs, updatePosition]);

  return position;
};
