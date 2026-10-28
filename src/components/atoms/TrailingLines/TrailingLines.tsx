"use client";

import classNames from "classnames";
import React from "react";
import styles from "./TrailingLines.module.scss";

export type TrailingDirection = "ltr" | "rtl";

export interface TrailingLinesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  lineHeightPx?: number;
  lineWidthPx?: number;
  gapPx?: number;
  durationSec?: number;
  direction?: TrailingDirection;
}

type TrailingStyleVars = React.CSSProperties & {
  "--tl-color"?: string;
  "--tl-height"?: string;
  "--tl-line-width"?: string;
  "--tl-gap"?: string;
  "--tl-duration"?: string;
  "--tl-direction"?: string;
};

const TrailingLines: React.FC<TrailingLinesProps> = ({
  color = "#ffffff",
  lineHeightPx = 5,
  lineWidthPx = 1,
  gapPx = 20,
  durationSec = 4,
  direction = "ltr",
  className,
  ...rest
}) => {
  const styleVars: TrailingStyleVars = {
    "--tl-color": color,
    "--tl-height": `${lineHeightPx}px`,
    "--tl-line-width": `${lineWidthPx}px`,
    "--tl-gap": `${gapPx}px`,
    "--tl-duration": `${durationSec}s`,
    "--tl-direction": direction === "ltr" ? "1" : "-1",
  };

  return (
    <div
      className={classNames(styles.TrailingLines, className)}
      style={styleVars}
      aria-hidden
      {...rest}
    />
  );
};

export default TrailingLines;
