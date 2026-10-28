"use client";

import classNames from "classnames";
import Image from "next/image";
import React from "react";
import styles from "./DirectionalButton.module.scss";
import { useCursor } from "@/contexts/CursorContext";
import { useOptionalSoundManager } from "@/contexts/SoundManagerContext";
import { assetUrl } from "@/utils/assetUrl";

export type DirectionalButtonDirection = "left" | "right";

type DirectionalButtonBaseProps = {
  label: string;
  direction?: DirectionalButtonDirection;
  widthPx?: number;
  fullWidth?: boolean;
  /**
   * - default: plays `/assets/audio/button_click_converted.webm`
   * - opening: plays `/assets/audio/opening_scene_click_converted.webm`
   * - none: disables auto click SFX
   */
  clickSound?: "default" | "opening" | "none";
  /**
   * Used to disable button behavior. For anchor rendering, this is only used to
   * adjust internal hover/click handling and does not prevent navigation.
   */
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};

type DirectionalButtonButtonProps = DirectionalButtonBaseProps & {
  as?: "button";
  href?: undefined;
} & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof DirectionalButtonBaseProps | "as" | "href" | "onClick"
  >;

type DirectionalButtonAnchorProps = DirectionalButtonBaseProps & {
  as: "a";
  href: string;
} & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof DirectionalButtonBaseProps | "as" | "href" | "onClick"
  >;

type DirectionalButtonImplicitAnchorProps = DirectionalButtonBaseProps & {
  as?: undefined;
  href: string;
} & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof DirectionalButtonBaseProps | "as" | "href" | "onClick"
  >;

export type DirectionalButtonProps =
  | DirectionalButtonButtonProps
  | DirectionalButtonAnchorProps
  | DirectionalButtonImplicitAnchorProps;

const DirectionalButton: React.FC<DirectionalButtonProps> = ({
  label,
  direction = "right",
  href,
  as,
  className,
  widthPx,
  fullWidth,
  clickSound = "default",
  onClick,
  disabled,
  ...rest
}) => {
  const { setTemporaryMode } = useCursor();
  const sound = useOptionalSoundManager();

  const classList = classNames(
    styles.DirectionalButton,
    styles[`DirectionalButton--${direction}`],
    { [styles["DirectionalButton--full"]]: fullWidth },
    className
  );

  const isDisabled = disabled;

  const style = widthPx && !fullWidth ? { width: `${widthPx}px` } : undefined;

  const content = (
    <>
      {direction === "left" ? (
        <>
          <span className={styles.DirectionalButton__icon} aria-hidden>
            <Image
              src={assetUrl("/assets/images/icons/btn-arrow-icon.svg")}
              alt=""
              width={16}
              height={16}
            />
          </span>
          <span className={styles.DirectionalButton__label}>{label}</span>
          <span className={styles.DirectionalButton__line} aria-hidden />
        </>
      ) : (
        <>
          <span className={styles.DirectionalButton__line} aria-hidden />
          <span className={styles.DirectionalButton__label}>{label}</span>
          <span className={styles.DirectionalButton__icon} aria-hidden>
            <Image
              src={assetUrl("/assets/images/icons/btn-arrow-icon.svg")}
              alt=""
              width={16}
              height={16}
            />
          </span>
        </>
      )}
    </>
  );

  const renderAsLink = as === "a" || Boolean(href);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (clickSound !== "none") {
      sound?.play(clickSound === "opening" ? "openingSceneClick" : "buttonClick");
    }
    onClick?.(event);
  };

  if (renderAsLink) {
    return (
      <a
        className={classList}
        href={href}
        style={style}
        onClick={handleClick as React.MouseEventHandler<HTMLAnchorElement>}
        {...(rest as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        data-analytics-text={label}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...(rest as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      type="button"
      className={classList}
      style={style}
      disabled={disabled}
      onClick={isDisabled ? undefined : (handleClick as React.MouseEventHandler<HTMLButtonElement>)}
      onMouseEnter={isDisabled ? undefined : () => setTemporaryMode("stationary")}
      onMouseLeave={isDisabled ? undefined : () => setTemporaryMode(null)}
      data-analytics-text={label}
    >
      {content}
    </button>
  );
};

export default DirectionalButton;
