"use client";

import classNames from "classnames";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import LoadingBar from "../../../atoms/LoadingBar/LoadingBar";
import Iris, { type IrisDirection } from "../../../atoms/Iris/Iris";
import styles from "./LoadingScreen.module.scss";
import { useWordScramble } from "@/hooks/useWordScramble";

export interface LoadingScreenProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onClick"
> {
  message?: string;
  type?: "transient" | "persistent";
  onEnable?: () => void;
  onSequenceComplete?: () => void;
  /**
   * When true, clicking the sound CTA will:
   * 1) scramble/replace the main copy to `enableSoundSequenceMessage`
   * 2) wait `enableSoundSequenceWaitMs`
   * 3) transition to the next scene via `onSequenceComplete`
   */
  enableSoundSequenceEnabled?: boolean;
  enableSoundSequenceMessage?: string;
  enableSoundSequenceWaitMs?: number;
  enableSoundScrambleRevealDurationMs?: number;
  enableSoundScrambleRevealDelayMs?: number;
  enableSoundScrambleSpeedMs?: number;
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
}

export interface LoadingScreenHandle {
  startSequence: () => void;
}

const LoadingScreen = forwardRef<LoadingScreenHandle, LoadingScreenProps>(
  (
    {
      message = "[CLICK ANYWHERE TO ENABLE SOUND]",
      type = "transient",
      onEnable,
      onSequenceComplete,
      enableSoundSequenceEnabled = false,
      enableSoundSequenceMessage = "[EXPERIENCE STARTING SOON]",
      enableSoundSequenceWaitMs = 1000,
      enableSoundScrambleRevealDurationMs = 4000,
      enableSoundScrambleRevealDelayMs = 0,
      enableSoundScrambleSpeedMs = 100,
      className,
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
      ...rest
    },
    ref
  ) => {
    const [isFading, setIsFading] = useState(false);
    const [hasEnabled, setHasEnabled] = useState(false);
    const [isEnableSequenceActive, setIsEnableSequenceActive] = useState(false);
    const enableSequenceTimeoutRef = useRef<number | null>(null);
    const scrambleCompleteTimeoutRef = useRef<number | null>(null);

    const fadeMs = 400;

    const startSequence = useCallback(() => {
      setIsFading(true);
      window.setTimeout(() => {
        onSequenceComplete?.();
      }, fadeMs);
    }, [onSequenceComplete]);

    useImperativeHandle(ref, () => ({ startSequence }), [startSequence]);

    const { displayText: scrambledMessage } = useWordScramble(
      enableSoundSequenceMessage,
      {
        revealDurationMs: enableSoundScrambleRevealDurationMs,
        revealDelayMs: enableSoundScrambleRevealDelayMs,
        scrambleSpeedMs: enableSoundScrambleSpeedMs,
      }
    );

    useEffect(() => {
      return () => {
        if (enableSequenceTimeoutRef.current != null) {
          window.clearTimeout(enableSequenceTimeoutRef.current);
        }
        if (scrambleCompleteTimeoutRef.current != null) {
          window.clearTimeout(scrambleCompleteTimeoutRef.current);
        }
      };
    }, []);

    const beginEnableSequence = useCallback(() => {
      // Only run the auto-advance sequence when explicitly enabled and we have
      // somewhere to advance to.
      if (!enableSoundSequenceEnabled || !onSequenceComplete) return;

      setIsEnableSequenceActive(true);

      const scrambleTotalMs =
        enableSoundScrambleRevealDelayMs + enableSoundScrambleRevealDurationMs;

      if (scrambleCompleteTimeoutRef.current != null) {
        window.clearTimeout(scrambleCompleteTimeoutRef.current);
      }
      if (enableSequenceTimeoutRef.current != null) {
        window.clearTimeout(enableSequenceTimeoutRef.current);
      }

      scrambleCompleteTimeoutRef.current = window.setTimeout(() => {
        enableSequenceTimeoutRef.current = window.setTimeout(() => {
          startSequence();
        }, enableSoundSequenceWaitMs);
      }, scrambleTotalMs);
    }, [
      enableSoundSequenceEnabled,
      onSequenceComplete,
      enableSoundScrambleRevealDelayMs,
      enableSoundScrambleRevealDurationMs,
      enableSoundSequenceWaitMs,
      startSequence,
    ]);

    return (
      <div
        className={classNames(styles.LoadingScreen, className, {
          [styles.isFading]: isFading && type === "transient",
          [styles.isCopyFading]: isFading && type === "persistent",
        })}
        onClick={() => {
          if (hasEnabled) return;
          if (!onEnable) return;
          setHasEnabled(true);
          onEnable?.();
          beginEnableSequence();
        }}
        role="button"
        aria-label="Enable sound"
        tabIndex={0}
        {...rest}
      >
        <div className={styles.irisLayer} aria-hidden>
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
        </div>

        <div className={styles.content}>
          <div className={classNames(styles.message, "type-body")}>
            {isEnableSequenceActive ? <span>{scrambledMessage}</span> : message}
          </div>
          <div className={styles.barWrapper}>
            <LoadingBar
              count={6}
              color="white"
              delayStepSec={0.2}
              cycleDurationSec={2}
              direction="ltr"
            />
          </div>
        </div>
      </div>
    );
  }
);

LoadingScreen.displayName = "LoadingScreen";

export default LoadingScreen;
