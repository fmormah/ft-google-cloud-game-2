"use client";

import React, { useEffect, useState } from "react";
import classNames from "classnames";
import VideoPlayer from "../../VideoPlayer/VideoPlayer";
import CardNotification from "../../../molecules/CardNotification/CardNotification";
import InfoCard from "../../../molecules/InfoCard/InfoCard";
import Button from "../../../atoms/Button/Button";
import { MaterialIcon, type MaterialIconName } from "../../../atoms/Icon";
import DirectionalButton from "../../../atoms/DirectionalButton/DirectionalButton";
import VideoPreloader from "../../VideoPreloader/VideoPreloader";
import styles from "./QuestionSceneShell.module.scss";
import { ANIMATION } from "@/utils/constants";
import { debugLog, debugWarn } from "@/utils/log";
import { useIsMobile } from "@/hooks/useDevice";

export interface QuestionSceneShellProps {
  className?: string;
  videoSrc?: string;
  cardLabel?: string;
  cardIconName?: MaterialIconName;
  infoTitle?: string;
  infoBody?: string;
  viewBCardLabel?: string;
  viewBCardIconName?: MaterialIconName;
  viewBInfoTitle?: string;
  viewBInfoBody?: string;
  autoRevealOnMount?: boolean;
  actions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    iconName?: MaterialIconName;
    onClick?: () => void;
  }>;
  nextVideoSrc?: string;
  onActNow?: () => void;
  onOptionRegister?: (info: {
    index: number;
    id: string;
    label: string;
  }) => void;
  onOptionCommit?: (info: {
    selectedIndex: number | null;
    selected: { id: string; label: string } | null;
  }) => void;
  onOptionRegisterWithFade?: (info: {
    index: number;
    id: string;
    label: string;
  }) => void;
  onOptionCommitWithFade?: (info: {
    selectedIndex: number | null;
    selected: { id: string; label: string } | null;
  }) => void;
  onActNowWithFade?: () => void;
}

