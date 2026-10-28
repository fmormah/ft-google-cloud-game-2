"use client";

import classNames from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./EngineNotification.module.scss";

export interface EngineNotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  brandLabel?: string;
  statusBase?: string;
  dotIntervalMs?: number;
  maxDots?: number;
  hideDots?: boolean;
}

const EngineNotification: React.FC<EngineNotificationProps> = ({
  brandLabel = "SUNRISE CEREALS CO.",
  statusBase = "ENGINE RUNNING",
  hideDots = false,
  dotIntervalMs = 650,
  maxDots = 3,
  className,
  ...rest
}) => {
  const [dotCount, setDotCount] = useState<number>(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setDotCount((prev) => (prev % maxDots) + 1);
    }, dotIntervalMs);
    return () => window.clearInterval(id);
  }, [dotIntervalMs, maxDots]);

  const dots = useMemo(() => ".".repeat(dotCount), [dotCount]);

  return (
    <div className={classNames(styles.EngineNotification, className)} {...rest}>
      <span className={styles.labelLeft}>{brandLabel}</span>
      <span className={styles.labelRight} aria-live="polite" aria-atomic>
        {statusBase}
        {!hideDots && (
          <span className={styles.dots} aria-hidden>
            {dots}
          </span>
        )}
      </span>
    </div>
  );
};

export default EngineNotification;
