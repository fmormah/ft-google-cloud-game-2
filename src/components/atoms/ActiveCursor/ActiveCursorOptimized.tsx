"use client";

import classNames from "classnames";
import React, { useRef, useImperativeHandle, forwardRef } from "react";
import styles from "./ActiveCursor.module.scss";

export interface ActiveCursorOptimizedProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  dotSize?: number;
  color?: string;
  stationaryMode?: boolean;
  hoverMode?: boolean;
  label?: string;
  invertColors?: boolean;
  initialX?: number;
  initialY?: number;
}

type ActiveCursorStyleVars = React.CSSProperties & {
  "--ac-size"?: string;
  "--ac-dot-size"?: string;
  "--ac-color"?: string;
};

export interface ActiveCursorOptimizedRef {
  updatePosition: (x: number, y: number) => void;
  element: HTMLDivElement | null;
}

const ActiveCursorOptimized = forwardRef<
  ActiveCursorOptimizedRef,
  ActiveCursorOptimizedProps
>(
  (
    {
      size,
      dotSize,
      color = "#ffffff",
      stationaryMode = false,
      hoverMode = false,
      label = "SELECT",
      className,
      style,
      invertColors = false,
      initialX = -100,
      initialY = -100,
      ...rest
    },
    ref
  ) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        updatePosition: (x: number, y: number) => {
          if (elementRef.current) {
            elementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
          }
        },
        element: elementRef.current,
      }),
      []
    );

    const styleVars: ActiveCursorStyleVars = {
      "--ac-size": size !== undefined ? `${size}px` : undefined,
      "--ac-dot-size": dotSize !== undefined ? `${dotSize}px` : undefined,
      "--ac-color": color,
    } as ActiveCursorStyleVars;

    return (
      <div
        ref={elementRef}
        className={classNames(
          styles.ActiveCursor,
          { [styles["ActiveCursor--stationaryMode"]]: stationaryMode },
          { [styles["ActiveCursor--hoverMode"]]: hoverMode },
          { [styles["ActiveCursor--invert"]]: invertColors },
          className
        )}
        style={{
          ...styleVars,
          ...style,
          position: "fixed",
          left: 0,
          top: 0,
          transform: `translate3d(${initialX}px, ${initialY}px, 0) translate(-50%, -50%)`,
          willChange: "transform",
          zIndex: 9999,
          pointerEvents: "none",
        }}
        {...rest}
      >
        <span className={styles.ActiveCursor__dot} aria-hidden={!hoverMode}>
          {hoverMode ? (
            <span className={styles.ActiveCursor__label}>{label}</span>
          ) : null}
        </span>
      </div>
    );
  }
);

ActiveCursorOptimized.displayName = "ActiveCursorOptimized";

export default ActiveCursorOptimized;
