"use client";

import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import Iris, { type IrisDirection } from "../../../atoms/Iris/Iris";
import TrailingLines from "../../../atoms/TrailingLines/TrailingLines";
import NodeLine, {
  type NodeLineHandle,
} from "../../../atoms/NodeLine/NodeLine";
import styles from "./SplashScreen.module.scss";
import { useWordScramble } from "@/hooks/useWordScramble";
import { useCursor } from "@/contexts/CursorContext";
import { useIsMobile } from "@/hooks/useDevice";

export interface SplashScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  headingHtml?: string;
  variant?: "default" | "minimal";
  primaryIrisDashLength?: number;
  primaryIrisDashHeight?: number;
  primaryIrisGapLength?: number;
  primaryIrisRotationSpeedSec?: number;
  primaryIrisColor?: string;
  primaryIrisDirection?: IrisDirection;
  secondaryIrisDashLength?: number;
  secondaryIrisDashHeight?: number;
  secondaryIrisGapLength?: number;
  secondaryIrisRotationSpeedSec?: number;
  secondaryIrisColor?: string;
  secondaryIrisDirection?: IrisDirection;
  topTrailColor?: string;
  topTrailLineHeightPx?: number;
  topTrailLineWidthPx?: number;
  topTrailGapPx?: number;
  topTrailDurationSec?: number;
  topTrailDirection?: "ltr" | "rtl";
  bottomTrailColor?: string;
  bottomTrailLineHeightPx?: number;
  bottomTrailLineWidthPx?: number;
  bottomTrailGapPx?: number;
  bottomTrailDurationSec?: number;
  bottomTrailDirection?: "ltr" | "rtl";
  onPrimaryAction?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  headingHtml = "Transforming<br/>Business",
  className,
  variant = "default",
  primaryIrisDashLength = 10,
  primaryIrisDashHeight = 2,
  primaryIrisGapLength = 5,
  primaryIrisRotationSpeedSec = 10,
  primaryIrisColor = "#ffffff",
  primaryIrisDirection = "clockwise",
  secondaryIrisDashLength = 10,
  secondaryIrisDashHeight = 2,
  secondaryIrisGapLength = 5,
  secondaryIrisRotationSpeedSec = 10,
  secondaryIrisColor = "#ffffff",
  secondaryIrisDirection = "counter-clockwise",
  topTrailColor = "#ffffff",
  topTrailLineHeightPx = 5,
  topTrailLineWidthPx = 1,
  topTrailGapPx = 11,
  topTrailDurationSec = 10,
  topTrailDirection = "ltr",
  bottomTrailColor = "#ffffff",
  bottomTrailLineHeightPx = 5,
  bottomTrailLineWidthPx = 1,
  bottomTrailGapPx = 11,
  bottomTrailDurationSec = 10,
  bottomTrailDirection = "rtl",
  onPrimaryAction,
  ...rest
}) => {
  const { setMode, setLabel } = useCursor();
  const isMobile = useIsMobile();
  const [headingLine1, headingLine2] = headingHtml.split("<br/>");
  const { displayText: scrambledLine1, opacity: opacity1 } = useWordScramble(
    headingLine1,
    {
      revealDurationMs: 2000,
      revealDelayMs: 500,
    }
  );
  const { displayText: scrambledLine2, opacity: opacity2 } = useWordScramble(
    headingLine2,
    {
      revealDurationMs: 2000,
      revealDelayMs: 700,
    }
  );

  const topLineProps = {
    color: topTrailColor,
    lineHeightPx: topTrailLineHeightPx,
    lineWidthPx: topTrailLineWidthPx,
    gapPx: topTrailGapPx,
    durationSec: topTrailDurationSec,
    direction: topTrailDirection,
  };
  const bottomLineProps = {
    color: bottomTrailColor,
    lineHeightPx: bottomTrailLineHeightPx,
    lineWidthPx: bottomTrailLineWidthPx,
    gapPx: bottomTrailGapPx,
    durationSec: bottomTrailDurationSec,
    direction: bottomTrailDirection,
  };

  const refTL = useRef<NodeLineHandle>(null);
  const refTM = useRef<NodeLineHandle>(null);
  const refTR = useRef<NodeLineHandle>(null);
  const refML = useRef<NodeLineHandle>(null);
  const refMR = useRef<NodeLineHandle>(null);
  const refBL = useRef<NodeLineHandle>(null);
  const refBM = useRef<NodeLineHandle>(null);
  const refBR = useRef<NodeLineHandle>(null);

  useEffect(() => {
    const refs = [refTL, refTM, refTR, refML, refMR, refBL, refBM, refBR];
    const id = window.setTimeout(() => {
      refs.forEach((r) => r.current?.trigger());
    }, 500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    setMode("hover");
    setLabel("BEGIN");
  }, [setMode, setLabel]);

  const primaryCtaAriaLabel = "BEGIN";

  return (
    <div className={classNames(styles.SplashScreen, className)} {...rest}>
      <div className={classNames(styles.trailing, styles.trailingTop)}>
        <TrailingLines {...topLineProps} />
      </div>
      <div className={classNames(styles.trailing, styles.trailingBottom)}>
        <TrailingLines {...bottomLineProps} />
      </div>

      <div className={styles.irisLayer} aria-hidden>
        {variant !== "minimal" && (
          <>
            <div className={styles.irisPrimary}>
              <Iris
                dashLength={primaryIrisDashLength}
                dashHeight={primaryIrisDashHeight}
                gapLength={primaryIrisGapLength}
                rotationSpeedSec={primaryIrisRotationSpeedSec}
                color={primaryIrisColor}
                direction={primaryIrisDirection}
              />
            </div>
            <div className={styles.irisSecondary}>
              <Iris
                dashLength={secondaryIrisDashLength}
                dashHeight={secondaryIrisDashHeight}
                gapLength={secondaryIrisGapLength}
                rotationSpeedSec={secondaryIrisRotationSpeedSec}
                color={secondaryIrisColor}
                direction={secondaryIrisDirection}
              />
            </div>
          </>
        )}
        <div className={styles.irisTertiary}>
          <Iris
            dashLength={primaryIrisDashLength}
            dashHeight={primaryIrisDashHeight}
            gapLength={primaryIrisGapLength}
            rotationSpeedSec={primaryIrisRotationSpeedSec}
            color={primaryIrisColor}
            direction="counter-clockwise"
          />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.cellTL}>
          <NodeLine
            ref={refTL}
            line1Angle={0}
            line1Length={50}
            line2Angle={45}
            line2Length={55}
            animationSpeedSec={0.65}
            color="#ffffff"
            squareTopOffsetPx={-3}
          />
        </div>
        <div className={styles.cellTM}>
          <NodeLine
            ref={refTM}
            line1Angle={90}
            line2Angle={0}
            line1Length={
              window.innerHeight
                ? window.innerHeight * (isMobile ? 0.16875 : 0.1875)
                : isMobile
                  ? 112.5
                  : 125
            }
            line2Length={
              window.innerHeight
                ? window.innerHeight * (isMobile ? 0.0984375 : 0.140625)
                : isMobile
                  ? 65.625
                  : 93.75
            }
            animationSpeedSec={0.65}
            color="#ffffff"
            labelAngle={-90}
            squareLeftOffsetPx={-2}
          />
        </div>
        <div className={styles.cellTR}>
          <NodeLine
            ref={refTR}
            line1Angle={-180}
            line1Length={50}
            line2Angle={-45}
            line2Length={55}
            animationSpeedSec={0.65}
            color="#ffffff"
            squareTopOffsetPx={-2}
          />
        </div>
        <div className={styles.cellML}>
          <NodeLine
            ref={refML}
            line1Angle={0}
            line2Angle={0}
            line1Length={
              typeof window !== "undefined"
                ? window.innerWidth * 0.26953125 * 0.5
                : 276 * 0.5
            }
            line2Length={
              typeof window !== "undefined"
                ? window.innerWidth * 0.26953125 * 0.178125
                : 276 * 0.178125
            }
            animationSpeedSec={0.65}
            color="#ffffff"
            squareTopOffsetPx={-3}
          />
        </div>
        <div className={styles.cellMM}>
          <h2
            className={classNames(styles.heading, "type-body")}
            style={{ opacity: opacity1 }}
          >
            {scrambledLine1}
            <br />
            <span style={{ opacity: opacity2 }}>{scrambledLine2}</span>
          </h2>
        </div>
        <div className={styles.cellMR}>
          <NodeLine
            ref={refMR}
            line1Angle={-180}
            line2Angle={0}
            line1Length={
              typeof window !== "undefined"
                ? window.innerWidth * 0.26953125 * 0.5
                : 276 * 0.5
            }
            line2Length={
              typeof window !== "undefined"
                ? window.innerWidth * 0.26953125 * 0.178125
                : 276 * 0.178125
            }
            animationSpeedSec={0.65}
            color="#ffffff"
            squareTopOffsetPx={-2}
          />
        </div>
        <div className={styles.cellBL}>
          <NodeLine
            ref={refBL}
            line1Angle={0}
            line1Length={50}
            line2Angle={-45}
            line2Length={55}
            animationSpeedSec={0.65}
            color="#ffffff"
            squareTopOffsetPx={-3}
          />
        </div>
        <div className={styles.cellBM}>
          <NodeLine
            ref={refBM}
            line1Angle={-90}
            line2Angle={0}
            line1Length={
              window.innerHeight
                ? window.innerHeight * (isMobile ? 0.16875 : 0.1875)
                : isMobile
                  ? 112.5
                  : 125
            }
            line2Length={
              window.innerHeight
                ? window.innerHeight * (isMobile ? 0.0984375 : 0.140625)
                : isMobile
                  ? 65.625
                  : 93.75
            }
            animationSpeedSec={0.65}
            color="#ffffff"
            squareLeftOffsetPx={-3}
          />
        </div>
        <div className={styles.cellBR}>
          <NodeLine
            ref={refBR}
            line1Angle={-180}
            line1Length={50}
            line2Angle={45}
            line2Length={55}
            animationSpeedSec={0.65}
            color="#ffffff"
            squareTopOffsetPx={-2}
          />
        </div>
      </div>

      <button
        type="button"
        className={styles.overlayDesktop}
        aria-label={primaryCtaAriaLabel}
        onClick={() => onPrimaryAction?.()}
      />
    </div>
  );
};

export default SplashScreen;
