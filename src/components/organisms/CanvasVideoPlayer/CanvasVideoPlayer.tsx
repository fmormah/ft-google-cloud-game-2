"use client";

import classNames from "classnames";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIsMobile } from "@/hooks/useDevice";
import { useVideoAnalytics } from "@/hooks/useVideoAnalytics";
import type { VideoAnalyticsMetadata } from "@/hooks/useVideoAnalytics";
import { useGameSelectorOptional } from "@/store/GameStore";
import {
  useOptionalSoundManager,
  type SoundManager,
} from "@/contexts/SoundManagerContext";
import { VIDEO_PLAYER } from "@/utils/constants";
import { createHls, type HlsInstance } from "@/utils/hls";
import { assetUrl } from "@/utils/assetUrl";
import { toPublicPath } from "@/utils/toPublicPath";
import { safePlay } from "@/utils/browser";
import styles from "./CanvasVideoPlayer.module.scss";

declare global {
  interface Window {
    OffscreenCanvas?: typeof OffscreenCanvas;
  }
}

export interface CanvasVideoPlayerProps extends Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "src"
> {
  src?: string;
  hlsSrc?: string;
  width?: number | string;
  height?: number | string;
  poster?: string;
  onIndexTransitionEnd?: () => void;
  analyticsMetadata?: VideoAnalyticsMetadata;
  /**
   * Controls whether the rewind "scrub" SFX plays during backward transitions.
   * Defaults to true to preserve existing behavior.
   */
  enableRewindSfx?: boolean;
  /**
   * Optional scene-level override for how fast the animated rewind scrub steps on mobile.
   *
   * - When set, mobile rewind uses this absolute value instead of the default mobile scaling.
   * - This only affects backward transitions (rewind), not forward transitions.
   */
  rewindEffectiveRateMobile?: number;
  /**
   * Optional multiplier applied to rewind speed on iOS Chrome (CriOS).
   *
   * Useful when iOS Chrome's seek/paint timing makes rewind appear to "snap" rather than scrub.
   * Values < 1 slow the rewind; values > 1 speed it up.
   */
  rewindRateMultiplierIOSChrome?: number;
  /**
   * Disables the mobile-only canvas transform override from `CanvasVideoPlayer.module.scss`.
   * Useful for scenes that shouldn't use the aggressive mobile crop/scale.
   */
  disableMobileCanvasTransform?: boolean;
}

type VideoFrameRequestCallbackMetadata = {
  mediaTime: number;
  presentedFrames?: number;
  width?: number;
  height?: number;
};

type RequestVideoFrameCallback = (
  callback: (now: number, metadata: VideoFrameRequestCallbackMetadata) => void
) => number;

type CancelVideoFrameCallback = (handle: number) => void;

type HTMLVideoElementWithVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: RequestVideoFrameCallback;
  cancelVideoFrameCallback?: CancelVideoFrameCallback;
  fastSeek?: (time: number) => void;
};

