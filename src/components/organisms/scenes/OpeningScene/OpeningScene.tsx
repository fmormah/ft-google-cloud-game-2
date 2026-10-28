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
import CascadingGlass, {
  type CascadingGlassHandle,
} from "../../../molecules/CascadingGlass/CascadingGlass";
import VideoPlayer from "@/components/organisms/VideoPlayer/VideoPlayer";
import styles from "./OpeningScene.module.scss";
import DirectionalButton from "@/components/atoms/DirectionalButton/DirectionalButton";
import { assetUrl } from "@/utils/assetUrl";

export interface OpeningSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  initialDelaySec?: number;
  afterFadeDelaySec?: number;
  loadingProps?: Partial<LoadingScreenProps>;
  splashProps?: Partial<SplashScreenProps>;
  onPrimaryAction?: () => void;
  onLoadingTap?: () => void;
  backgroundVideoSrc?: string;
  glassTileCount?: number;
  glassTotalDurationSec?: number;
  labelBlurText?: string;
}

const OpeningScene: React.FC<OpeningSceneProps> = ({
  initialDelaySec = 5,
  afterFadeDelaySec = 2,
  loadingProps,
  splashProps,
  onPrimaryAction,
  onLoadingTap,
  className,
  backgroundVideoSrc = assetUrl("/assets/video/sample_video.mp4"),
  glassTileCount = 64,
  glassTotalDurationSec = 2,
  labelBlurText = "All videos were made with Google Veo",
  ...rest
}) => {
  const loadingRef = useRef<LoadingScreenHandle>(null);
  const countdownTimeoutRef = useRef<number | null>(null);
  const switchTimeoutRef = useRef<number | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [showGlass, setShowGlass] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);
  const glassRef = useRef<CascadingGlassHandle>(null);
  const labelGlassRef = useRef<CascadingGlassHandle>(null);
  const primaryCtaAriaLabel = "BEGIN";

  useEffect(() => {
    countdownTimeoutRef.current = window.setTimeout(() => {
      loadingRef.current?.startSequence();
      glassRef.current?.trigger();
      const glassWaitMs = Math.max(
        afterFadeDelaySec * 1000,
        glassTotalDurationSec * 1000
      );
      switchTimeoutRef.current = window.setTimeout(() => {
        setShowLoading(false);
        setShowGlass(false);
        setShowSplash(true);
      }, glassWaitMs);
    }, initialDelaySec * 1000);

    return () => {
      if (countdownTimeoutRef.current != null) {
        window.clearTimeout(countdownTimeoutRef.current);
      }
      if (switchTimeoutRef.current != null) {
        window.clearTimeout(switchTimeoutRef.current);
      }
    };
  }, [initialDelaySec, afterFadeDelaySec, glassTotalDurationSec]);

  useEffect(() => {
    if (!showSplash) return;
    const id = window.setTimeout(() => {
      labelGlassRef.current?.trigger();
    }, 2000);
    return () => window.clearTimeout(id);
  }, [showSplash]);

  return (
    <div className={classNames(styles.OpeningScene, className)} {...rest}>
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
      {showGlass && (
        <div className={styles.glassLayer} aria-hidden>
          <CascadingGlass ref={glassRef} tileCount={glassTileCount} />
        </div>
      )}
      {showLoading && (
        <LoadingScreen
          ref={loadingRef}
          onSequenceComplete={() => {}}
          onEnable={() => {
            // Cancel the countdown so the click-driven enable sequence controls
            // the transition timing instead.
            if (countdownTimeoutRef.current != null) {
              window.clearTimeout(countdownTimeoutRef.current);
              countdownTimeoutRef.current = null;
            }
            if (switchTimeoutRef.current != null) {
              window.clearTimeout(switchTimeoutRef.current);
              switchTimeoutRef.current = null;
            }
            onLoadingTap?.();
          }}
          enableSoundSequenceEnabled={
            loadingProps?.enableSoundSequenceEnabled ?? true
          }
          {...loadingProps}
        />
      )}
      {showSplash && (
        <div
          className={classNames(styles.splashWrap, {
            [styles.splashFade]: isSplashFading,
          })}
        >
          <SplashScreen
            onPrimaryAction={() => {
              setIsSplashFading(true);
              window.setTimeout(() => {
                glassRef.current?.trigger();
                onPrimaryAction?.();
              }, 1000);
            }}
            {...splashProps}
          />
          <button
            type="button"
            className={styles.overlayDesktop}
            aria-label={primaryCtaAriaLabel}
            onClick={() => {
              setIsSplashFading(true);
              window.setTimeout(() => {
                glassRef.current?.trigger();
                onPrimaryAction?.();
              }, 1000);
            }}
          />
          <div className={styles.ctaMobile}>
            <DirectionalButton
              label="BEGIN"
              direction="right"
              fullWidth
              aria-label={primaryCtaAriaLabel}
              onClick={() => {
                setIsSplashFading(true);
                window.setTimeout(() => {
                  glassRef.current?.trigger();
                  onPrimaryAction?.();
                }, 1000);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OpeningScene;
