"use client";

import classNames from "classnames";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MuteToggle.module.scss";
import { useIsMobile } from "@/hooks/useDevice";

export interface MuteToggleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onToggle"
> {
  bars?: number;
  isOn?: boolean;
  defaultOn?: boolean;
  onToggle?: (isOn: boolean) => void;
  onTurnOn?: () => void;
  onTurnOff?: () => void;
  color?: string;
}

const MuteToggle: React.FC<MuteToggleProps> = ({
  bars = 8,
  isOn,
  defaultOn = false,
  onToggle,
  onTurnOn,
  onTurnOff,
  color = "#ffffff",
  className,
  onClick,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [internalOn, setInternalOn] = useState<boolean>(defaultOn);
  const active = (isOn ?? internalOn) === true;
  const isMobile = useIsMobile();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);

  const barIndices = useMemo(
    () => Array.from({ length: bars }, (_, i) => i),
    [bars]
  );

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    const next = !active;
    if (isOn === undefined) {
      setInternalOn(next);
    }
    onToggle?.(next);
    if (next) onTurnOn?.();
    else onTurnOff?.();

    // iOS Safari often doesn't apply :focus on tap for buttons.
    // We rely on focus styles to show the label briefly on mobile (see handleFocus).
    if (isMobile) {
      try {
        buttonRef.current?.focus({ preventScroll: true });
      } catch {
        buttonRef.current?.focus();
      }
    }

    onClick?.(e);
  };

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current != null) {
        window.clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };
  }, []);

  const handleFocus: React.FocusEventHandler<HTMLButtonElement> = (e) => {
    onFocus?.(e);
    if (!isMobile) return;

    if (blurTimeoutRef.current != null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    blurTimeoutRef.current = window.setTimeout(() => {
      // Only blur if the button is still focused.
      if (document.activeElement === buttonRef.current) {
        buttonRef.current?.blur();
      }
    }, 1000);
  };

  const handleBlur: React.FocusEventHandler<HTMLButtonElement> = (e) => {
    if (blurTimeoutRef.current != null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    onBlur?.(e);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={active}
      className={classNames(
        styles.MuteToggle,
        { [styles["is-on"]]: active },
        className
      )}
      style={{ "--mt-color": color } as React.CSSProperties}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    >
      <span className={styles["corner-bl"]} aria-hidden />
      <span className={styles["corner-br"]} aria-hidden />
      <span className={styles.MuteToggle__bars} aria-hidden>
        {barIndices.map((i) => {
          const delay = (i % 6) * 0.1;
          const duration = 0.9 + ((i * 37) % 5) * 0.15;
          return (
            <span
              key={i}
              className={styles.MuteToggle__bar}
              style={{
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </span>
      <span className={styles.MuteToggle__label}>
        {active ? "SOUND ON" : "SOUND OFF"}
      </span>
    </button>
  );
};

export default MuteToggle;
