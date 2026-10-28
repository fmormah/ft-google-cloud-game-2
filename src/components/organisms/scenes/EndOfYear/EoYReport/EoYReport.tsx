"use client";

import classNames from "classnames";
import React from "react";
import HologramDisplay from "@/components/molecules/HologramDisplay/HologramDisplay";
import EngineNotification from "@/components/molecules/EngineNotification/EngineNotification";
import InfoCard from "@/components/molecules/InfoCard/InfoCard";
import CardNotification from "@/components/molecules/CardNotification/CardNotification";
import Button from "@/components/atoms/Button/Button";
import DirectionalButton from "@/components/atoms/DirectionalButton/DirectionalButton";
import { MaterialIcon } from "@/components/atoms/Icon";
import { useGameStoreOptional } from "@/store/GameStore";
import VideoPlayer from "@/components/organisms/VideoPlayer/VideoPlayer";
import { ASSETS, GAME_LOGIC } from "@/utils/constants";
import styles from "./EoYReport.module.scss";
import { assetUrl } from "@/utils/assetUrl";
import { formatCharacterId, useAnalytics } from "@/utils/analytics";
import type { VideoSource } from "@/types/video";
import { getEoyPerformanceTier } from "@/utils/eoy";
import { characterProfiles } from "@/data/character-profiles";

export interface EoYReportProps {
  className?: string;
  /**
   * Optional override for the holo display content.
   * If omitted, the report will show a trophy (gold/silver/bronze) based on score.
   */
  videoSrc?: string;
  videoSources?: VideoSource[];
  backgroundVideoSrc?: string;
  reportTitle?: string;
  reportBody?: string;
  totalGain?: number;
  totalLoss?: number;
  articleHref?: string;
  learnMoreHref?: string;
  playAsNewCharacterHref?: string;
  onPlayAsNewCharacter?: () => void;
}

