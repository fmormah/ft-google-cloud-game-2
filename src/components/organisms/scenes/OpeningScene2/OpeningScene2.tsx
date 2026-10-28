"use client";

import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import LoadingScreen, {
  type LoadingScreenHandle,
  type LoadingScreenProps,
} from "../LoadingScreen/LoadingScreen";
import SplashScreen, {
  type SplashScreenProps,
} from "../SplashScreen/SplashScreen";
import VideoPlayer, {
  type VideoPlayerHandle,
} from "@/components/organisms/VideoPlayer/VideoPlayer";
import CascadingGlass, {
  type CascadingGlassHandle,
} from "@/components/molecules/CascadingGlass/CascadingGlass";
import styles from "./OpeningScene2.module.scss";
import DirectionalButton from "@/components/atoms/DirectionalButton/DirectionalButton";
import { useAnalytics } from "@/utils/analytics";
import { useOptionalSoundManager } from "@/contexts/SoundManagerContext";
import { assetUrl } from "@/utils/assetUrl";

export interface OpeningScene2Props extends React.HTMLAttributes<HTMLDivElement> {
  initialDelaySec?: number;
  afterFadeDelaySec?: number;
  loadingProps?: Partial<LoadingScreenProps>;
  splashProps?: Partial<SplashScreenProps>;
  onPrimaryAction?: () => void;
  onLoadingTap?: () => void;
  onLoadingVisibilityChange?: (isLoadingVisible: boolean) => void;
  backgroundVideoSrc?: string;
  tileVideoSrc?: string;
  tilePlaybackRate?: number;
  labelBlurText?: string;
}

const DEFAULT_BG = assetUrl("/assets/video/sample_video.mp4");
const DEFAULT_TILE = assetUrl("/assets/video/tile-flips.mp4");

const OpeningScene2: React.FC<OpeningScene2Props> = ({
  initialDelaySec = 5,
  afterFadeDelaySec = 2,
  loadingProps,
  splashProps,
  onPrimaryAction,
  onLoadingTap,
  onLoadingVisibilityChange,
  className,
  backgroundVideoSrc = DEFAULT_BG,
  tileVideoSrc = DEFAULT_TILE,
  tilePlaybackRate = 1,
  labelBlurText = "All videos were made with Google Veo",
  ...rest
}) => {
  const loadingRef = useRef<LoadingScreenHandle>(null);
  const countdownTimeoutRef = useRef<number | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);
  const [tilePlaying, setTilePlaying] = useState(false);
  const tileRef = useRef<VideoPlayerHandle>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const durationRef = useRef<number | null>(null);
  const labelGlassRef = useRef<CascadingGlassHandle>(null);
  const { trackEvent } = useAnalytics();
  const sound = useOptionalSoundManager();

  const handleBegin = () => {
    sound?.play("openingSceneClick");
    trackEvent("Begin");
    setIsSplashFading(true);
    window.setTimeout(() => {
      onPrimaryAction?.();
    }, 1000);
  };

  useEffect(() => {
    countdownTimeoutRef.current = window.setTimeout(() => {
      loadingRef.current?.startSequence();
    }, initialDelaySec * 1000);
    return () => {
      if (countdownTimeoutRef.current != null) {
        window.clearTimeout(countdownTimeoutRef.current);
      }
    };
  }, [initialDelaySec]);

  const handleTileEnded = () => {
    const waitMs = afterFadeDelaySec * 1000;
    window.setTimeout(() => {
      setTilePlaying(false);
      setShowSplash(true);
    }, waitMs);
  };

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const step = () => {
      if (!tileRef.current || !layer) return;
      const current = tileRef.current.getCurrentTime?.() ?? 0;
      const duration = durationRef.current ?? 0;
      const startTime = startTimeRef.current ?? 0;
      const remaining = Math.max(duration - startTime, 0.0001);
      const progress = Math.min(
        Math.max((current - startTime) / remaining, 0),
        1
      );
      const invert = 0.7 * (1 - progress);
      layer.style.setProperty("--tile-invert", invert.toString());
      rafRef.current = requestAnimationFrame(step);
    };

    if (tilePlaying) {
      rafRef.current = requestAnimationFrame(step);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [tilePlaying]);

  useEffect(() => {
    if (!showSplash) return;
    const id = window.setTimeout(() => {
      labelGlassRef.current?.trigger();
    }, 2000);
    return () => window.clearTimeout(id);
  }, [showSplash]);

  useEffect(() => {
    try {
      onLoadingVisibilityChange?.(showLoading);
    } catch {}
  }, [showLoading, onLoadingVisibilityChange]);

  return (
    <div className={classNames(styles.OpeningScene2, className)} {...rest}>
      <span
        className={classNames(styles.labelBlur, {
          [styles.labelBlurVisible]: showSplash,
          [styles.labelBlurFadeOut]: isSplashFading,
        })}
      >
        <span className={styles.labelBlurText}>{labelBlurText}</span>
        <CascadingGlass
          ref={labelGlassRef}
          tileCount={1}
          flipSpeedSec={0.2}
          totalDurationSec={0.5}
          className={styles.labelBlurGlass}
          aria-hidden
        />
      </span>
      <div className={styles.videoLayer} aria-hidden>
        <VideoPlayer
          src={backgroundVideoSrc}
          muted
          loop
          autoPlay
          preload="auto"
        />
      </div>

      <div
        ref={layerRef}
        className={classNames(styles.tileLayer, {
          [styles.tileHidden]: !tilePlaying,
        })}
        aria-hidden
      >
        <span className={"blurBackdrop"} />
      </div>

      {showLoading && (
        <LoadingScreen
          className={classNames(styles.openingLoading, {
            [styles.openingLoadingFade]: isSplashFading,
          })}
          ref={loadingRef}
          onSequenceComplete={() => {
            setTilePlaying(true);
            tileRef.current?.play();
            setShowSplash(true);
          }}
          onEnable={() => {
            // Cancel the countdown so the click-driven enable sequence controls
            // the transition timing instead.
            if (countdownTimeoutRef.current != null) {
              window.clearTimeout(countdownTimeoutRef.current);
              countdownTimeoutRef.current = null;
            }
            onLoadingTap?.();
          }}
          enableSoundSequenceEnabled={
            loadingProps?.enableSoundSequenceEnabled ?? true
          }
          {...loadingProps}
          type={loadingProps?.type ?? "persistent"}
        />
      )}

      {showSplash && (
        <div
          className={classNames(styles.splashWrap, {
            [styles.splashFade]: isSplashFading,
          })}
        >
          <SplashScreen
            onPrimaryAction={handleBegin}
            {...splashProps}
            variant={splashProps?.variant ?? "minimal"}
          />
          <div className={styles.ctaMobile}>
            <DirectionalButton
              label="BEGIN"
              direction="right"
              fullWidth
              aria-label="BEGIN"
              clickSound="none"
              onClick={handleBegin}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OpeningScene2;
