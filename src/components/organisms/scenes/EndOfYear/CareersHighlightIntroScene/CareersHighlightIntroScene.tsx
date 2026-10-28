"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import EngineNotification from "@/components/molecules/EngineNotification/EngineNotification";
import InfoCard from "@/components/molecules/InfoCard/InfoCard";
import DirectionalButton from "@/components/atoms/DirectionalButton/DirectionalButton";
import Button from "@/components/atoms/Button/Button";
import { safePlay } from "@/utils/browser";
import styles from "./CareersHighlightIntroScene.module.scss";

export interface CareersHighlightIntroSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  startHighlightsLabel?: string;
  backgroundVideoSources?: string[];
  onContinue?: () => void;
  onHome?: () => void;
}

function useIsLgUp(): boolean {
  const [isLgUp, setIsLgUp] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLgUp(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isLgUp;
}

const CareersHighlightIntroScene: React.FC<CareersHighlightIntroSceneProps> = ({
  className,
  title = "Explore career highlights",
  description = "Use this space to introduce the theme of your experience and set context for the highlights that follow.",
  startHighlightsLabel = "START HIGHLIGHTS",
  backgroundVideoSources,
  onContinue,
  onHome,
  ...rest
}) => {
  const sources = useMemo(
    () => (backgroundVideoSources ?? []).filter(Boolean),
    [backgroundVideoSources]
  );

  const isLgUp = useIsLgUp();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    setActiveVideoIndex(0);
  }, [sources.length]);

  useEffect(() => {
    // Mobile behavior (<= lg): play one video at a time and advance on end.
    // Desktop layout (>= lg) is handled separately (all videos play together).
    if (isLgUp) return;
    if (!sources.length) return;

    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === activeVideoIndex) {
        try {
          video.pause();
          video.currentTime = 0;
          safePlay(video);
        } catch {
          // ignore autoplay errors (should be allowed due to muted)
        }
      } else {
        try {
          video.pause();
        } catch {}
      }
    });
  }, [activeVideoIndex, isLgUp, sources.length]);

  useEffect(() => {
    // Desktop behavior (>= lg): start all videos at the same time and loop continuously.
    if (!isLgUp) return;
    if (!sources.length) return;

    const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
    if (!videos.length) return;

    let cancelled = false;
    let started = false;

    const tryStartAll = () => {
      if (cancelled || started) return;
      started = true;

      for (const v of videos) {
        try {
          v.pause();
          v.currentTime = 0;
        } catch {}
      }

      // Attempt to align start time as closely as possible.
      requestAnimationFrame(() => {
        if (cancelled) return;
        for (const v of videos) {
          safePlay(v);
        }
      });
    };

    const ready = new Set<HTMLVideoElement>();
    const listeners: Array<() => void> = [];

    for (const v of videos) {
      const onCanPlay = () => {
        ready.add(v);
        if (ready.size === videos.length) tryStartAll();
      };

      if (v.readyState >= 2) {
        onCanPlay();
      } else {
        v.addEventListener("canplay", onCanPlay);
        listeners.push(() => v.removeEventListener("canplay", onCanPlay));
      }
    }

    // Fallback: if readiness events never fire for some reason, still try to start.
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      tryStartAll();
    }, 750);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      listeners.forEach((fn) => fn());
    };
  }, [isLgUp, sources]);

  const handleHome = useCallback(() => {
    if (onHome) {
      onHome();
      return;
    }
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, [onHome]);

  return (
    <div
      className={classNames(styles.CareersHighlightIntroScene, className)}
      {...rest}
    >
      {!!sources.length && (
        <div className={styles.videoLayer} aria-hidden>
          <div className={styles.videoGrid}>
            {sources.map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                className={classNames(styles.videoItem, {
                  [styles["videoItem--active"]]: idx === activeVideoIndex,
                })}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                  }}
                  className={styles.video}
                  src={src}
                  muted
                  autoPlay
                  loop={isLgUp}
                  playsInline
                  preload="auto"
                  onEnded={() => {
                    if (isLgUp) return;
                    if (!sources.length) return;
                    if (idx !== activeVideoIndex) return;
                    setActiveVideoIndex((prev) => (prev + 1) % sources.length);
                  }}
                />
              </div>
            ))}
          </div>
          <div className={styles.videoScrim} />
        </div>
      )}

      <div className={styles.uiLayer}>
        <div className={styles.metaStack}>
          <EngineNotification
            statusBase="GENERATING YOUR DATA"
            className={styles.engineNotification}
          />
          <InfoCard animationVariant="intro">
            <h2>{title}</h2>
            <p>{description}</p>
          </InfoCard>
        </div>

        <div className={styles.buttons}>
          <div
            className={classNames(
              styles.controlsTop,
              styles["controlsTop--single"]
            )}
          >
            <DirectionalButton
              label={startHighlightsLabel}
              direction="right"
              fullWidth
              onClick={() => onContinue?.()}
            />
          </div>
          <div className={styles.controlsBottom}>
            <Button
              label="HOME"
              onClick={handleHome}
              fullWidth
              className={styles.homeButtonMobile}
            />
            <DirectionalButton
              label={startHighlightsLabel}
              direction="right"
              fullWidth
              onClick={() => onContinue?.()}
            />
          </div>
        </div>
      </div>
      <Button
        label="HOME"
        onClick={handleHome}
        cornerVariant="all"
        className={styles.homeButtonDesktop}
      />
    </div>
  );
};

export default CareersHighlightIntroScene;