const EoYReport: React.FC<EoYReportProps> = ({
  className,
  videoSrc,
  videoSources,
  backgroundVideoSrc = assetUrl("/assets/video/EOY-NOSOUND_converted.webm"),
  reportTitle = "Incident Report",
  reportBody = "Summary details and key insights appear here for the report.",
  totalGain = 150,
  totalLoss = 150,
  articleHref = "https://www.ft.com/partnercontent/google-cloud/how-ai-is-transforming-business.html",
  learnMoreHref = "https://rsvp.withgoogle.com/events/transforming-business-with-ai/forms/registration",
  playAsNewCharacterHref,
  onPlayAsNewCharacter,
}) => {
  const game = useGameStoreOptional();
  const { trackEvent } = useAnalytics();
  const character =
    game?.selectedCharacterIndex !== undefined
      ? formatCharacterId(game.selectedCharacterIndex)
      : undefined;

  const handleClickArticle = React.useCallback(() => {
    trackEvent("Click article", { character });
  }, [character, trackEvent]);

  const handleClickLearnMore = React.useCallback(() => {
    trackEvent("Click learn more", { character });
  }, [character, trackEvent]);

  const handleRestartGame = React.useCallback(() => {
    trackEvent("Restart game", { character });
    onPlayAsNewCharacter?.();
  }, [character, onPlayAsNewCharacter, trackEvent]);
  const totalScore = Math.max(
    0,
    game?.totalScore ?? GAME_LOGIC.DEFAULT_STARTING_SCORE
  );
  const stockScorePadded = String(totalScore).padStart(4, "0");

  const trophyTier = React.useMemo(
    () => getEoyPerformanceTier(totalScore),
    [totalScore]
  );
  const trophyVideoSources: VideoSource[] = React.useMemo(() => {
    switch (trophyTier) {
      case "gold":
        return ASSETS.VIDEO_SOURCES.TROPHY_GOLD;
      case "silver":
        return ASSETS.VIDEO_SOURCES.TROPHY_SILVER;
      case "bronze":
      default:
        return ASSETS.VIDEO_SOURCES.TROPHY_BRONZE;
    }
  }, [trophyTier]);

  const hologramProps = React.useMemo(() => {
    if (videoSources?.length) return { videoSources };
    if (videoSrc) return { videoSrc };
    return { videoSources: trophyVideoSources };
  }, [trophyVideoSources, videoSources, videoSrc]);

  const characterName = React.useMemo(() => {
    if (game?.selectedCharacterIndex === undefined) return undefined;
    const profile = characterProfiles.find(
      (p) => p.index === game.selectedCharacterIndex
    );
    return profile?.name?.toUpperCase();
  }, [game?.selectedCharacterIndex]);

  return (
    <section className={classNames(styles.EoYReport, className)}>
      <div className={styles.backgroundVideoLayer} aria-hidden>
        <VideoPlayer
          className={styles.backgroundVideo}
          src={backgroundVideoSrc}
          autoPlay
          loop
          playsInline
          muted
          preload="auto"
        />
      </div>
      <div className={styles.backgroundScrim} aria-hidden />

      <div className={styles.inner}>
        <EngineNotification
          className={styles.engineNotice}
          statusBase={characterName ?? "ENGINE RUNNING"}
        />

        <div className={styles.grid}>
          <div className={styles.leftCol}>
            <HologramDisplay className={styles.holo} {...hologramProps} />
          </div>

          <div className={styles.rightCol}>
            <InfoCard className={styles.infoBox}>
              <h2 className={styles.infoTitle}>{reportTitle}</h2>
              <p className={styles.infoBody}>{reportBody}</p>
            </InfoCard>

            <div className={styles.panelStack}>
              <CardNotification
                variant="default"
                label="STOCK OVERVIEW"
                iconName="insert_chart"
                hasAnimation={false}
              />

              <InfoCard className={styles.stockCard}>
                <div className={styles.stockHeader}>
                  <div className={styles.stockTitleBlock}>
                    <div className={styles.stockTicker}>SSC</div>
                    <div className={styles.stockName}>SUNRISE CEREAL CO.</div>
                  </div>
                  <div className={styles.stockScore}>{stockScorePadded}</div>
                </div>

                <div className={styles.rule} />

                <div className={styles.gainLossRow}>
                  <div className={styles.gainLossBlock}>
                    <span
                      className={classNames(
                        styles.gainLossIconBox,
                        styles.gainLossIconBoxPositive
                      )}
                      aria-hidden
                    >
                      <MaterialIcon name="arrow_drop_up" sizePx={50} />
                    </span>
                    <div className={styles.gainLossText}>
                      <div className={styles.gainLossLabel}>TOTAL GAIN</div>
                      <div className={styles.gainLossValue}>{totalGain}</div>
                    </div>
                  </div>

                  <div className={styles.gainLossBlock}>
                    <span
                      className={classNames(
                        styles.gainLossIconBox,
                        styles.gainLossIconBoxNegative
                      )}
                      aria-hidden
                    >
                      <MaterialIcon name="arrow_drop_down" sizePx={50} />
                    </span>
                    <div className={styles.gainLossText}>
                      <div className={styles.gainLossLabel}>TOTAL LOSS</div>
                      <div className={styles.gainLossValue}>{totalLoss}</div>
                    </div>
                  </div>
                </div>
              </InfoCard>
            </div>

            <div className={styles.linkButtons}>
              <Button
                as="a"
                href={articleHref}
                label="Read article"
                className={classNames(styles.linkButton, styles.linkButtonLeft)}
                fullWidth
                onClick={handleClickArticle}
              />
              <Button
                as="a"
                href={learnMoreHref}
                label="Learn more"
                className={classNames(
                  styles.linkButton,
                  styles.linkButtonRight
                )}
                fullWidth
                onClick={handleClickLearnMore}
              />
            </div>

            {playAsNewCharacterHref ? (
              <DirectionalButton
                as="a"
                href={playAsNewCharacterHref}
                fullWidth
                label="Play as a new character"
                direction="right"
                className={styles.playAgainButton}
                onClick={handleRestartGame}
              />
            ) : (
              <DirectionalButton
                fullWidth
                label="Play as a new character"
                direction="right"
                className={styles.playAgainButton}
                onClick={handleRestartGame}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EoYReport;
