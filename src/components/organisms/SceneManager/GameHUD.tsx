"use client";

import React from "react";
import classNames from "classnames";
import ProgressLine from "@/components/atoms/ProgressLine/ProgressLine";
import MuteToggle from "@/components/atoms/MuteToggle/MuteToggle";
import Button from "@/components/atoms/Button/Button";
import { SCENE_MANAGER } from "@/utils/constants";
import { LINKEDIN_SHARE_URL } from "@/utils/environment";
import styles from "./SceneManager.module.scss";
import { useAnalytics } from "@/utils/analytics";

interface GameHUDProps {
  shouldAnimateIn: boolean;
  isCharacterSelect: boolean;
  hideProgressAndScore: boolean;
  totalScore: number;
  audioMuted: boolean;
  onToggleAudio: (muted: boolean) => void;
  hudScoreFlashVariant?: "positive" | "negative";
  characterScenariosLength?: number;
  currentScenarioIndex: number;
  showShareButton?: boolean;
  onShare?: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({
  shouldAnimateIn,
  isCharacterSelect,
  hideProgressAndScore,
  totalScore,
  audioMuted,
  onToggleAudio,
  hudScoreFlashVariant,
  characterScenariosLength = 0,
  currentScenarioIndex,
  showShareButton = false,
  onShare,
}) => {
  const { trackEvent } = useAnalytics();
  const showProgress = !hideProgressAndScore;
  const showScore = !hideProgressAndScore;
  const shouldShowShare = showShareButton && Boolean(onShare);
  const handleToggleAudio = (muted: boolean) => {
    const soundOn = !muted;
    trackEvent("sound_player", { sound_on: soundOn });
    trackEvent(soundOn ? "audio_play" : "audio_pause", { sound_on: soundOn });
    onToggleAudio(muted);
  };

  return (
    <div className={styles.gamehud}>
      <div
        className={classNames(styles["hud-controls"], {
          [styles["hud-controls--enter"]]: shouldAnimateIn,
          [styles["is-character-select"]]: isCharacterSelect,
        })}
      >
        <div className={styles["hud-controls__left"]}>
          <MuteToggle
            aria-label="Toggle sound"
            isOn={!audioMuted}
            color="#ffffff"
            bars={8}
            onToggle={(on) => handleToggleAudio(!on)}
          />
        </div>
        <div
          className={classNames(styles["hud-controls__center"], {
            [styles["is-transparent"]]: hideProgressAndScore,
          })}
        >
          {showProgress &&
            (() => {
              const total = characterScenariosLength;
              const curIndex = Math.min(
                currentScenarioIndex,
                Math.max(total - 1, 0)
              );
              const steps = SCENE_MANAGER.PROGRESS_STEPS;
              const mappedStep =
                total > 1
                  ? Math.round((curIndex / (total - 1)) * (steps - 1))
                  : 0;
              return (
                <ProgressLine
                  steps={steps}
                  initialStep={mappedStep}
                  lineColor="#d5ff5c"
                />
              );
            })()}
        </div>
        <div
          className={classNames(styles["hud-controls__right"], {
            [styles["is-transparent"]]: hideProgressAndScore && !shouldShowShare,
          })}
        >
          {shouldShowShare ? (
            <Button
              as="a"
              href={LINKEDIN_SHARE_URL}
              label="SHARE"
              cornerVariant="all"
              className={styles["hud-share"]}
              onClick={() => onShare?.()}
              data-analytics-type="social-share"
            />
          ) : (
            showScore &&
            (() => {
              const lastVariant = hudScoreFlashVariant;
              const scoreClass = classNames(
                styles["hud-score"],
                lastVariant === "positive"
                  ? styles["hud-score--positive"]
                  : lastVariant === "negative"
                    ? styles["hud-score--negative"]
                    : undefined,
                lastVariant === "positive"
                  ? styles["hud-score--flash-positive"]
                  : lastVariant === "negative"
                    ? styles["hud-score--flash-negative"]
                    : undefined
              );
              return (
                <div className={scoreClass}>
                  <span className={styles["hud-score__corner--bl"]} />
                  <span className={styles["hud-score__corner--br"]} />
                  {`SCC ${totalScore}`}
                </div>
              );
            })()
          )}
        </div>
      </div>
      {!hideProgressAndScore && (
        <>
          <span className={styles["gamehud__corner--tl"]} />
          <span className={styles["gamehud__corner--tr"]} />
          <span className={styles["gamehud__corner--bl"]} />
          <span className={styles["gamehud__corner--br"]} />
        </>
      )}
    </div>
  );
};

export default GameHUD;
