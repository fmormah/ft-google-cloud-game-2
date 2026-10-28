"use client";

import React, { useRef } from "react";
import Image from "next/image";
import classNames from "classnames";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import InfoCard from "../../molecules/InfoCard/InfoCard";
import CardNotification from "../../molecules/CardNotification/CardNotification";
import Button from "../../atoms/Button/Button";
import HologramDisplay from "../../molecules/HologramDisplay/HologramDisplay";
import styles from "./ReportScene.module.scss";
import reportWatchImg from "../../../../public/assets/images/report-watch-img.png";
import { MaterialIcon } from "@/components/atoms/Icon";
import { useGameActionsOptional, useGameStoreOptional } from "@/store/GameStore";
import DirectionalButton from "@/components/atoms/DirectionalButton/DirectionalButton";
import EngineNotification from "@/components/molecules/EngineNotification/EngineNotification";
import { useAnalytics, formatCharacterId } from "@/utils/analytics";
import type { CharacterScenarioSet } from "@/types/game";
import { characterIndex0Scenarios } from "@/data/scenarios/character_index_0_scenarios";
import { characterIndex1Scenarios } from "@/data/scenarios/character_index_1_scenarios";
import { characterIndex2Scenarios } from "@/data/scenarios/character_index_2_scenarios";
import { characterIndex3Scenarios } from "@/data/scenarios/character_index_3_scenarios";
import { assetUrl } from "@/utils/assetUrl";
import { LINKEDIN_SHARE_URL } from "@/utils/environment";

export interface ReportSceneProps {
  className?: string;
  videoSrc?: string;
  reportTitle?: string;
  reportBody?: string;
}

