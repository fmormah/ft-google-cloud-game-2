"use client";

import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import EngineNotification from "../../../molecules/EngineNotification/EngineNotification";
import HologramDisplay from "../../../molecules/HologramDisplay/HologramDisplay";
import InfoCard from "../../../molecules/InfoCard/InfoCard";
import DirectionalButton from "../../../atoms/DirectionalButton/DirectionalButton";
import VideoPlayer from "@/components/organisms/VideoPlayer/VideoPlayer";
import { ASSETS } from "@/utils/constants";
import type { VideoSource } from "@/types/video";
import styles from "./HoloInformationScene.module.scss";

export interface HoloInformationSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  onNext?: () => void;
  primaryCtaLabel?: string;
  videoSrc?: string;
  videoSources?: VideoSource[];
  backgroundVideoSrc?: string;
  children?: React.ReactNode;
  primaryCtaDirection?: "left" | "right";
  primaryCtaHref?: string;
  primaryCtaAs?: "button" | "a";
}

const DEFAULT_VIDEO_SOURCES = ASSETS.VIDEO_SOURCES.HOLO_CEREAL;
const DEFAULT_BG_VIDEO = ASSETS.VIDEO.EOY_REPORT_BG_LOOP;

const HoloInformationScene: React.FC<HoloInformationSceneProps> = ({
  onNext,
  primaryCtaLabel = "NEXT",
  videoSrc,
  videoSources = DEFAULT_VIDEO_SOURCES,
  backgroundVideoSrc = DEFAULT_BG_VIDEO,
  className,
  children,
  primaryCtaDirection = "right",
  primaryCtaHref,
  primaryCtaAs,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const holoSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // jsdom logs "Not implemented: Window's scrollTo() method" to stderr.
    if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent))
      return;

    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      // Fallback for older browsers that don't support the scroll options object.
      window.scrollTo(0, 0);
    }
  }, []);

  const primaryCtaAriaLabel = primaryCtaLabel;
  const primaryCtaLinkProps = primaryCtaHref
    ? primaryCtaAs === "a"
      ? { as: "a" as const, href: primaryCtaHref }
      : { href: primaryCtaHref }
    : {};
  return (
    <div
      className={classNames(styles.HoloInformationScene, className)}
      {...rest}
    >
      <div className={styles.backgroundVideoLayer} aria-hidden>
        <VideoPlayer
          className={styles.backgroundVideo}
          src={backgroundVideoSrc}
          autoPlay
          loop
          playsInline
          muted
          preload="auto"
        />
      </div>
      <div className={styles.backgroundScrim} aria-hidden />

      <div
        ref={holoSectionRef}
        className={classNames(styles.inner, {
          [styles.isVisible]: isVisible,
          [styles.isCompact]: isCompact,
        })}
      >
        <div className={styles.section}>
          <EngineNotification statusBase="" hideDots={true} />
        </div>
        <div className={styles.section}>
          <HologramDisplay
            className={styles.holoDisplay}
            videoSources={videoSources}
            videoSrc={videoSrc}
          />
        </div>
        <div className={classNames(styles.section, styles.sectionInfoCard)}>
          <InfoCard className="copy-content">{children}</InfoCard>
          <div className={styles.ctaDesktop}>
            <DirectionalButton
              {...primaryCtaLinkProps}
              label={primaryCtaLabel}
              direction={primaryCtaDirection}
              aria-label={primaryCtaAriaLabel}
              fullWidth={true}
              onClick={onNext}
            />
          </div>
        </div>
      </div>

      <div className={styles.ctaMobile}>
        <DirectionalButton
          {...primaryCtaLinkProps}
          label={primaryCtaLabel}
          direction={primaryCtaDirection}
          fullWidth
          aria-label={primaryCtaAriaLabel}
          onClick={onNext}
        />
      </div>
    </div>
  );
};

export default HoloInformationScene;
