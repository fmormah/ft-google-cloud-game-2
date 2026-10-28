"use client";

import classNames from "classnames";
import React, { useMemo } from "react";
import styles from "./LoadingBar.module.scss";

export type LoadingBarDirection = "ltr" | "rtl";

export interface LoadingBarProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  color?: string;
  delayStepSec?: number;
  cycleDurationSec?: number;
  direction?: LoadingBarDirection;
}

type LoadingBarStyleVars = React.CSSProperties & {
  "--lb-color"?: string;
  "--lb-duration"?: string;
};

const LoadingBar: React.FC<LoadingBarProps> = ({
  count = 12,
  color = "#ffffff",
  delayStepSec = 0.2,
  cycleDurationSec = 4.6,
  direction = "ltr",
  className,
  ...rest
}) => {
  const bars = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count]
  );

  const styleVars: LoadingBarStyleVars = {
    "--lb-color": color,
    "--lb-duration": `${cycleDurationSec}s`,
  };

  const flipStyle: React.CSSProperties =
    direction === "rtl" ? { transform: "scale(-1, 1)" } : {};

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-busy="true"
      className={classNames(styles.LoadingBar, className)}
      style={{ ...styleVars, ...flipStyle }}
      {...rest}
    >
      {bars.map((i) => (
        <span
          key={i}
          className={styles.LoadingBar__item}
          style={{ animationDelay: `${i * delayStepSec}s` }}
          aria-hidden
        />
      ))}
    </div>
  );
};

export default LoadingBar;
