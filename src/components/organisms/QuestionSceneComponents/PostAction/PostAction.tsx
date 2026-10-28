"use client";

import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import CanvasVideoPlayer, {
  type CanvasVideoPlayerHandle,
} from "@/components/organisms/CanvasVideoPlayer/CanvasVideoPlayer";
import CardNotification, {
  type CardNotificationHandle,
} from "../../../molecules/CardNotification/CardNotification";
import InfoCard from "../../../molecules/InfoCard/InfoCard";
import DirectionalButton from "../../../atoms/DirectionalButton/DirectionalButton";
import VideoPreloader from "../../VideoPreloader/VideoPreloader";
import styles from "./PostAction.module.scss";
import { useAnalytics } from "@/utils/analytics";
import { useIsMobile } from "@/hooks/useDevice";

export interface PostActionProps {
  className?: string;
  videoSrc?: string;
  nextVideoSrc?: string;
  /**
   * 0-based scenario index; used to emit scenario-specific analytics for "Skip video {n}".
   */
  scenarioIndex?: number;
  notificationLabel?: string;
  infoTitle?: string;
  infoBody?: string;
  onRewind?: () => void;
  onContinue?: () => void;
  onScore?: () => void;
  onContinueWithFade?: () => void;
  variant?: "positive" | "negative";
  variantClassName?: string;
  notificationPercentChange?: number;
  isLastQuestion?: boolean;
  /**
   * When true, the CardNotification renders in a compact state where the left element
   * (percentage/icon/prefix) is hidden. Used for re-answers after the player rewinds.
   */
  hideNotificationLeftElement?: boolean;
}

