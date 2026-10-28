import React from "react";
import classNames from "classnames";
import styles from "./SwipeBarInstruction.module.scss";

export interface SwipeBarInstructionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  leftLabel?: string;
  rightLabel?: string;
  tone?: "dark" | "light";
  size?: "sm" | "md";
}

const SwipeBarInstruction: React.FC<SwipeBarInstructionProps> = ({
  leftLabel = "SWIPE",
  rightLabel = "TO EXPLORE CHARACTERS",
  tone = "dark",
  size = "md",
  className,
  ...rest
}) => {
  return (
    <div
      className={classNames(
        styles.SwipeBarInstruction,
        className,
        { [styles["SwipeBarInstruction--light"]]: tone === "light" },
        { [styles["SwipeBarInstruction--sm"]]: size === "sm" }
      )}
      {...rest}
    >
      <div className={styles.content}>
        {leftLabel ? <span className={styles.label}>{leftLabel}</span> : null}
        <div className={styles.animatedArrow} aria-hidden>
          <span className={classNames(styles.arrow, styles.arrowLeft)} />
          <div className={styles.track}>
            <div className={styles.handle} />
          </div>
          <span className={classNames(styles.arrow, styles.arrowRight)} />
        </div>
        {rightLabel ? <span className={styles.label}>{rightLabel}</span> : null}
      </div>
    </div>
  );
};

SwipeBarInstruction.displayName = "SwipeBarInstruction";

export default SwipeBarInstruction;
