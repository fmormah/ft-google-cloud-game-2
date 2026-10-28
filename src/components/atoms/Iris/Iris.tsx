"use client";

import classNames from "classnames";
import React from "react";
import styles from "./Iris.module.scss";

export type IrisDirection = "clockwise" | "counter-clockwise";

export interface IrisProps extends React.HTMLAttributes<HTMLDivElement> {
  dashLength?: number;
  dashHeight?: number;
  gapLength?: number;
  rotationSpeedSec?: number;
  direction?: IrisDirection;
  color?: string;
}

type IrisStyleVars = React.CSSProperties & { ["--iris-speed"]?: string };

const Iris: React.FC<IrisProps> = ({
  dashLength = 10,
  dashHeight = 2,
  gapLength = 5,
  rotationSpeedSec = 10,
  direction = "clockwise",
  color = "#ffffff",
  className,
  ...rest
}) => {
  const svgStyle: IrisStyleVars = { ["--iris-speed"]: `${rotationSpeedSec}s` };
  return (
    <div
      className={classNames(styles.Iris, className, {
        [styles["Iris--ccw"]]: direction === "counter-clockwise",
      })}
      {...rest}
    >
      <svg
        className={styles.Iris__svg}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={svgStyle}
      >
        <circle
          cx="50"
          cy="50"
          r="49"
          fill="none"
          stroke={color}
          strokeWidth={dashHeight}
          strokeDasharray={`${dashLength} ${gapLength}`}
          vectorEffect="non-scaling-stroke"
          className={styles.Iris__ring}
        />
      </svg>
    </div>
  );
};

export default Iris;