export interface CanvasVideoPlayerHandle {
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

const CanvasVideoPlayer = React.forwardRef<
  CanvasVideoPlayerHandle,
  CanvasVideoPlayerProps
>(
  (
    {
      src,
      hlsSrc,
      poster,
      className,
      width = "100%",
      height = "100%",
      preload = "metadata",
      muted: mutedProp,
      autoPlay: autoPlayProp,
      onIndexTransitionEnd,
      analyticsMetadata,
      enableRewindSfx = true,
      rewindEffectiveRateMobile,
      rewindRateMultiplierIOSChrome,
      disableMobileCanvasTransform,
      ...rest
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const storeMuted = useGameSelectorOptional<boolean | undefined>(
      (s) => s.audioMuted,
      undefined
    );
    // Global mute should always win. When unmuted globally, allow call sites to force mute
    // (e.g. background loops) via an explicit `muted` prop.
    const audioMuted =
      storeMuted === true
        ? true
        : storeMuted === false
          ? (mutedProp ?? false)
          : (mutedProp ?? true);
    const effectiveAudioMuted = audioMuted;

    const resolvedSrc = src ? assetUrl(toPublicPath(src) ?? src) : undefined;
    const resolvedHlsSrc = hlsSrc
      ? assetUrl(toPublicPath(hlsSrc) ?? hlsSrc)
      : undefined;
    const resolvedPoster = poster
      ? assetUrl(toPublicPath(poster) ?? poster)
      : undefined;

    const sound = useOptionalSoundManager();
    const soundRef = useRef<SoundManager | undefined>(sound);
    useEffect(() => {
      soundRef.current = sound;
    }, [sound]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Detect Firefox for rewind behavior
    const isFirefox = useMemo(() => {
      if (typeof window === "undefined") return false;
      return /Firefox/.test(navigator.userAgent);
    }, [isMobile]);

    // Chrome (mobile and desktop) and iOS have notably jittery seek completion timings.
    // We use the "time-based per seek" rewind stepping for Chrome and iOS to reduce jittery rewind scrubbing.
    const isChrome = useMemo(() => {
      if (typeof window === "undefined") return false;
      const ua = navigator.userAgent ?? "";
      return /Chrome|CriOS/.test(ua) && !/Edg|OPR|SamsungBrowser/.test(ua);
    }, []);
    const isIOS = useMemo(() => {
      if (typeof window === "undefined") return false;
      if (!isMobile) return false;
      const ua = navigator.userAgent ?? "";
      const isiOSDevice =
        /iPhone|iPad|iPod/.test(ua) ||
        (/Macintosh/.test(ua) && /Mobile/.test(ua));
      return isiOSDevice;
    }, [isMobile]);
    const isIOSChrome = useMemo(() => {
      return isChrome && isIOS;
    }, [isChrome, isIOS]);
    const useTimeBasedRewindStepping = isChrome || isIOS;

    // iOS can pause HTMLAudioElement (bgMusic) when unmuted video audio starts.
    // If bgMusic was already intended to be playing, this "kick" helps keep it alive.
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;
      if (!isIOS) return;
      if (effectiveAudioMuted) return;

      const kickBgMusic = () => {
        if (effectiveAudioMuted) return;
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
    }, [effectiveAudioMuted, isIOS]);

    // No bgMusic ducking: allow audio to mix naturally.

    useVideoAnalytics(videoRef, {
      title: analyticsMetadata?.title,
      url: analyticsMetadata?.url ?? resolvedHlsSrc ?? resolvedSrc,
    });
    const hlsRef = useRef<HlsInstance | null>(null);
    const frameRafRef = useRef<number | null>(null);

    const transitionRafRef = useRef<number | null>(null);
    const rewindSeekListenerRef = useRef<((ev: Event) => void) | null>(null);
    const isSeekingRef = useRef(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const rewindSfxActiveRef = useRef(false);

    const startRewindSfx = useCallback(() => {
      if (!enableRewindSfx) return;
      rewindSfxActiveRef.current = true;
      soundRef.current?.startLoop("rewind");
    }, [enableRewindSfx]);

    const stopRewindSfx = useCallback(() => {
      if (!rewindSfxActiveRef.current) return;
      rewindSfxActiveRef.current = false;
      soundRef.current?.stopLoop("rewind");
    }, []);

    const cancelRewind = () => {
      stopRewindSfx();
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
      isSeekingRef.current = false;
    };

    const seekTo = (v: HTMLVideoElement, timeSec: number) => {
      const vv = v as HTMLVideoElementWithVFC;
      if (isChrome && isMobile && typeof vv.fastSeek === "function") {
        try {
          vv.fastSeek(timeSec);
          return;
        } catch {}
      }
      v.currentTime = timeSec;
    };

    const destroyHls = () => {
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
    };

    const setVideoSource = useCallback(
      async (video: HTMLVideoElement, mp4?: string, hls?: string) => {
        cancelRewind();
        destroyHls();

        video.removeAttribute("src");
        try {
          video.load();
        } catch {}

        if (hls) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = hls;
            try {
              video.load();
            } catch {}
            if (autoPlayProp) {
              try {
                await video.play();
              } catch {}
            }
            return;
          }
          try {
            const hlsInstance = await createHls(VIDEO_PLAYER.HLS_CONFIG);
            if (hlsInstance) {
              hlsInstance.attachMedia(video);
              hlsInstance.loadSource(hls);
              hlsRef.current = hlsInstance;
              if (autoPlayProp) {
                try {
                  await video.play();
                } catch {}
              }
              return;
            }
          } catch (e) {
            console.warn("hls.js load failed; falling back to src", e);
          }
          video.src = hls;
          try {
            video.load();
          } catch {}
          if (autoPlayProp) {
            try {
              await video.play();
            } catch {}
          }
          return;
        }

        if (mp4) {
          video.src = mp4;
          try {
            video.load();
          } catch {}
          if (autoPlayProp) {
            try {
              await video.play();
            } catch {}
          }
        }
      },
      [autoPlayProp]
    );

    const drawFrame = useCallback(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const vw = video.videoWidth || 0;
      const vh = video.videoHeight || 0;
      if (vw === 0 || vh === 0) return;

      let targetW = vw;
      let targetH = vh;
      if (isMobile) {
        const maxPixels = VIDEO_PLAYER.MOBILE_CANVAS_MAX_PIXELS;
        const pixels = vw * vh;
        if (Number.isFinite(maxPixels) && maxPixels > 0 && pixels > maxPixels) {
          const scale = Math.sqrt(maxPixels / pixels);
          targetW = Math.max(1, Math.floor(vw * scale));
          targetH = Math.max(1, Math.floor(vh * scale));
        }
      }

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      try {
        ctx.imageSmoothingEnabled =
          isMobile && (targetW !== vw || targetH !== vh);
        ctx.drawImage(video, 0, 0, targetW, targetH);
      } catch {}
    }, []);

    const startFrameLoop = useCallback(() => {
      if (frameRafRef.current) cancelAnimationFrame(frameRafRef.current);
      const loop = () => {
        drawFrame();
        frameRafRef.current = requestAnimationFrame(loop);
      };
      frameRafRef.current = requestAnimationFrame(loop);
    }, [drawFrame]);

    const stopFrameLoop = useCallback(() => {
      if (frameRafRef.current) {
        cancelAnimationFrame(frameRafRef.current);
        frameRafRef.current = null;
      }
    }, []);

    useEffect(() => {
      const setup = async () => {
        if (!videoRef.current) return;
        const v = videoRef.current;
        await setVideoSource(v, resolvedSrc, resolvedHlsSrc);
      };
      void setup();
      return () => {
        cancelRewind();
        stopFrameLoop();
        destroyHls();
      };
    }, [resolvedHlsSrc, resolvedSrc, setVideoSource, stopFrameLoop]);

    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;

      let rAF: number | null = null;
      let vfcHandle: number | null = null;

      const paint = () => drawFrame();

      const onPlay = () => {
        stopFrameLoop();
        const vv = v as HTMLVideoElementWithVFC;
        if (
          "requestVideoFrameCallback" in vv &&
          typeof vv.requestVideoFrameCallback === "function"
        ) {
          const tick = () => {
            paint();
            vfcHandle = vv.requestVideoFrameCallback!(tick);
          };
          vfcHandle = vv.requestVideoFrameCallback(tick);
        } else {
          startFrameLoop();
        }
      };

      const onPause = () => {
        const vv = v as HTMLVideoElementWithVFC;
        if (
          vfcHandle &&
          "cancelVideoFrameCallback" in vv &&
          typeof vv.cancelVideoFrameCallback === "function"
        ) {
          vv.cancelVideoFrameCallback(vfcHandle);
          vfcHandle = null;
        }
        if (rAF) {
          cancelAnimationFrame(rAF);
          rAF = null;
        }
        drawFrame();
      };

      v.addEventListener("playing", onPlay);
      v.addEventListener("pause", onPause);
      v.addEventListener("seeked", paint);
      v.addEventListener("loadeddata", paint);
      v.addEventListener("loadedmetadata", paint);

      return () => {
        v.removeEventListener("playing", onPlay);
        v.removeEventListener("pause", onPause);
        v.removeEventListener("seeked", paint);
        v.removeEventListener("loadeddata", paint);
        v.removeEventListener("loadedmetadata", paint);
        stopFrameLoop();
      };
    }, [drawFrame, startFrameLoop, stopFrameLoop]);

    const rewindTo = (timeSec: number, rate = 4, hold = false) => {
      const v = videoRef.current;
      if (!v) return;

      cancelRewind();
      setIsTransitioning(true);

      const clampMin = Math.max(0, Math.min(timeSec, v.duration || Infinity));

      // Firefox: Just jump directly to target (no animated scrub)
      if (isFirefox) {
        v.pause();
        seekTo(v, timeSec);
        setIsTransitioning(false);
        drawFrame();
        if (!hold) safePlay(v);
        try {
          onIndexTransitionEnd?.();
        } catch {}
        return;
      }

      startRewindSfx();

      const baseEffectiveRate = isMobile
        ? (rewindEffectiveRateMobile ?? rate * 10)
        : rate;
      const effectiveRate =
        baseEffectiveRate *
        (isIOSChrome ? (rewindRateMultiplierIOSChrome ?? 1) : 1);

      if (v.currentTime <= clampMin) {
        seekTo(v, timeSec);
        setIsTransitioning(false);
        stopRewindSfx();
        if (!hold) safePlay(v);
        drawFrame();
        return;
      }

      v.pause();
      isSeekingRef.current = false;
      let firstSeekCompleted = false;
      let lastTs = performance.now();

      const onSeeked = () => {
        isSeekingRef.current = false;
        firstSeekCompleted = true;
        drawFrame();
      };
      rewindSeekListenerRef.current = onSeeked;
      v.addEventListener("seeked", onSeeked);

      const loop = () => {
        if (!videoRef.current) return;
        const vid = videoRef.current;

        if (firstSeekCompleted && vid.currentTime <= clampMin) {
          seekTo(vid, timeSec);
          cancelRewind();
          setIsTransitioning(false);
          drawFrame();
          if (!hold) safePlay(vid);
          try {
            onIndexTransitionEnd?.();
          } catch {}
          return;
        }

        if (!isSeekingRef.current) {
          isSeekingRef.current = true;
          const now = performance.now();
          const dtSec = useTimeBasedRewindStepping
            ? // Mobile Chrome: include seek completion time to avoid jittery micro-seeks.
              Math.min(0.25, Math.max(0, (now - lastTs) / 1000))
            : // Legacy behavior: don't include seek wait time in dt (keeps step sizes smaller).
              Math.max(0, (now - lastTs) / 1000);
          lastTs = now;
          const distance = Math.max(0, vid.currentTime - clampMin);
          const targetStep = Math.max(0.01, effectiveRate * dtSec);
          const stepSec = Math.min(distance, targetStep);
          const next = Math.max(0, vid.currentTime - stepSec);
          seekTo(vid, next);
        } else if (!useTimeBasedRewindStepping) {
          // Legacy behavior: while we're waiting for the seek, reset dt to avoid large jumps.
          lastTs = performance.now();
        }

        if (!useTimeBasedRewindStepping) {
          // Legacy behavior: allow rVFC to release the seek lock once a frame is ready.
          const vvid = vid as HTMLVideoElementWithVFC;
          if (
            "requestVideoFrameCallback" in vvid &&
            typeof vvid.requestVideoFrameCallback === "function"
          ) {
            vvid.requestVideoFrameCallback(() => {
              isSeekingRef.current = false;
              drawFrame();
            });
          }
        }

        transitionRafRef.current = requestAnimationFrame(loop);
      };

      const initialStep = Math.max(0.01, effectiveRate * (1 / 60));
      const initialNext = Math.max(0, v.currentTime - initialStep);
      seekTo(v, initialNext);
      isSeekingRef.current = true;
      transitionRafRef.current = requestAnimationFrame(loop);
    };

    const forwardTo = (timeSec: number, rate = 4, hold = false) => {
      const v = videoRef.current;
      if (!v) return;

      cancelRewind();
      setIsTransitioning(true);

      const target = Math.min(timeSec, v.duration || Infinity);

      if (v.currentTime >= target) {
        v.pause();
        v.currentTime = target;
        setIsTransitioning(false);
        drawFrame();
        try {
          onIndexTransitionEnd?.();
        } catch {}
        return;
      }

      const originalRate = v.playbackRate;
      v.playbackRate = Math.max(1, rate);
      safePlay(v);

      const step = () => {
        if (!videoRef.current) return;
        drawFrame();

        if (v.currentTime >= target) {
          v.pause();
          v.currentTime = target;
          v.playbackRate = originalRate;
          setIsTransitioning(false);
          drawFrame();
          if (!hold) {
            v.playbackRate = 1;
            safePlay(v);
          }
          try {
            onIndexTransitionEnd?.();
          } catch {}
          return;
        }

        transitionRafRef.current = requestAnimationFrame(step);
      };

      transitionRafRef.current = requestAnimationFrame(step);
    };

    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      toggleLoop: (force) => {
        if (videoRef.current) {
          videoRef.current.loop = force ?? !videoRef.current.loop;
        }
      },
      transitionToIndex: (timeSec: number, rate = 4) => {
        const v = videoRef.current;
        if (!v) return;
        if (v.currentTime < timeSec) {
          forwardTo(timeSec, rate, false);
        } else {
          rewindTo(timeSec, rate, false);
        }
      },
      transitionToIndexHold: (timeSec: number, rate = 4) => {
        const v = videoRef.current;
        if (!v) return;
        if (v.currentTime < timeSec) {
          forwardTo(timeSec, rate, true);
        } else {
          rewindTo(timeSec, rate, true);
        }
      },
      skipTo: (timeSec: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = timeSec;
          drawFrame();
        }
      },
      isPaused: () => videoRef.current?.paused ?? true,
      isLooping: () => videoRef.current?.loop ?? false,
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    }));

    return (
      <div
        className={classNames(
          styles.CanvasVideoPlayer,
          disableMobileCanvasTransform && styles.disableMobileCanvasTransform,
          className
        )}
        style={{ width, height }}
      >
        <canvas ref={canvasRef} className={styles.canvas} />
        <video
          ref={videoRef}
          className={styles.hiddenVideo}
          poster={resolvedPoster}
          muted={effectiveAudioMuted}
          preload={preload}
          playsInline
          autoPlay={autoPlayProp}
          crossOrigin="anonymous"
          {...rest}
        />
        {isTransitioning && <div className={styles.transitionOverlay} />}
      </div>
    );
  }
);

CanvasVideoPlayer.displayName = "CanvasVideoPlayer";

export default CanvasVideoPlayer;
