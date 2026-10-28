"use client";

import classNames from "classnames";
import React, { useImperativeHandle, useMemo, useRef } from "react";
import styles from "./CascadingGlass.module.scss";

export type FlipDirection = "diagonal" | "horizontal" | "vertical" | "combo";

export interface CascadingGlassProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tileCount?: number;
  flipSpeedSec?: number;
  totalDurationSec?: number;
  flipDirection?: FlipDirection;
  sheenDurationSec?: number;
  sheenWidthPercent?: number;
  sheenOpacity?: number;
  sheenBlurPx?: number;
}

export interface CascadingGlassHandle {
  trigger: () => void;
}

type GridStyleVars = React.CSSProperties & { ["--grid-cols"]?: number };

const CascadingGlass = React.forwardRef<
  CascadingGlassHandle,
  CascadingGlassProps
>(
  (
    {
      tileCount = 64,
      flipSpeedSec = 0.6,
      totalDurationSec = 2,
      flipDirection = "diagonal",
      sheenDurationSec = 0.8,
      sheenWidthPercent = 50,
      sheenOpacity = 0.25,
      sheenBlurPx = 5,
      className,
      ...rest
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isFlippingRef = useRef(false);

    const gridCols = useMemo(
      () => Math.ceil(Math.sqrt(tileCount)),
      [tileCount]
    );
    const tiles = useMemo(() => Array.from({ length: tileCount }), [tileCount]);

    useImperativeHandle(ref, () => ({
      trigger: () => {
        if (isFlippingRef.current || !containerRef.current) return;
        isFlippingRef.current = true;

        const container = containerRef.current;

        const sheen = document.createElement("div");
        sheen.className = styles.sheen;
        sheen.style.setProperty("--sheen-duration", `${sheenDurationSec}s`);
        sheen.style.setProperty("--sheen-width", `${sheenWidthPercent}%`);
        sheen.style.setProperty("--sheen-opacity", `${sheenOpacity}`);
        sheen.style.setProperty("--sheen-blur", `${sheenBlurPx}px`);

        container.appendChild(sheen);
        setTimeout(() => sheen.remove(), sheenDurationSec * 1000);

        const tileElements = Array.from(
          container.querySelectorAll(`.${styles.tile}`)
        ) as HTMLDivElement[];
        const flipClass = styles[`flipped-${flipDirection}`];

        tileElements.forEach((tile) => {
          tile
            .querySelector(`.${styles["tile-inner"]}`)
            ?.classList.remove(
              styles["flipped-horizontal"],
              styles["flipped-vertical"],
              styles["flipped-diagonal"],
              styles["flipped-combo"]
            );
          tile.classList.remove(styles["is-wobbling"]);
        });

        if (tileElements.length === 0) {
          isFlippingRef.current = false;
          return;
        }

        const firstTile = tileElements[0];
        firstTile.classList.add(styles["is-wobbling"]);
        firstTile.addEventListener(
          "animationend",
          () => {
            firstTile.classList.remove(styles["is-wobbling"]);
          },
          { once: true }
        );

        setTimeout(() => {
          const delayBetweenFlips =
            (totalDurationSec * 1000) / tileElements.length;
          tileElements.forEach((tile, index) => {
            setTimeout(() => {
              tile
                .querySelector(`.${styles["tile-inner"]}`)
                ?.classList.add(flipClass);
            }, index * delayBetweenFlips);
          });
        }, 300);

        setTimeout(
          () => {
            isFlippingRef.current = false;
          },
          totalDurationSec * 1000 + 350
        );
      },
    }));

    const styleVars: GridStyleVars = { ["--grid-cols"]: gridCols };

    return (
      <div
        ref={containerRef}
        className={classNames(styles.CascadingGlass, className)}
        style={styleVars}
        {...rest}
      >
        {tiles.map((_, i) => (
          <div className={styles.tile} key={i}>
            <div
              className={styles["tile-inner"]}
              style={{ transitionDuration: `${flipSpeedSec}s` }}
            >
              <div className={styles["tile-front"]}></div>
              <div className={styles["tile-back"]}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

CascadingGlass.displayName = "CascadingGlass";

export default CascadingGlass;
