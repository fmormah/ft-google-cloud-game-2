"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import VideoPlayer, {
  type VideoPlayerHandle,
} from "../../VideoPlayer/VideoPlayer";
import DirectionalButton from "../../../atoms/DirectionalButton/DirectionalButton";
import styles from "./ActionVideo.module.scss";

export interface ActionVideoProps {
  className?: string;
  videoSrc?: string;
  muted?: boolean;
  onComplete?: () => void;
}

const ActionVideo: React.FC<ActionVideoProps> = ({
  className,
  videoSrc = "public/assets/video/correct_post_action_video.mp4",
  muted = true,
  onComplete,
}) => {
  const playerRef = useRef<VideoPlayerHandle>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = useCallback(() => {
    try {
      playerRef.current?.pause();
    } catch {}
    onComplete?.();
  }, [onComplete]);

  const handleEnded = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  return (
    <div className={classNames(styles.ActionVideo, className)}>
      <div className={styles.videoLayer}>
        <VideoPlayer
          ref={playerRef}
          src={videoSrc}
          autoPlay
          playsInline
          muted={muted}
          loop={false}
          preload="auto"
          onEnded={handleEnded}
          className={styles.video}
        />
      </div>

      <div
        className={classNames(styles.controls, {
          [styles.isMounted]: isMounted,
        })}
      >
        <DirectionalButton label="SKIP VIDEO" fullWidth onClick={handleSkip} />
      </div>
    </div>
  );
};

export default ActionVideo;
