"use client";

import classNames from "classnames";
import React, { useImperativeHandle, useRef } from "react";
import styles from "./NodeLine.module.scss";
import CascadingGlass, {
  type CascadingGlassHandle,
} from "../../molecules/CascadingGlass/CascadingGlass";

export interface NodeLineProps extends React.HTMLAttributes<HTMLDivElement> {
  line1Angle?: number;
  line1Length?: number;
  line2Angle?: number;
  line2Length?: number;
  animationSpeedSec?: number;
  color?: string;
  label?: string;
  labelAngle?: number;
  squareTopOffsetPx?: number;
  squareLeftOffsetPx?: number;
}

export interface NodeLineHandle {
  trigger: () => void;
}

type NodeLineStyleVars = React.CSSProperties & {
  "--line1-angle"?: string;
  "--line1-length"?: string;
  "--line2-angle"?: string;
  "--line2-length"?: string;
  "--animation-duration"?: string;
  "--nl-color"?: string;
  "--label-angle"?: string;
  "--nl-square-top"?: string;
  "--nl-square-left"?: string;
};

const NodeLine = React.forwardRef<NodeLineHandle, NodeLineProps>(
  (
    {
      line1Angle = 0,
      line1Length = 60,
      line2Angle = 45,
      line2Length = 50,
      animationSpeedSec = 0.5,
      color = "#ffffff",
      label,
      labelAngle = 0,
      squareTopOffsetPx,
      squareLeftOffsetPx,
      className,
      ...rest
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const glassRef = useRef<CascadingGlassHandle>(null);

    useImperativeHandle(ref, () => ({
      trigger: () => {
        if (containerRef.current) {
          containerRef.current.classList.remove(styles.animate);
          void containerRef.current.offsetWidth;
          containerRef.current.classList.add(styles.animate);
        }
        const delayMs = animationSpeedSec * 2 * 1000 + 50;
        window.setTimeout(() => {
          glassRef.current?.trigger();
        }, delayMs);
      },
    }));

    const dynamicStyles: NodeLineStyleVars = {
      "--line1-angle": `${line1Angle}deg`,
      "--line1-length": `${line1Length}px`,
      "--line2-angle": `${line2Angle}deg`,
      "--line2-length": `${line2Length}px`,
      "--animation-duration": `${animationSpeedSec}s`,
      "--nl-color": color,
      "--label-angle": `${labelAngle}deg`,
      ...(squareTopOffsetPx !== undefined
        ? { "--nl-square-top": `${squareTopOffsetPx}px` }
        : {}),
      ...(squareLeftOffsetPx !== undefined
        ? { "--nl-square-left": `${squareLeftOffsetPx}px` }
        : {}),
    };

    return (
      <div
        ref={containerRef}
        className={classNames(styles.NodeLine, className)}
        style={dynamicStyles}
        {...rest}
      >
        <div className={styles.square}></div>
        <div className={styles["line-group"]}>
          <div className={styles.line1}></div>
          <div className={styles["line2-container"]}>
            <div className={styles.line2}></div>
          </div>
          {label && (
            <div className={styles.label}>
              <span className={styles.labelText}>{label}</span>
              <CascadingGlass
                ref={glassRef}
                tileCount={1}
                totalDurationSec={0.5}
                flipDirection="diagonal"
                className={styles.labelGlass}
                aria-hidden
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

NodeLine.displayName = "NodeLine";

export default NodeLine;
