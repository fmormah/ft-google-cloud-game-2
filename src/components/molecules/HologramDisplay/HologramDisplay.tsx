"use client";

import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { assetUrl } from "@/utils/assetUrl";
import { toPublicPath } from "@/utils/toPublicPath";
import type { VideoSource } from "@/types/video";
import { getBrowserVideoSources } from "@/utils/browser";
import LoadingBar from "../../atoms/LoadingBar/LoadingBar";
import styles from "./HologramDisplay.module.scss";

export interface HologramDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  videoSrc?: string;
  videoSources?: VideoSource[];
  children?: React.ReactNode;
}

const HologramDisplay: React.FC<HologramDisplayProps> = ({
  videoSrc,
  videoSources,
  children,
  className,
  ...rest
}) => {
  // State to hold the final video source - only set on client side
  const [finalVideoSrc, setFinalVideoSrc] = useState<string | undefined>(undefined);

  const resolvedVideoSrc = videoSrc
    ? assetUrl(toPublicPath(videoSrc) ?? videoSrc)
    : undefined;

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === "undefined") return;

    if (videoSources?.length) {
      // Filter sources based on browser
      const filteredSources = getBrowserVideoSources(videoSources);
      const resolvedSources = filteredSources
        .map((s) => {
          const resolvedSrc = assetUrl(toPublicPath(s.src) ?? s.src);
          return { src: resolvedSrc, type: s.type };
        })
        .filter((s) => Boolean(s.src));


      setFinalVideoSrc(resolvedSources[0]?.src);
    } else {
      // Fall back to videoSrc if no videoSources provided
      setFinalVideoSrc(resolvedVideoSrc);
    }
  }, [videoSrc, videoSources, resolvedVideoSrc]);

  const videoKey = finalVideoSrc || "pending";

  return (
    <div
      className={classNames(styles.HologramDisplay, className)}
      data-holodisplay
      {...rest}
    >
      <div className={styles.inner}>
        <span className={styles.cornerTR} />
        <span className={styles.cornerBL} />
        <div className={styles.cornerTL}>
          <div className={styles.loadingBarWrapper}>
            <LoadingBar
              count={6}
              color="white"
              delayStepSec={0.2}
              cycleDurationSec={2}
              direction="ltr"
            />
          </div>
          <div className={styles.lineV} />
        </div>
        <div className={styles.cornerBR}>
          <div className={styles.loadingBarWrapper}>
            <LoadingBar
              count={6}
              color="white"
              delayStepSec={0.2}
              cycleDurationSec={2}
              direction="rtl"
            />
          </div>
          <div className={styles.lineV} />
        </div>

        <span className={styles.borderTop} />

        <span className={styles.borderRight} />
        <span className={styles.borderLeft} />
        <span className={styles.borderBottom} />

        {finalVideoSrc && (
          <video
            key={videoKey}
            src={finalVideoSrc}
            className={styles.video}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        )}

        {children && <div className={styles.content}>{children}</div>}
      </div>
    </div>
  );
};

export default HologramDisplay;
