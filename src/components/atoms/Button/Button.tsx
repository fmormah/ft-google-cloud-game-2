"use client";

import classNames from "classnames";
import Image from "next/image";
import React from "react";
import styles from "./Button.module.scss";
import { useCursor } from "@/contexts/CursorContext";
import { useOptionalSoundManager } from "@/contexts/SoundManagerContext";
import { assetUrl } from "@/utils/assetUrl";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  iconSrc?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  iconOnly?: boolean;
  href?: string;
  as?: "button" | "a";
  cornerVariant?: "all" | "top" | "bottom";
  selected?: boolean;
  /**
   * - default: plays `/assets/audio/button_click_converted.webm`
   * - opening: plays `/assets/audio/opening_scene_click_converted.webm`
   * - none: disables auto click SFX
   */
  clickSound?: "default" | "opening" | "none";
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
}

const Button: React.FC<ButtonProps> = ({
  label,
  iconSrc,
  icon,
  fullWidth = false,
  iconOnly = false,
  href,
  as,
  className,
  selected,
  clickSound = "default",
  onClick,
  cornerVariant,
  children,
  ...rest
}) => {
  const { setTemporaryMode } = useCursor();
  const sound = useOptionalSoundManager();
  const isDisabled = Boolean((rest as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (!isDisabled && clickSound !== "none") {
      sound?.play(clickSound === "opening" ? "openingSceneClick" : "buttonClick");
    }
    onClick?.(event);
  };

  const classList = classNames(
    styles.Button,
    {
      [styles["Button--full-width"]]: fullWidth,
      [styles["Button--icon-only"]]: iconOnly,
      [styles["Button--no-icon"]]: !iconSrc && !icon,
      [styles["is-selected"]]: selected,
      [styles[`Button--corners-${cornerVariant}`]]: cornerVariant,
    },
    className
  );

  const content = children ? (
    <>{children}</>
  ) : (
    <>
      {icon || iconSrc ? (
        <span className={styles.Button__icon} aria-hidden role="presentation">
          {icon ? (
            icon
          ) : (
            <Image src={assetUrl(iconSrc as string)} alt="" width={24} height={24} />
          )}
        </span>
      ) : null}
      {!iconOnly ? (
        <span className={styles.Button__label}>
          <span className={styles["Button__label-text"]}>{label}</span>
        </span>
      ) : null}
    </>
  );

  const renderAsLink = as === "a" || Boolean(href);

  if (renderAsLink) {
    return (
      <a
        className={classList}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick as React.MouseEventHandler<HTMLAnchorElement>}
        {...(rest as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        data-analytics-text={label}
      >
        {content}
        {cornerVariant && <div className={styles.Button__corners} />}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classList}
      onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
      onMouseEnter={() => setTemporaryMode("stationary")}
      onMouseLeave={() => setTemporaryMode(null)}
      {...rest}
      data-analytics-text={label}
    >
      {content}
      {cornerVariant && <div className={styles.Button__corners} />}
    </button>
  );
};

export default Button;