const PostAction: React.FC<PostActionProps> = ({
  className,
  videoSrc = "public/assets/video/correct_post_action_video.mp4",
  nextVideoSrc,
  scenarioIndex,
  notificationLabel = "ACTION COMPLETE",
  infoTitle = "Post Action Summary",
  infoBody = "Detailed outcome of the selected action appears here.",
  onRewind,
  onContinue,
  onScore,
  onContinueWithFade,
  variant,
  variantClassName,
  notificationPercentChange,
  isLastQuestion = false,
  hideNotificationLeftElement = false,
}) => {
  const REWIND_FALLBACK_MS = 3500;
  const cardRef = useRef<CardNotificationHandle>(null);
  const videoRef = useRef<CanvasVideoPlayerHandle>(null);
  const isMobile = useIsMobile();
  const effectiveNextVideoSrc = isMobile ? undefined : nextVideoSrc;
  const [isMounted, setIsMounted] = useState(false);
  const isUnmountedRef = useRef(false);
  const isRewindingRef = useRef(false);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [skipMounted, setSkipMounted] = useState(false);
  const [skipDisabled, setSkipDisabled] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [nextVideoReady, setNextVideoReady] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [nextVideoLoadTimeout, setNextVideoLoadTimeout] = useState(false);
  const didScoreRef = useRef(false);
  const pendingSkipRef = useRef(false);
  const rewindFallbackTimeoutRef = useRef<number | null>(null);
  const didTriggerRewindRef = useRef(false);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const timer = setTimeout(() => setSkipMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setNextVideoReady(false);
    setNextVideoLoadTimeout(false);
  }, [effectiveNextVideoSrc]);

  useEffect(() => {
    if (effectiveNextVideoSrc && !nextVideoReady) {
      const timeout = setTimeout(() => setNextVideoLoadTimeout(true), 1500);
      return () => clearTimeout(timeout);
    } else if (nextVideoReady) {
      setNextVideoLoadTimeout(false);
    }
  }, [effectiveNextVideoSrc, nextVideoReady]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (rewindFallbackTimeoutRef.current) {
        window.clearTimeout(rewindFallbackTimeoutRef.current);
        rewindFallbackTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof notificationPercentChange === "number" && isMounted) {
      cardRef.current?.trigger();
    }
  }, [notificationPercentChange, isMounted]);

  const cardVariantFromNumber =
    typeof notificationPercentChange === "number"
      ? notificationPercentChange > 0
        ? "positive"
        : "negative"
      : undefined;
  const isReportCta = Boolean(isLastQuestion);
  const continueLabel = isReportCta ? "SEE HOW YOU DID" : "CONTINUE";
  const continueButtonClassName = classNames({
    [styles.reportCta]: isReportCta,
  });
  const scenarioNumber =
    typeof scenarioIndex === "number" ? scenarioIndex + 1 : null;

  return (
    <div
      className={classNames(
        styles.PostAction,
        { [styles["PostAction--positive"]]: variant === "positive" },
        { [styles["PostAction--negative"]]: variant === "negative" },
        variantClassName,
        className
      )}
    >
      <div className={styles.videoLayer}>
        <CanvasVideoPlayer
          ref={videoRef}
          src={videoSrc}
          autoPlay
          playsInline
          loop={false}
          preload="auto"
          className={styles.video}
          onLoadedMetadata={(e) => {
            try {
              const el = e.currentTarget as HTMLVideoElement;
              const d = el.duration || null;
              if (d && isFinite(d)) setDurationSec(d);
              setVideoLoaded(true);
              if (pendingSkipRef.current && d && isFinite(d)) {
                pendingSkipRef.current = false;
                const targetTime = Math.max(0, d - 4);
                videoRef.current?.skipTo(targetTime);
              }
            } catch {}
          }}
          onTimeUpdate={(e) => {
            if (!durationSec) return;
            try {
              const el = e.currentTarget as HTMLVideoElement;
              const ct = el.currentTime || 0;
              const remaining = Math.max(0, durationSec - ct);
              const shouldShowSkip = remaining > 4 && !skipDisabled;
              if (skipMounted !== shouldShowSkip)
                setSkipMounted(shouldShowSkip);
              if (remaining <= 3 && !isMounted) setIsMounted(true);
              if (remaining <= 3 && !didScoreRef.current) {
                didScoreRef.current = true;
                try {
                  onScore?.();
                } catch {}
              }
            } catch {}
          }}
          onIndexTransitionEnd={() => {
            try {
              if (!isRewindingRef.current) {
                return;
              }
              if (didTriggerRewindRef.current) {
                return;
              }

              // Rewind finished: return to the question scene.
              didTriggerRewindRef.current = true;
              if (rewindFallbackTimeoutRef.current) {
                window.clearTimeout(rewindFallbackTimeoutRef.current);
                rewindFallbackTimeoutRef.current = null;
              }
              onRewind?.();
            } finally {
              isRewindingRef.current = false;
            }
          }}
        />
      </div>

      <div
        className={classNames(styles.skipControls, {
          [styles.isMounted]: skipMounted,
        })}
      >
        <DirectionalButton
          label="SKIP VIDEO"
          fullWidth
          onClick={() => {
            if (scenarioNumber && scenarioNumber >= 1 && scenarioNumber <= 5) {
              trackEvent(`Skip video ${scenarioNumber as 1 | 2 | 3 | 4 | 5}`);
            } else {
              trackEvent("skip_video");
            }
            try {
              if (durationSec && durationSec > 0) {
                const targetTime = Math.max(0, durationSec - 4);
                videoRef.current?.skipTo(targetTime);
              } else {
                pendingSkipRef.current = true;
              }
            } catch {}
          }}
        />
      </div>

      {!videoLoaded && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      )}

      {!skipMounted && (
        <div
          className={classNames(styles.uiLayer, {
            [styles.isMounted]: isMounted,
            [styles.isFadingOut]: isFadingOut,
            [styles.isLastQuestion]: isLastQuestion,
          })}
        >
          <CardNotification
            ref={cardRef}
            label={notificationLabel}
            variant={
              (cardVariantFromNumber as "positive" | "negative" | undefined) ??
              (variant === "positive"
                ? "positive"
                : variant === "negative"
                  ? "negative"
                  : "default")
            }
            hasAnimation={typeof notificationPercentChange === "number"}
            percentage={
              typeof notificationPercentChange === "number"
                ? notificationPercentChange
                : undefined
            }
            animationVariant="intro"
            hideLeftElement={hideNotificationLeftElement}
          />
          <InfoCard
            className={styles.infoBox}
            animationVariant="intro"
            variant={
              variant === "positive"
                ? "positive"
                : variant === "negative"
                  ? "negative"
                  : undefined
            }
          >
            <h2 data-analytics-name={infoTitle} className={styles.infoTitle}>
              {variant === "positive"
                ? "Smart decision"
                : variant === "negative"
                  ? "Think again..."
                  : infoTitle}
            </h2>
            <p className={styles.infoBody}>{infoBody}</p>
          </InfoCard>

          <div className={styles.ctaRow}>
            <DirectionalButton
              direction="left"
              fullWidth
              label="REWIND"
              onClick={() => {
                setSkipDisabled(true);
                setSkipMounted(false);
                setIsFadingOut(true);

                didTriggerRewindRef.current = false;
                if (rewindFallbackTimeoutRef.current) {
                  window.clearTimeout(rewindFallbackTimeoutRef.current);
                  rewindFallbackTimeoutRef.current = null;
                }

                if (!videoRef.current) {
                  didTriggerRewindRef.current = true;
                  onRewind?.();
                  return;
                }

                const currentTime = videoRef.current.getCurrentTime();
                if (currentTime <= 0.12) {
                  didTriggerRewindRef.current = true;
                  onRewind?.();
                  return;
                }

                isRewindingRef.current = true;
                const MAX_REWIND_DURATION_SEC = 3;
                const elapsed = Math.max(0, currentTime);
                const desiredEffectiveRate =
                  elapsed <= MAX_REWIND_DURATION_SEC
                    ? 1
                    : elapsed / MAX_REWIND_DURATION_SEC;
                // CanvasVideoPlayer multiplies rate on mobile (see its internal `effectiveRate`),
                // so we counter-adjust here to keep the user-perceived rewind duration consistent.
                const mobileMultiplier = isMobile ? 15 : 1;
                const rateArg = Math.max(
                  0.05,
                  desiredEffectiveRate / mobileMultiplier
                );

                // If the rewind scrub takes too long, fall back to a quick scene transition
                // (SceneTransitionWrapper will handle the fade out/in between scenes).
                rewindFallbackTimeoutRef.current = window.setTimeout(() => {
                  rewindFallbackTimeoutRef.current = null;
                  if (didTriggerRewindRef.current) {
                    return;
                  }

                  didTriggerRewindRef.current = true;
                  isRewindingRef.current = false;
                  try {
                    onRewind?.();
                  } catch (err) {
                    console.error(
                      "[PostAction] fallback: onRewind threw error:",
                      err
                    );
                  }
                }, REWIND_FALLBACK_MS);

                videoRef.current.transitionToIndexHold(0, rateArg);
              }}
            />
            <DirectionalButton
              direction="right"
              fullWidth
              label={continueLabel}
              className={continueButtonClassName}
              disabled={
                effectiveNextVideoSrc
                  ? !nextVideoReady && !nextVideoLoadTimeout
                  : false
              }
              onClick={() => {
                if (
                  effectiveNextVideoSrc &&
                  !nextVideoReady &&
                  !nextVideoLoadTimeout
                )
                  return;

                // Ensure scoring is applied even if the user clicks Continue before the
                // `onTimeUpdate` threshold triggers `onScore` (edge case when Continue
                // first appears).
                if (!didScoreRef.current) {
                  didScoreRef.current = true;
                  try {
                    onScore?.();
                  } catch {}
                }

                if (onContinueWithFade) {
                  setIsFadingOut(true);
                  onContinueWithFade();
                } else {
                  onContinue?.();
                }
              }}
            />
          </div>
        </div>
      )}

      {effectiveNextVideoSrc && (
        <VideoPreloader
          src={effectiveNextVideoSrc}
          priority="high"
          onLoadedData={() => setNextVideoReady(true)}
          onError={() => setNextVideoReady(true)}
        />
      )}
    </div>
  );
};

export default PostAction;
