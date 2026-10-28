"use client";

import classNames from "classnames";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useGameSelectorOptional } from "@/store/GameStore";
import { VIDEO_PLAYER, ASSETS } from "@/utils/constants";
import { useVideoAnalytics } from "@/hooks/useVideoAnalytics";
import type { VideoAnalyticsMetadata } from "@/hooks/useVideoAnalytics";
import { useOptionalSoundManager, type SoundManager } from "@/contexts/SoundManagerContext";
import { createHls, type HlsInstance } from "@/utils/hls";
import { assetUrl } from "@/utils/assetUrl";
import { toPublicPath } from "@/utils/toPublicPath";
import { useIsMobile } from "@/hooks/useDevice";
import { safePlay } from "@/utils/browser";

import styles from "./VideoPlayer.module.scss";

export interface VideoPlayerProps
  extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src"> {
  src?: string;
  hlsSrc?: string;
  preload?: "none" | "metadata" | "auto";
  poster?: string;
  analyticsMetadata?: VideoAnalyticsMetadata;
}

export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  toggleLoop: (force?: boolean) => void;
  transitionToIndex: (timeSec: number, rate?: number) => void;
  transitionToIndexHold: (timeSec: number, rate?: number) => void;
  skipTo: (timeSec: number) => void;
  isPaused: () => boolean;
  isLooping: () => boolean;
  getCurrentTime: () => number;
}

type HTMLVideoElementWithFastSeek = HTMLVideoElement & {
  fastSeek?: (time: number) => void;
};

