"use client";

import classNames from "classnames";
import React from "react";
import { useIsTablet } from "@/hooks/useDevice";
import styles from "./ActiveCursor.module.scss";

export interface ActiveCursorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  dotSize?: number;
  color?: string;
  stationaryMode?: boolean;
  hoverMode?: boolean;
  label?: string;
  invertColors?: boolean;
  /**
   * Hide the cursor on tablets (e.g. iPad), where a mouse-style cursor is misleading.
   * Defaults to false.
   */
  hideOnTablet?: boolean;
}

type ActiveCursorStyleVars = React.CSSProperties & {
  "--ac-size"?: string;
  "--ac-dot-size"?: string;
  "--ac-color"?: string;
};

const ActiveCursor: React.FC<ActiveCursorProps> = ({
  size,
  dotSize,
  color = "#ffffff",
  stationaryMode = false,
  hoverMode = false,
  label = "SELECT",
  className,
  style,
  invertColors = false,
  hideOnTablet = false,
  ...rest
}) => {
  const isTablet = useIsTablet();
  if (hideOnTablet && isTablet) return null;

  const styleVars: ActiveCursorStyleVars = {
    ...(size !== undefined ? { "--ac-size": `${size}px` } : {}),
    ...(dotSize !== undefined ? { "--ac-dot-size": `${dotSize}px` } : {}),
    "--ac-color": color,
  };

  return (
    <div
      className={classNames(
        styles.ActiveCursor,
        { [styles["ActiveCursor--stationaryMode"]]: stationaryMode },
        { [styles["ActiveCursor--hoverMode"]]: hoverMode },
        { [styles["ActiveCursor--invert"]]: invertColors },
        className
      )}
      style={{ ...styleVars, ...style }}
      {...rest}
    >
      <span className={styles.ActiveCursor__dot} aria-hidden={!hoverMode}>
        {hoverMode ? (
          <span className={styles.ActiveCursor__label}>{label}</span>
        ) : null}
      </span>
    </div>
  );
};

export default ActiveCursor;
