"use client";

import classNames from "classnames";
import React, { useImperativeHandle, useRef } from "react";
import { MaterialIcon, type MaterialIconName } from "../../atoms/Icon";
import styles from "./CardNotification.module.scss";

export type CardNotificationVariant = "default" | "positive" | "negative";

export interface CardNotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardNotificationVariant;
  label: string;
  iconName?: MaterialIconName;
  percentage?: number;
  hasAnimation?: boolean;
  animationVariant?: "intro" | "reverse";
  leftPrefix?: React.ReactNode;
  /**
   * Adds a modifier class that visually hides the left element (icon/percentage/prefix).
   * Useful when a chip should render in its compact "label only" form.
   */
  hideLeftElement?: boolean;
}

export interface CardNotificationHandle {
  trigger: () => void;
}

const CardNotification = React.forwardRef<
  CardNotificationHandle,
  CardNotificationProps
>(
  (
    {
      variant = "default",
      label,
      iconName,
      percentage,
      hasAnimation = false,
      animationVariant,
      className,
      leftPrefix,
      hideLeftElement = false,
      ...rest
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftElRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      trigger: () => {
        if (containerRef.current) {
          const leftWidth = leftElRef.current?.offsetWidth ?? 0;
          containerRef.current.style.setProperty(
            "--rn-left-width",
            `${leftWidth}px`
          );

          containerRef.current.classList.remove(styles.animate);
          void containerRef.current.offsetWidth;
          containerRef.current.classList.add(styles.animate);
        }
      },
    }));

    const isPositive = percentage !== undefined && percentage > 0;
    const isNegative = percentage !== undefined && percentage < 0;

    const renderLeftContent = () => {
      if (iconName) {
        return <MaterialIcon name={iconName} sizePx={18} />;
      }
      if (percentage !== undefined) {
        const formatted = `${isNegative ? "" : "+"}${percentage}`;
        return (
          <span className={styles.percentage}>
            {isPositive && (
              <MaterialIcon
                name="arrow_drop_up"
                className={styles.arrow}
                sizePx={18}
              />
            )}
            {isNegative && (
              <MaterialIcon
                name="arrow_drop_down"
                className={styles.arrow}
                sizePx={18}
              />
            )}
            {formatted}
          </span>
        );
      }
      return null;
    };

    const leftContent = renderLeftContent();

    const shouldRenderLeft = Boolean(leftPrefix) || Boolean(leftContent);

    return (
      <div
        ref={containerRef}
        className={classNames(
          styles.CardNotification,
          styles[`variant--${variant}`],
          { [styles.animated]: hasAnimation },
          { [styles["is-positive"]]: isPositive },
          { [styles["is-negative"]]: isNegative },
          { [styles["animation--intro"]]: animationVariant === "intro" },
          { [styles["animation--reverse"]]: animationVariant === "reverse" },
          { [styles.hideLeftElement]: hideLeftElement },
          className
        )}
        {...rest}
      >
        {shouldRenderLeft && (
          <div ref={leftElRef} className={styles.leftElement}>
            {leftPrefix && (
              <span className={styles.leftPrefix}>{leftPrefix}</span>
            )}
            {leftContent}
          </div>
        )}
        <div className={styles.rightElement}>{label}</div>
      </div>
    );
  }
);

CardNotification.displayName = "CardNotification";

export default CardNotification;
