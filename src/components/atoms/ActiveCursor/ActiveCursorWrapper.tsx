"use client";

import React, { useEffect, useRef, useState } from "react";
import ActiveCursorOptimized, {
  type ActiveCursorOptimizedRef,
} from "./ActiveCursorOptimized";
import { useCursor } from "@/contexts/CursorContext";
import { useMouseIdleOptimized } from "@/hooks/useMouseIdleOptimized";
import { useIsTablet } from "@/hooks/useDevice";
import styles from "./ActiveCursor.module.scss";

type LastPointerEvent = {
  x: number;
  y: number;
  target: EventTarget | null;
};

// Persist last known pointer position across unmounts/remounts so the cursor doesn't
// reset off-screen (e.g. when isVisible toggles during transitions/restarts).
let lastKnownPointerEvent: LastPointerEvent | null = null;

interface ActiveCursorWrapperProps {
  isVisible?: boolean;
  invertColors?: boolean;
  hideOnIdle?: boolean;
  /**
   * Hide the cursor on tablets (e.g. iPad), where a mouse-style cursor is misleading.
   * Defaults to false.
   */
  hideOnTablet?: boolean;
}

const ActiveCursorWrapper: React.FC<ActiveCursorWrapperProps> = ({
  isVisible = true,
  invertColors = false,
  hideOnIdle = false,
  hideOnTablet = false,
}) => {
  const baseCursorRef = useRef<ActiveCursorOptimizedRef>(null);
  const labelCursorRef = useRef<ActiveCursorOptimizedRef>(null);
  const { mode, label } = useCursor();
  const isMouseIdle = useMouseIdleOptimized(500, 30);
  const isTablet = useIsTablet();
  const rafId = useRef<number | null>(null);
  const lastEventRef = useRef<{
    x: number;
    y: number;
    target: EventTarget | null;
  } | null>(null);
  const [isOverHoverExempt, setIsOverHoverExempt] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const win: Window | null = typeof window === "undefined" ? null : window;
    if (!win) return;

    // Use capture-phase listeners so scene-level handlers can't starve us by calling
    // stopPropagation() during transitions/gestures.
    const useCapture = true;

    const scheduleUpdate = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        const latest = lastEventRef.current;
        if (latest) {
          baseCursorRef.current?.updatePosition(latest.x, latest.y);
          labelCursorRef.current?.updatePosition(latest.x, latest.y);
          const target = latest.target as HTMLElement | null;
          const overHoverExempt = !!target?.closest?.(
            "[data-infocard], [data-holodisplay]"
          );
          setIsOverHoverExempt(overHoverExempt);
        }
        rafId.current = null;
      });
    };

    const setFromPointer = (x: number, y: number, target: EventTarget | null) => {
      const next = { x, y, target };
      lastEventRef.current = next;
      lastKnownPointerEvent = next;
      scheduleUpdate();
    };

    // Initialize from the last known pointer position (covers remounts where the user
    // hasn't moved the mouse yet).
    if (lastKnownPointerEvent) {
      lastEventRef.current = lastKnownPointerEvent;
      scheduleUpdate();
    }

    const handlePointerMove = (e: PointerEvent) =>
      setFromPointer(e.clientX, e.clientY, e.target);
    const handlePointerDown = (e: PointerEvent) =>
      setFromPointer(e.clientX, e.clientY, e.target);

    const handleMouseMove = (e: MouseEvent) =>
      setFromPointer(e.clientX, e.clientY, e.target);
    const handleMouseDown = (e: MouseEvent) =>
      setFromPointer(e.clientX, e.clientY, e.target);

    // Always listen to mouse events as a fallback. On some platforms, pointer events
    // can be interrupted during transitions/gestures; mouse events help recover.
    win.addEventListener("mousemove", handleMouseMove, {
      passive: true,
      capture: useCapture,
    });
    win.addEventListener("mousedown", handleMouseDown, {
      passive: true,
      capture: useCapture,
    });

    // Pointer events cover mouse + pen; listen to them too when available.
    if ("PointerEvent" in win) {
      win.addEventListener("pointermove", handlePointerMove, {
        passive: true,
        capture: useCapture,
      });
      win.addEventListener("pointerdown", handlePointerDown, {
        passive: true,
        capture: useCapture,
      });
    }

    return () => {
      win.removeEventListener("mousemove", handleMouseMove, useCapture);
      win.removeEventListener("mousedown", handleMouseDown, useCapture);
      if ("PointerEvent" in win) {
        win.removeEventListener("pointermove", handlePointerMove, useCapture);
        win.removeEventListener("pointerdown", handlePointerDown, useCapture);
      }
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;
  if (hideOnTablet && isTablet) return null;

  const stationaryMode = mode === "stationary" && isMouseIdle;
  const hoverMode = mode === "hover" && isMouseIdle && !isOverHoverExempt;
  const opacity = hideOnIdle && isMouseIdle ? 0 : 1;
  const transition = hideOnIdle ? "opacity 200ms ease" : undefined;

  return (
    <>
      {/* Base cursor: current visuals, but never show a label */}
      <ActiveCursorOptimized
        ref={baseCursorRef}
        stationaryMode={stationaryMode}
        hoverMode={hoverMode}
        label={label}
        invertColors={invertColors}
        className={styles["ActiveCursor--noLabel"]}
        style={{
          opacity,
          transition,
          zIndex: 9999,
        }}
      />

      {/* Label overlay cursor: white label, transparent cursor visuals, sits above base */}
      <ActiveCursorOptimized
        ref={labelCursorRef}
        stationaryMode={stationaryMode}
        hoverMode={hoverMode}
        label={label}
        // Keep label stable/white; don't apply invert mix-blend-mode here.
        invertColors={false}
        className={styles["ActiveCursor--labelOnly"]}
        style={{
          opacity,
          transition,
          zIndex: 10000,
        }}
      />
    </>
  );
};

export default ActiveCursorWrapper;
