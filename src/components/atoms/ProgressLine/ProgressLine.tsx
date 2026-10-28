"use client";

import classNames from "classnames";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./ProgressLine.module.scss";

export interface ProgressLineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  steps?: number;
  initialStep?: number;
  lineColor?: string;
  onNext?: (step: number) => void;
  onPrevious?: (step: number) => void;
}

export interface ProgressLineHandle {
  nextStep: () => void;
  previousStep: () => void;
  getStep: () => number;
}

type ProgressLineStyleVars = React.CSSProperties & {
  "--pl-color"?: string;
  "--pl-steps"?: number;
  "--pl-progress"?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const ProgressLine = React.forwardRef<ProgressLineHandle, ProgressLineProps>(
  (
    {
      steps = 5,
      initialStep = 0,
      lineColor = "#ffffff",
      className,
      onNext,
      onPrevious,
      ...rest
    },
    ref
  ) => {
    const maxIndex = Math.max(0, steps - 1);
    const [step, setStep] = useState(clamp(initialStep, 0, maxIndex));
    const prevStepRef = useRef(step);

    useEffect(() => {
      prevStepRef.current = step;
    }, [step]);

    useEffect(() => {
      const next = clamp(initialStep, 0, maxIndex);
      setStep(next);
      stepRef.current = next;
    }, [initialStep, maxIndex]);

    const progressRatio = useMemo(() => {
      if (maxIndex === 0) return 0;
      return step / maxIndex;
    }, [step, maxIndex]);

    const stepRef = useRef(step);
    useEffect(() => {
      stepRef.current = step;
    }, [step]);

    const nextStep = useCallback(() => {
      const prev = stepRef.current;
      const next = clamp(prev + 1, 0, maxIndex);
      if (next !== prev) {
        stepRef.current = next;
        setStep(next);
        onNext?.(next);
      }
    }, [maxIndex, onNext]);

    const previousStep = useCallback(() => {
      const prev = stepRef.current;
      const next = clamp(prev - 1, 0, maxIndex);
      if (next !== prev) {
        stepRef.current = next;
        setStep(next);
        onPrevious?.(next);
      }
    }, [maxIndex, onPrevious]);

    useImperativeHandle(
      ref,
      () => ({
        nextStep,
        previousStep,
        getStep: () => stepRef.current,
      }),
      [nextStep, previousStep]
    );

    const squares = useMemo(
      () => Array.from({ length: steps }, (_, i) => i),
      [steps]
    );

    const styleVars: ProgressLineStyleVars = {
      "--pl-color": lineColor,
      "--pl-steps": steps,
      "--pl-progress": progressRatio,
    };

    return (
      <div
        className={classNames(styles.ProgressLine, className)}
        style={styleVars}
        {...rest}
      >
        <div className={styles.ProgressLine__base} />

        <div className={styles.ProgressLine__progress} />

        <div className={styles.ProgressLine__steps} aria-hidden>
          {squares.map((i) => {
            const isActive = i <= step;
            const isCurrent = i === step;
            return (
              <span
                key={i}
                data-testid="step"
                className={classNames(styles.ProgressLine__step, {
                  [styles["is-active"]]: isActive,
                  [styles["is-current"]]: isCurrent,
                })}
              />
            );
          })}
        </div>
      </div>
    );
  }
);

ProgressLine.displayName = "ProgressLine";

export default ProgressLine;
