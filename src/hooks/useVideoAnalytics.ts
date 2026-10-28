 "use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useAnalytics } from "@/utils/analytics";

const DEFAULT_MILESTONES = [1, 2, 25, 50, 75, 100];

export interface VideoAnalyticsMetadata {
  title?: string;
  url?: string;
}

export function useVideoAnalytics(
  videoRef: RefObject<HTMLVideoElement | null>,
  metadata?: VideoAnalyticsMetadata
) {
  const { trackEvent } = useAnalytics();
  const milestoneRef = useRef<Set<number>>(new Set());
  const durationTrackedRef = useRef(false);
  const metaTrackedRef = useRef(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const getPayload = () => {
      const resolvedUrl =
        metadata?.url ||
        videoEl.dataset.analyticsUrl ||
        videoEl.currentSrc ||
        videoEl.getAttribute("src") ||
        "";
      const resolvedTitle =
        metadata?.title ||
        videoEl.dataset.analyticsTitle ||
        videoEl.getAttribute("title") ||
        resolvedUrl;
      return {
        video_title: resolvedTitle,
        video_url: resolvedUrl,
      };
    };

    const resetTracking = () => {
      milestoneRef.current = new Set();
      durationTrackedRef.current = false;
      metaTrackedRef.current = false;
    };

    const handleMetadata = () => {
      const payload = getPayload();
      if (!metaTrackedRef.current) {
        trackEvent("video_title", payload);
        trackEvent("video_url", payload);
        metaTrackedRef.current = true;
      }
      const duration = videoEl.duration;
      if (Number.isFinite(duration) && duration > 0 && !durationTrackedRef.current) {
        trackEvent("video_duration", {
          ...payload,
          video_duration: Math.round(duration),
        });
        durationTrackedRef.current = true;
      }
    };

    const handlePlay = () => {
      trackEvent("video_play", getPayload());
    };

    const handlePlaying = () => {
      trackEvent("video_playing", getPayload());
    };

    const handlePause = () => {
      trackEvent("video_pause", getPayload());
    };

    const handleTimeUpdate = () => {
      const duration = videoEl.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      const percent = (videoEl.currentTime / duration) * 100;

      DEFAULT_MILESTONES.forEach((milestone) => {
        if (percent >= milestone && !milestoneRef.current.has(milestone)) {
          milestoneRef.current.add(milestone);
          trackEvent("video_percent", {
            ...getPayload(),
            video_percent: milestone,
          });
        }
      });
    };

    const handleEnded = () => {
      if (!milestoneRef.current.has(100)) {
        milestoneRef.current.add(100);
        trackEvent("video_percent", {
          ...getPayload(),
          video_percent: 100,
        });
      }
    };

    videoEl.addEventListener("loadedmetadata", handleMetadata);
    videoEl.addEventListener("play", handlePlay);
    videoEl.addEventListener("playing", handlePlaying);
    videoEl.addEventListener("pause", handlePause);
    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    videoEl.addEventListener("ended", handleEnded);
    videoEl.addEventListener("emptied", resetTracking);

    return () => {
      videoEl.removeEventListener("loadedmetadata", handleMetadata);
      videoEl.removeEventListener("play", handlePlay);
      videoEl.removeEventListener("playing", handlePlaying);
      videoEl.removeEventListener("pause", handlePause);
      videoEl.removeEventListener("timeupdate", handleTimeUpdate);
      videoEl.removeEventListener("ended", handleEnded);
      videoEl.removeEventListener("emptied", resetTracking);
    };
  }, [metadata?.title, metadata?.url, trackEvent, videoRef]);
}

