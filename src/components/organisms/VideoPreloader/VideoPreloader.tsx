"use client";

import React, { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useDevice";
import { debugLog, debugWarn } from "@/utils/log";
import { assetUrl } from "@/utils/assetUrl";
import { toPublicPath } from "@/utils/toPublicPath";

interface VideoPreloaderProps {
  src: string | null;
  priority?: "low" | "high";
  /**
   * If true, detach the src after a successful preload to release decoder buffers.
   * This is especially useful on mobile to reduce memory pressure while still
   * benefiting from HTTP cache.
   */
  releaseAfterLoad?: boolean;
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: (error: Event) => void;
}

const VideoPreloader: React.FC<VideoPreloaderProps> = ({
  src,
  priority = "low",
  releaseAfterLoad = false,
  onLoadStart,
  onLoadedData,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile();
  const resolvedSrc = src ? assetUrl(toPublicPath(src) ?? src) : null;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const effectivePriority = isMobile ? "low" : priority;
  const shouldPreload = isMobile ? priority === "high" : true;

  const [connectionInfo, setConnectionInfo] = useState<{
    effectiveType?: string;
    saveData?: boolean;
  }>({});

  useEffect(() => {
    if (isClient && 'connection' in navigator) {
      const connection = (navigator as { connection?: { effectiveType?: string; saveData?: boolean; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void } }).connection;
      setConnectionInfo({
        effectiveType: connection?.effectiveType,
        saveData: connection?.saveData
      });

      const handleConnectionChange = () => {
        setConnectionInfo({
          effectiveType: connection?.effectiveType,
          saveData: connection?.saveData
        });
      };

      connection?.addEventListener('change', handleConnectionChange);
      return () => connection?.removeEventListener('change', handleConnectionChange);
    }
  }, [isClient]);

  const isSlowConnection = connectionInfo.effectiveType === 'slow-2g' || connectionInfo.effectiveType === '2g';
  const isDataSaver = connectionInfo.saveData;
  const finalShouldPreload = shouldPreload && !isSlowConnection && !isDataSaver;

  useEffect(() => {
    if (
      !isClient ||
      !resolvedSrc ||
      resolvedSrc === currentSrc ||
      !finalShouldPreload
    )
      return;

    const video = videoRef.current;
    if (!video) return;

    video.removeAttribute("src");
    try {
      video.load();
    } catch {}

    const handleLoadStart = () => {
      debugLog("VideoPreloader:", isMobile ? "[MOBILE]" : "[DESKTOP]", "Starting preload for", resolvedSrc, {
        priority: effectivePriority,
        connection: connectionInfo.effectiveType,
        dataSaver: isDataSaver
      });
      onLoadStart?.();
    };

    const handleLoadedData = () => {
      debugLog("VideoPreloader: Successfully preloaded", resolvedSrc);
      onLoadedData?.();
      if (releaseAfterLoad) {
        try {
          // Release decoder buffers ASAP; network data may remain in HTTP cache.
          video.removeAttribute("src");
          video.load();
        } catch {}
      }
    };

    const handleError = (e: Event) => {
      debugWarn("VideoPreloader: Failed to preload", resolvedSrc, e);
      onError?.(e);
    };

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);

    video.src = resolvedSrc;
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("fetchPriority", effectivePriority === "high" ? "high" : "low");

    try {
      video.load();
    } catch {}

    setCurrentSrc(resolvedSrc);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);

      if (video.src) {
        video.removeAttribute("src");
        try {
          video.load();
        } catch {}
      }
    };
  }, [
    resolvedSrc,
    currentSrc,
    priority,
    releaseAfterLoad,
    onLoadStart,
    onLoadedData,
    onError,
    isClient,
    finalShouldPreload,
    effectivePriority,
    connectionInfo,
    isMobile,
    isDataSaver,
  ]);

  if (!isClient) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      style={{
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1,
      }}
      preload="auto"
      muted
      playsInline
      fetchPriority={effectivePriority === "high" ? "high" : "low"}
    />
  );
};

export default VideoPreloader;