const VideoPlayer = React.forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      src,
      hlsSrc,
      preload = "metadata",
      poster,
      className,
      muted: mutedProp,
      analyticsMetadata,
      ...rest
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const isChrome = useMemo(() => {
      if (typeof window === "undefined") return false;
      const ua = navigator.userAgent ?? "";
      return /Chrome|CriOS/.test(ua) && !/Edg|OPR|SamsungBrowser/.test(ua);
    }, []);
    const isIOS = useMemo(() => {
      if (typeof window === "undefined") return false;
      if (!isMobile) return false;
      const ua = navigator.userAgent ?? "";
      const isiOSDevice = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && /Mobile/.test(ua));
      return isiOSDevice;
    }, [isMobile]);
    // Chrome (mobile and desktop) and iOS have especially inconsistent seek completion timing.
    // Use the time-based per-seek stepping there to reduce jittery rewind scrubbing.
    const useTimeBasedRewindStepping = isChrome || isIOS;

    const resolvedSrc = src ? assetUrl(toPublicPath(src) ?? src) : undefined;
    const resolvedHlsSrc = hlsSrc
      ? assetUrl(toPublicPath(hlsSrc) ?? hlsSrc)
      : undefined;
    const resolvedPoster = poster ? assetUrl(toPublicPath(poster) ?? poster) : undefined;

    const videoRef = useRef<HTMLVideoElement>(null);
    useVideoAnalytics(videoRef, {
      title: analyticsMetadata?.title,
      url: analyticsMetadata?.url ?? resolvedHlsSrc ?? resolvedSrc,
    });
    const fxRef = useRef<HTMLVideoElement>(null);
    const transitionIntervalRef = useRef<number | null>(null);
    const transitionRafRef = useRef<number | null>(null);
    const rewindSeekListenerRef = useRef<((ev: Event) => void) | null>(null);
    const hlsInstanceRef = useRef<HlsInstance | null>(null);
    const isMountedRef = useRef(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const sound = useOptionalSoundManager();
    const soundRef = useRef<SoundManager | undefined>(sound);
    useEffect(() => {
      soundRef.current = sound;
    }, [sound]);

    const seekTo = useCallback((v: HTMLVideoElement, timeSec: number) => {
      if (!isChrome || !isMobile) {
        v.currentTime = timeSec;
        return;
      }
      const vv = v as HTMLVideoElementWithFastSeek;
      if (typeof vv.fastSeek === "function") {
        try {
          vv.fastSeek(timeSec);
          return;
        } catch {
        }
      }
      v.currentTime = timeSec;
    }, [isChrome, isMobile]);

    const cancelTransitions = useCallback(() => {
      soundRef.current?.stopLoop("rewind");
      if (transitionIntervalRef.current) {
        clearInterval(transitionIntervalRef.current);
        transitionIntervalRef.current = null;
      }
      if (transitionRafRef.current) {
        cancelAnimationFrame(transitionRafRef.current);
        transitionRafRef.current = null;
      }
      if (rewindSeekListenerRef.current && videoRef.current) {
        videoRef.current.removeEventListener(
          "seeked",
          rewindSeekListenerRef.current
        );
        rewindSeekListenerRef.current = null;
      }
    }, []);

    const destroyHls = useCallback(() => {
      if (hlsInstanceRef.current) {
        try {
          hlsInstanceRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying HLS instance:", error);
        } finally {
          hlsInstanceRef.current = null;
        }
      }
    }, []);

    useEffect(() => {
      isMountedRef.current = true;

      const setup = async () => {
        if (!videoRef.current || !isMountedRef.current) return;
        const video = videoRef.current;

        cancelTransitions();
        destroyHls();

        video.removeAttribute("src");
        try {
          video.load();
        } catch {}

        if (resolvedHlsSrc) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = resolvedHlsSrc;
            try {
              video.load();
            } catch {}
            return;
          }

          try {
            const hls = await createHls(VIDEO_PLAYER.HLS_CONFIG);
            if (hls) {
              hls.attachMedia(video);
              hls.loadSource(resolvedHlsSrc);
              hlsInstanceRef.current = hls;
              return;
            }
          } catch (e) {
            console.warn("hls.js load failed; falling back to src", e);
          }

          video.src = resolvedHlsSrc;
          try {
            video.load();
          } catch {}
          return;
        }

        if (resolvedSrc) {
          video.src = resolvedSrc;
          try {
            video.load();
          } catch {}
        }
      };

      void setup();

      return () => {
        isMountedRef.current = false;
        cancelTransitions();
        destroyHls();
      };
    }, [resolvedHlsSrc, resolvedSrc, cancelTransitions, destroyHls]);

    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      toggleLoop: (force) => {
        if (videoRef.current) {
          videoRef.current.loop = force ?? !videoRef.current.loop;
        }
      },
      transitionToIndex: (timeSec, rate = VIDEO_PLAYER.DEFAULT_TRANSITION_RATE) => {
        if (!videoRef.current || !isMountedRef.current) return;
        const video = videoRef.current;

        cancelTransitions();

        const dir = video.currentTime < timeSec ? 1 : -1;
        setIsTransitioning(true);
        if (fxRef.current) {
          try {
            fxRef.current.playbackRate = VIDEO_PLAYER.FX_PLAYBACK_RATE_NORMAL;
            fxRef.current.currentTime = 0;
            fxRef.current.loop = true;
            safePlay(fxRef.current);
          } catch {}
        }

        if (dir === 1) {
          video.playbackRate = rate;
          if (video.paused) safePlay(video);

          transitionIntervalRef.current = window.setInterval(() => {
            if (!isMountedRef.current || video.currentTime >= timeSec) {
              if (isMountedRef.current) {
                video.playbackRate = 1;
                cancelTransitions();
                setIsTransitioning(false);
                fxRef.current?.pause();
              }
            }
          }, VIDEO_PLAYER.TRANSITION_CHECK_INTERVAL_MS);
        } else {
          soundRef.current?.startLoop("rewind");
          video.pause();
          const clampMin = Math.max(
            0,
            Math.min(timeSec, video.duration || Infinity)
          );
          if (!useTimeBasedRewindStepping) {
            const stepSec = Math.max(
              VIDEO_PLAYER.MIN_STEP_SEC,
              VIDEO_PLAYER.STEP_SEC_MULTIPLIER * (rate / 2)
            );

            const onSeeked = () => {
              if (!videoRef.current || !isMountedRef.current) return;
              const v = videoRef.current;
              if (v.currentTime <= clampMin) {
                v.currentTime = timeSec;
                v.playbackRate = 1;
                cancelTransitions();
                setIsTransitioning(false);
                fxRef.current?.pause();
                safePlay(v);
                return;
              }
              const next = Math.max(clampMin, v.currentTime - stepSec);
              v.currentTime = next;
            };

            rewindSeekListenerRef.current = onSeeked;
            video.addEventListener("seeked", onSeeked);
            video.currentTime = Math.max(clampMin, video.currentTime - stepSec);
          } else {
            let lastStepTs = performance.now();

            const onSeeked = () => {
              if (!videoRef.current || !isMountedRef.current) return;
              const v = videoRef.current;
              if (v.currentTime <= clampMin) {
                seekTo(v, timeSec);
                v.playbackRate = 1;
                cancelTransitions();
                setIsTransitioning(false);
                fxRef.current?.pause();
                safePlay(v);
                return;
              }
              const now = performance.now();
              const dtSec = Math.min(0.25, Math.max(0, (now - lastStepTs) / 1000));
              lastStepTs = now;
              const stepSec = Math.max(VIDEO_PLAYER.MIN_STEP_SEC, rate * dtSec);
              const next = Math.max(clampMin, v.currentTime - stepSec);
              seekTo(v, next);
            };

            rewindSeekListenerRef.current = onSeeked;
            video.addEventListener("seeked", onSeeked);
            const initialStep = Math.max(VIDEO_PLAYER.MIN_STEP_SEC, rate * (1 / 60));
            seekTo(video, Math.max(clampMin, video.currentTime - initialStep));
          }
        }
      },
      transitionToIndexHold: (timeSec, rate = VIDEO_PLAYER.DEFAULT_TRANSITION_RATE) => {
        if (!videoRef.current || !isMountedRef.current) return;
        const video = videoRef.current;

        cancelTransitions();

        const dir = video.currentTime < timeSec ? 1 : -1;
        setIsTransitioning(true);
        if (fxRef.current) {
          try {
            fxRef.current.playbackRate = VIDEO_PLAYER.FX_PLAYBACK_RATE;
            fxRef.current.currentTime = 0;
            fxRef.current.loop = true;
            safePlay(fxRef.current);
          } catch {}
        }

        if (dir === 1) {
          video.playbackRate = rate;
          if (video.paused) safePlay(video);

          transitionIntervalRef.current = window.setInterval(() => {
            if (!isMountedRef.current || video.currentTime >= timeSec) {
              if (isMountedRef.current) {
                video.pause();
                video.currentTime = timeSec;
                video.playbackRate = 1;
                cancelTransitions();
                setIsTransitioning(false);
                fxRef.current?.pause();
              }
            }
          }, VIDEO_PLAYER.TRANSITION_CHECK_INTERVAL_MS);
        } else {
          soundRef.current?.startLoop("rewind");
          video.pause();
          const clampMin = Math.max(
            0,
            Math.min(timeSec, video.duration || Infinity)
          );
          if (!useTimeBasedRewindStepping) {
            const stepSec = Math.max(
              VIDEO_PLAYER.MIN_STEP_SEC,
              VIDEO_PLAYER.STEP_SEC_MULTIPLIER * (rate / 2)
            );

            const onSeeked = () => {
              if (!videoRef.current || !isMountedRef.current) return;
              const v = videoRef.current;
              if (v.currentTime <= clampMin) {
                v.currentTime = timeSec;
                v.playbackRate = 1;
                cancelTransitions();
                setIsTransitioning(false);
                fxRef.current?.pause();
                return;
              }
              const next = Math.max(clampMin, v.currentTime - stepSec);
              v.currentTime = next;
            };

            rewindSeekListenerRef.current = onSeeked;
            video.addEventListener("seeked", onSeeked);
            video.currentTime = Math.max(clampMin, video.currentTime - stepSec);
          } else {
            let lastStepTs = performance.now();

            const onSeeked = () => {
              if (!videoRef.current || !isMountedRef.current) return;
              const v = videoRef.current;
              if (v.currentTime <= clampMin) {
                seekTo(v, timeSec);
                v.playbackRate = 1;
                cancelTransitions();
                setIsTransitioning(false);
                fxRef.current?.pause();
                return;
              }
              const now = performance.now();
              const dtSec = Math.min(0.25, Math.max(0, (now - lastStepTs) / 1000));
              lastStepTs = now;
              const stepSec = Math.max(VIDEO_PLAYER.MIN_STEP_SEC, rate * dtSec);
              const next = Math.max(clampMin, v.currentTime - stepSec);
              seekTo(v, next);
            };

            rewindSeekListenerRef.current = onSeeked;
            video.addEventListener("seeked", onSeeked);
            const initialStep = Math.max(VIDEO_PLAYER.MIN_STEP_SEC, rate * (1 / 60));
            seekTo(video, Math.max(clampMin, video.currentTime - initialStep));
          }
        }
      },
      skipTo: (timeSec) => {
        if (videoRef.current) videoRef.current.currentTime = timeSec;
      },
      isPaused: () => videoRef.current?.paused ?? true,
      isLooping: () => videoRef.current?.loop ?? false,
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    }));

    const storeMuted = useGameSelectorOptional<boolean | undefined>(
      (s) => s.audioMuted,
      undefined
    );
    // Global mute should always win. When unmuted globally, allow call sites to force mute
    // (e.g. background loops) via an explicit `muted` prop.
    const baseAudioMuted =
      storeMuted === true
        ? true
        : storeMuted === false
          ? mutedProp ?? false
          : mutedProp ?? true;
    const audioMuted = baseAudioMuted;

    // iOS can pause HTMLAudioElement (bgMusic) when unmuted video audio starts.
    // If bgMusic was already intended to be playing, this "kick" helps keep it alive.
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;
      if (!isIOS) return;
      if (audioMuted) return;

      const kickBgMusic = () => {
        if (audioMuted) return;
        // Safe + idempotent: bgMusic is already started via user gesture elsewhere.
        soundRef.current?.startLoop("bgMusic");
      };

      const onPlay = () => window.setTimeout(kickBgMusic, 75);
      const onPlaying = () => window.setTimeout(kickBgMusic, 75);
      const onPause = () => window.setTimeout(kickBgMusic, 75);
      const onEnded = () => window.setTimeout(kickBgMusic, 75);

      v.addEventListener("play", onPlay);
      v.addEventListener("playing", onPlaying);
      v.addEventListener("pause", onPause);
      v.addEventListener("ended", onEnded);

      return () => {
        v.removeEventListener("play", onPlay);
        v.removeEventListener("playing", onPlaying);
        v.removeEventListener("pause", onPause);
        v.removeEventListener("ended", onEnded);
      };
    }, [audioMuted, isIOS]);

    return (
      <div className={classNames(styles.VideoPlayer, className)}>
        <video
          ref={videoRef}
          className={styles.video}
          // Render a real `src` attribute as a baseline so mobile Safari/Web Inspector
          // doesn't show a source-less video while effects run.
          src={resolvedHlsSrc ?? resolvedSrc}
          poster={resolvedPoster}
          muted={audioMuted}
          preload={preload}
          playsInline
          fetchPriority="high"
          {...rest}
        />
        {isTransitioning && (
          <video
            ref={fxRef}
            className={styles.fxVideo}
            src={ASSETS.VIDEO.TRANSITION_FX}
            // Always mute the transition FX overlay to avoid multiple simultaneous
            // video audio tracks (can cause jitter on iOS Safari).
            muted
            autoPlay
            loop
            playsInline
            fetchPriority="high"
            preload="auto"
          />
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