const QuestionSceneShell: React.FC<QuestionSceneShellProps> = ({
  className,
  videoSrc = "public/assets/video/scene_videos/character_0_scenarios/scenario_0/index.mp4",
  cardLabel = "ENGINE STATUS",
  cardIconName = "error",
  infoTitle = "Scenario Title",
  infoBody = "This is the scenario description that provides context to the player.",
  actions = [
    { id: "a", label: "Investigate", iconName: "rule" },
    { id: "b", label: "Isolate", iconName: "admin_panel_settings" },
    { id: "c", label: "Report", iconName: "article" },
  ],
  nextVideoSrc,
  viewBCardLabel,
  viewBCardIconName,
  viewBInfoTitle,
  viewBInfoBody,
  autoRevealOnMount,
  onActNow,
  onOptionRegister,
  onOptionCommit,
  onOptionRegisterWithFade,
  onOptionCommitWithFade,
  onActNowWithFade,
}) => {
  const isMobile = useIsMobile();
  const [viewBStage2, setViewBStage2] = useState(false);
  const [viewBSelectedIndex, setViewBSelectedIndex] = useState<number | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [nextVideoReady, setNextVideoReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [videoLoadTimeout, setVideoLoadTimeout] = useState(false);
  const effectiveNextVideoSrc = isMobile ? undefined : nextVideoSrc;

  useEffect(() => {
    setNextVideoReady(false);
    setVideoLoadTimeout(false);
  }, [effectiveNextVideoSrc]);

  useEffect(() => {
    if (uiVisible) {
      const timer = setTimeout(() => setIsMounted(true), 50);
      return () => clearTimeout(timer);
    }
    setIsMounted(false);
  }, [uiVisible]);

  useEffect(() => {
    if (effectiveNextVideoSrc && !nextVideoReady) {
      const timeout = setTimeout(() => setVideoLoadTimeout(true), 1500);
      return () => clearTimeout(timeout);
    } else if (nextVideoReady) {
      setVideoLoadTimeout(false);
    }
  }, [effectiveNextVideoSrc, nextVideoReady]);

  useEffect(() => {
    if (isMounted) {
      const buttonDelay =
        ANIMATION.INFOCARD.INTRO_TOTAL_DURATION +
        ANIMATION.BUTTONS.POST_INFOCARD_DELAY;
      const buttonTimer = setTimeout(
        () => setButtonsVisible(true),
        buttonDelay
      );
      return () => clearTimeout(buttonTimer);
    }
    setButtonsVisible(false);
  }, [isMounted]);

  const freezeVideoOnLastFrame = (video: HTMLVideoElement) => {
    try {
      const dur = video.duration || 0;
      if (!dur || !isFinite(dur)) return;
      // Seeking to the exact duration can be unstable; back off slightly.
      const target = Math.max(0, dur - 0.02);
      video.pause();
      video.currentTime = target;
    } catch {}
  };

  return (
    <div className={classNames(styles.QuestionSceneShell, className)}>
      <div className={styles.videoLayer}>
        <VideoPlayer
          src={videoSrc}
          autoPlay
          loop={false}
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            if (!autoRevealOnMount) return;
            try {
              const v = e.currentTarget as HTMLVideoElement;
              const dur = v.duration || 0;
              if (dur > 0) {
                v.currentTime = Math.max(0, dur - 0.02);
                v.pause();
                setUiVisible(true);
              }
            } catch {}
          }}
          onEnded={(e) => {
            setUiVisible(true);
            try {
              const v = e.currentTarget as HTMLVideoElement;
              // iOS Safari has been seen to snap back to the first frame after `ended`.
              // Force a seek to "near the end" and pause so the last frame stays rendered.
              freezeVideoOnLastFrame(v);
              window.setTimeout(() => freezeVideoOnLastFrame(v), 0);
              window.requestAnimationFrame(() => freezeVideoOnLastFrame(v));
            } catch {}
          }}
          className={styles.video}
        />
      </div>

      <div
        className={classNames(styles.uiLayer, {
          [styles.isFadingOut]: isFadingOut,
        })}
        style={{ display: uiVisible ? undefined : "none" }}
      >
        <div
          className={classNames(styles.viewA, {
            [styles.isMounted]: isMounted,
          })}
        >
          <CardNotification
            label={cardLabel}
            iconName={cardIconName}
            className={styles.viewA__child}
            animationVariant="intro"
          />

          <InfoCard
            className={classNames(styles.infoCard, styles.viewA__child)}
            animationVariant="intro"
          >
            <h2 className={styles.infoTitle}>{infoTitle}</h2>
            <p className={styles.infoBody}>{infoBody}</p>
          </InfoCard>

          <div
            className={classNames(styles.actionsRow, styles.viewA__child, {
              [styles.buttonsVisible]: buttonsVisible,
            })}
          >
            {actions.map((action, idx) => {
              const iconNode =
                action.icon ??
                (action.iconName ? (
                  <MaterialIcon name={action.iconName} sizePx={18} />
                ) : undefined);
              return (
                <Button
                  key={action.id}
                  label={action.label}
                  icon={iconNode}
                  onClick={() => {
                    if (
                      effectiveNextVideoSrc &&
                      !nextVideoReady &&
                      !videoLoadTimeout
                    )
                      return;

                    if (onOptionRegisterWithFade) {
                      setIsFadingOut(true);
                      onOptionRegisterWithFade({
                        index: idx,
                        id: action.id,
                        label: action.label,
                      });
                    } else {
                      onOptionRegister?.({
                        index: idx,
                        id: action.id,
                        label: action.label,
                      });
                      action.onClick?.();
                    }
                  }}
                  className={classNames(styles.actionBtn, styles.staggeredBtn)}
                  style={{
                    animationDelay: `${idx * ANIMATION.BUTTONS.STAGGER_DELAY}ms`,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className={styles.viewB}>
          {!viewBStage2 ? (
            <>
              <CardNotification
                label={viewBCardLabel ?? cardLabel}
                iconName={viewBCardIconName ?? cardIconName}
                animationVariant="intro"
              />
              <InfoCard className={styles.infoCard} animationVariant="intro">
                <h2 className={styles.infoTitle}>
                  {viewBInfoTitle ?? infoTitle}
                </h2>
                <p className={styles.infoBody}>{viewBInfoBody ?? infoBody}</p>
              </InfoCard>
              <div className={styles.ctaRow}>
                <DirectionalButton
                  label="Actions"
                  fullWidth
                  onClick={() => setViewBStage2(true)}
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.actionsColumn}>
                {actions.map((action, idx) => {
                  const iconNode =
                    action.icon ??
                    (action.iconName ? (
                      <MaterialIcon name={action.iconName} sizePx={18} />
                    ) : undefined);
                  const cornerVariant =
                    idx === 0
                      ? "top"
                      : idx === actions.length - 1
                        ? "bottom"
                        : undefined;
                  return (
                    <Button
                      key={action.id}
                      label={action.label}
                      icon={iconNode}
                      onClick={() => {
                        setViewBSelectedIndex(idx);
                        debugLog("viewB option selected", {
                          index: idx,
                          id: action.id,
                          label: action.label,
                        });
                        action.onClick?.();
                      }}
                      className={styles.optionBtn}
                      style={{ animationDelay: `${idx * 100}ms` }}
                      cornerVariant={
                        cornerVariant as "top" | "bottom" | undefined
                      }
                      fullWidth
                      selected={idx === viewBSelectedIndex}
                    />
                  );
                })}
              </div>
              <div className={styles.ctaRow}>
                <Button
                  label="BACK"
                  fullWidth
                  onClick={() => setViewBStage2(false)}
                  className={styles.viewBBackButton}
                />
                <DirectionalButton
                  label="ACT NOW"
                  fullWidth
                  disabled={viewBSelectedIndex === null}
                  onClick={() => {
                    if (
                      effectiveNextVideoSrc &&
                      !nextVideoReady &&
                      !videoLoadTimeout
                    )
                      return;
                    if (viewBSelectedIndex === null) return;

                    if (onOptionCommitWithFade) {
                      setIsFadingOut(true);
                      onOptionCommitWithFade({
                        selectedIndex: viewBSelectedIndex,
                        selected:
                          viewBSelectedIndex != null
                            ? {
                                id: actions[viewBSelectedIndex].id,
                                label: actions[viewBSelectedIndex].label,
                              }
                            : null,
                      });
                    } else if (onActNowWithFade) {
                      setIsFadingOut(true);
                      onActNowWithFade();
                    } else {
                      debugLog("ACT NOW clicked", {
                        selectedIndex: viewBSelectedIndex,
                        selected:
                          viewBSelectedIndex != null
                            ? actions[viewBSelectedIndex]
                            : null,
                      });
                      onOptionCommit?.({
                        selectedIndex: viewBSelectedIndex,
                        selected:
                          viewBSelectedIndex != null
                            ? {
                                id: actions[viewBSelectedIndex].id,
                                label: actions[viewBSelectedIndex].label,
                              }
                            : null,
                      });
                      onActNow?.();
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {effectiveNextVideoSrc && (
        <VideoPreloader
          src={effectiveNextVideoSrc}
          priority="high"
          onLoadedData={() => {
            debugLog(
              "QuestionSceneShell: Next video ready",
              effectiveNextVideoSrc
            );
            setNextVideoReady(true);
          }}
          onError={(error) => {
            debugWarn(
              "QuestionSceneShell: Failed to preload next video",
              effectiveNextVideoSrc,
              error
            );
            setNextVideoReady(true);
          }}
        />
      )}
    </div>
  );
};

export default QuestionSceneShell;
