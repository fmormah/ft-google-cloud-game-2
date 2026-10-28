"use client";

import React from "react";
import VideoPreloader from "@/components/organisms/VideoPreloader/VideoPreloader";
import { useIsMobile } from "@/hooks/useDevice";
import { debugLog, debugWarn } from "@/utils/log";

interface VideoPreloaderManagerProps {
  preloadVideoSrc: string | null;
  onVideoReady?: () => void;
}

const VideoPreloaderManager: React.FC<VideoPreloaderManagerProps> = ({
  preloadVideoSrc,
  onVideoReady,
}) => {
  const isMobile = useIsMobile();
  return (
    <VideoPreloader
      src={preloadVideoSrc}
      priority="high"
      releaseAfterLoad={isMobile}
      onLoadStart={() => debugLog("Preloading video:", preloadVideoSrc)}
      onLoadedData={() => {
        debugLog("Video preloaded successfully:", preloadVideoSrc);
        onVideoReady?.();
      }}
      onError={(error) => debugWarn("Video preload failed:", preloadVideoSrc, error)}
    />
  );
};

export default VideoPreloaderManager;