const ReportScene: React.FC<ReportSceneProps> = ({
  className,
  videoSrc = assetUrl("/assets/video/correct_post_action_video.mp4"),
  reportTitle,
  reportBody,
}) => {
  const game = useGameStoreOptional();
  const actions = useGameActionsOptional();
  const { trackEvent } = useAnalytics();
  const playCounterRef = useRef(0);
  const totalScorePadded = String(
    Math.max(0, game?.totalScore ?? 923)
  ).padStart(4, "0");
  const lowestPct = "01.13%";
  const highestPct = "10.12%";

  const SCENARIOS: Record<number, CharacterScenarioSet> = {
    0: characterIndex0Scenarios,
    1: characterIndex1Scenarios,
    2: characterIndex2Scenarios,
    3: characterIndex3Scenarios,
  };

  const selectedCharacterIndex = game?.selectedCharacterIndex ?? 0;
  const totalQuestionsCount =
    SCENARIOS[selectedCharacterIndex]?.questions.length ?? 0;
  const correctCount = game?.chosenActionIcons.length ?? 0;

  type ReportVariant =
    | "all-correct"
    | "more-correct-than-incorrect"
    | "more-incorrect-than-correct"
    | "all-incorrect";

  let variant: ReportVariant = "more-correct-than-incorrect";
  if (totalQuestionsCount > 0) {
    if (correctCount === totalQuestionsCount) {
      variant = "all-correct";
    } else if (correctCount === 0) {
      variant = "all-incorrect";
    } else if (correctCount > totalQuestionsCount / 2) {
      variant = "more-correct-than-incorrect";
    } else {
      variant = "more-incorrect-than-correct";
    }
  }

  let defaultReportTitle: string;
  let defaultReportBody: string;

  switch (variant) {
    case "all-correct":
      defaultReportTitle = "Sunrise Cereals’ best year on record";
      defaultReportBody =
        "The many different AI-powered solutions you’ve introduced over the year have put Sunrise Cereals in a commanding position in the cereals space, setting the organisation up to grow sustainably into the future.";
      break;
    case "more-correct-than-incorrect":
      defaultReportTitle = "Sunrise Cereals outpaces competitors";
      defaultReportBody =
        "Thanks to the AI-powered solutions you’ve introduced this year, Sunrise Cereals’ resilience has been increased, increasing shareholder confidence. But the Board have identified some areas for improvement.";
      break;
    case "more-incorrect-than-correct":
      defaultReportTitle =
        "Sunrise Cereals fails to capitalise on opportunities";
      defaultReportBody =
        "Your reluctance to embrace new technologies has directly impacted Sunrise Cereals’ resilience. Some board members express concerns that your decision-making may hamper Sunrise Cereals’ long-term growth ambitions.";
      break;
    case "all-incorrect":
    default:
      defaultReportTitle = "Underwhelming year for Sunrise Cereals";
      defaultReportBody =
        "With the business landscape fast transforming, businesses that don’t adapt and leverage new technologies are being left behind. Relying on outdated solutions has weakened Sunrise Cereals’ resilience and compromised its goals for growth.";
      break;
  }

  const effectiveReportTitle = reportTitle ?? defaultReportTitle;
  const effectiveReportBody = reportBody ?? defaultReportBody;

  const handlePlayAgain = () => {
    playCounterRef.current += 1;
    trackEvent("play_again", {
      character:
        game?.selectedCharacterIndex !== undefined
          ? formatCharacterId(game.selectedCharacterIndex)
          : undefined,
      counter: String(playCounterRef.current),
    });
    actions?.resetGame();
  };

  const handleYearInReview = () => {
    trackEvent("year_in_review", {
      character:
        game?.selectedCharacterIndex !== undefined
          ? formatCharacterId(game.selectedCharacterIndex)
          : undefined,
    });
  };

  const handleShare = () => {
    trackEvent("share", {
      character:
        game?.selectedCharacterIndex !== undefined
          ? formatCharacterId(game.selectedCharacterIndex)
          : undefined,
    });
  };
  return (
    <div className={classNames(styles.ReportScene, className)}>
      <div className={styles.videoLayer}>
        <VideoPlayer
          src={videoSrc}
          autoPlay
          playsInline
          muted
          loop={false}
          preload="auto"
          className={styles.video}
        />
      </div>

      <div className={styles.uiLayer}>
        <EngineNotification className={styles.engineNotice} />
        <div className={styles.reportGrid}>
          <div className={classNames(styles.panel, styles.panelA)}>
            <InfoCard className={styles.infoBox}>
              <h2 className={styles.infoTitle}>{effectiveReportTitle}</h2>
              <p className={styles.infoBody}>{effectiveReportBody}</p>
            </InfoCard>
          </div>
          <div className={classNames(styles.panel, styles.panelB)}>
            <div className={styles.panelStack}>
              <CardNotification
                variant="default"
                label="GAME WALKTHROUGH"
                iconName="frame_person"
                hasAnimation={false}
                animationVariant="intro"
              />
              <InfoCard className={styles.sessionStats}>
                <div className={styles.statsHeader}>
                  <div className={styles.statsTitleBlock}>
                    <div className={styles.statsTitleSmall}>STOCK SCORE</div>
                    <div className={styles.statsSubtitle}>OVERALL</div>
                  </div>
                  <div className={styles.statsNumber}>{totalScorePadded}</div>
                </div>

                <div className={styles.rule} />

                <div className={styles.statsRow}>
                  <div className={styles.statBlock}>
                    <div className={styles.statKicker}>LOWEST</div>
                    <div className={styles.statLabel}>STOCK</div>
                    <div
                      className={classNames(styles.statValue, styles.negative)}
                    >
                      {lowestPct}
                    </div>
                  </div>
                  <div className={styles.statBlock}>
                    <div className={styles.statKicker}>HIGHEST</div>
                    <div className={styles.statLabel}>STOCK</div>
                    <div
                      className={classNames(styles.statValue, styles.positive)}
                    >
                      {highestPct}
                    </div>
                  </div>
                </div>

                <div className={styles.rule} />

                <div className={styles.actionsRow}>
                  <div className={styles.actionsLeft}>
                    <div className={styles.correctClicks}>CORRECT CLICKS</div>
                  </div>
                  <div className={styles.actionsRight}>
                    {(
                      game?.chosenActionIcons ?? ["graph_5", "graph_3", "build"]
                    ).map((icon, i) => (
                      <div className={styles.actionItem} key={`${icon}-${i}`}>
                        <span className={styles.actionIcon}>
                          <MaterialIcon name={icon} sizePx={20} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
          <div className={classNames(styles.panel, styles.panelC)}>
            <div className={styles.watchButton}>
              <Button
                aria-label="watch your year in review"
                className={styles.watchButtonButton}
                fullWidth
                label={"" as unknown as string}
                onClick={handleYearInReview}
              >
                <Image
                  alt=""
                  className={styles.watchImage}
                  src={reportWatchImg}
                />
              </Button>
            </div>
          </div>
          <div className={classNames(styles.panel, styles.panelD)}>
            <div className={styles.holoWrap}>
              <HologramDisplay className={styles.holo} videoSrc={videoSrc} />
            </div>
          </div>
          <div className={classNames(styles.panel, styles.panelE)}>
            <div className={styles.panelEButtons}>
              <DirectionalButton
                as="a"
                href={LINKEDIN_SHARE_URL}
                target="_blank"
                rel="noreferrer noopener"
                fullWidth
                label="Share"
                direction="left"
                className={styles.panelEButton}
                onClick={handleShare}
                data-analytics-type="social-share"
              />
              <DirectionalButton
                label="New character"
                direction="right"
                className={styles.panelEButton}
                onClick={handlePlayAgain}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportScene;
