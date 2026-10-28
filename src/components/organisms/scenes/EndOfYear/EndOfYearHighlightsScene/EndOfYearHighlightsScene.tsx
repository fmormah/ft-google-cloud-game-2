"use client";

import React from "react";
import classNames from "classnames";
import Image from "next/image";
import Button from "@/components/atoms/Button/Button";
import DirectionalButton from "@/components/atoms/DirectionalButton/DirectionalButton";
import CardNotification from "@/components/molecules/CardNotification/CardNotification";
import InfoCard from "@/components/molecules/InfoCard/InfoCard";
import CareersHighlightIntroScene from "../CareersHighlightIntroScene/CareersHighlightIntroScene";
import EoYReport, { type EoYReportProps } from "../EoYReport/EoYReport";
import VideoPlayer from "@/components/organisms/VideoPlayer/VideoPlayer";
import {
  eoyHighlightsData,
  type EoyHighlightItem,
  type EoyHighlightOutcome,
} from "@/data/eoy_highlights_data";
import { characterProfiles } from "@/data/character-profiles";
import {
  useGameActionsOptional,
  useGameStoreOptional,
} from "@/store/GameStore";
import { ASSETS } from "@/utils/constants";
import { assetUrl } from "@/utils/assetUrl";
import { isSafari } from "@/utils/browser";
import { toPublicPath } from "@/utils/toPublicPath";
import {
  formatCharacterId,
  useAnalytics,
  type AnalyticsEventName,
} from "@/utils/analytics";
import { deriveEoyReportCopy } from "@/utils/eoy";
import styles from "./EndOfYearHighlightsScene.module.scss";

type EndOfYearStage = "intro" | "highlights" | "report";
function toPublicAssetPath(
  path: string | undefined | null
): string | undefined {
  const publicPath = toPublicPath(path ?? undefined);
  return publicPath ? assetUrl(publicPath) : undefined;
}

function useIsLgUp(): boolean {
  const [isLgUp, setIsLgUp] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLgUp(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isLgUp;
}

export interface EndOfYearHighlightsSceneProps {
  className?: string;

  /**
   * Optional background image for the scene stages.
   * (Per request: no video background implementation yet.)
   */
  backgroundImageSrc?: string;

  /**
   * Provide highlight items explicitly (e.g. in Storybook). If omitted,
   * highlights are derived from `eoyHighlightsData` using the selected character.
   */
  highlights?: EoyHighlightItem[];

  /**
   * Character index override (if not using the store).
   */
  characterIndex?: number;

  /**
   * Override which question indices should be treated as highlights.
   * If not provided, we use each item’s `includeInEndOfYearHighlights`.
   */
  highlightQuestionIndices?: number[];

  /**
   * Outcome mapping (win/loss) by question index. If not provided, defaults to "win".
   * Designs currently only include win copy for some indices; loss falls back to win copy.
   */
  highlightOutcomesByQuestionIndex?: Partial<
    Record<number, EoyHighlightOutcome>
  >;

  /**
   * Start stage – useful for Storybook.
   */
  initialStage?: EndOfYearStage;

  /**
   * Copy overrides for the intro card.
   */
  introTitle?: string;
  introDescription?: string;

  /**
   * CTA label for the last highlight screen.
   */
  annualReviewCtaLabel?: string;

  /**
   * Report (Annual Review) props.
   */
  reportProps?: Partial<EoYReportProps>;

  /**
   * Event callbacks.
   */
  onHome?: () => void;
  onPlayAsNewCharacter?: () => void;
}

const EndOfYearHighlightsScene: React.FC<EndOfYearHighlightsSceneProps> = ({
  className,
  backgroundImageSrc = assetUrl("/assets/images/scene-manager-bg-1.webp"),
  highlights,
  characterIndex,
  highlightQuestionIndices,
  highlightOutcomesByQuestionIndex,
  initialStage = "intro",
  introTitle = "Ready for your annual review?",
  introDescription = "It’s time to take stock — literally. Here’s an overview of your year at Sunrise Cereals Co., how your decisions impacted the organisation and, of course, the share price.",
  annualReviewCtaLabel = "YOUR ANNUAL REVIEW",
  reportProps,
  onHome,
  onPlayAsNewCharacter,
}) => {
  const game = useGameStoreOptional();
  const actions = useGameActionsOptional();
  const { trackEvent } = useAnalytics();
  const isLgUp = useIsLgUp();
  const [isSafariBrowser, setIsSafariBrowser] = React.useState(false);

  React.useEffect(() => {
    setIsSafariBrowser(isSafari());
  }, []);
  const effectiveCharacterIndex =
    characterIndex ?? game?.selectedCharacterIndex ?? 0;
  const character = React.useMemo(
    () => formatCharacterId(effectiveCharacterIndex),
    [effectiveCharacterIndex]
  );

  const derivedSeries = React.useMemo(() => {
    return (
      eoyHighlightsData.find(
        (d) => d.character.index === effectiveCharacterIndex
      )?.series ?? []
    );
  }, [effectiveCharacterIndex]);

  const allHighlights = highlights ?? derivedSeries;

  const includedHighlights = React.useMemo(() => {
    if (
      Array.isArray(highlightQuestionIndices) &&
      highlightQuestionIndices.length
    ) {
      return allHighlights.filter((h) =>
        highlightQuestionIndices.includes(h.questionIndex)
      );
    }
    return allHighlights.filter((h) => h.includeInEndOfYearHighlights);
  }, [allHighlights, highlightQuestionIndices]);

  const resultsForCharacter = React.useMemo(() => {
    const results = Object.values(game?.attemptResults ?? {});
    return results.filter((r) => {
      const [characterIdxStr] = r.scenarioKey.split(":");
      return Number(characterIdxStr) === effectiveCharacterIndex;
    });
  }, [effectiveCharacterIndex, game?.attemptResults]);

  const resultsByQuestionIndex = React.useMemo(() => {
    const map = new Map<number, (typeof resultsForCharacter)[number]>();
    for (const r of resultsForCharacter) {
      map.set(r.questionIndex, r);
    }
    return map;
  }, [resultsForCharacter]);

  const derivedOutcomesByQuestionIndex = React.useMemo(() => {
    const map: Partial<Record<number, EoyHighlightOutcome>> = {};
    for (const r of resultsForCharacter) {
      map[r.questionIndex] = r.isCorrect ? "win" : "loss";
    }
    return map;
  }, [resultsForCharacter]);

  const effectiveOutcomesByQuestionIndex = React.useMemo(() => {
    return {
      ...derivedOutcomesByQuestionIndex,
      ...highlightOutcomesByQuestionIndex,
    };
  }, [derivedOutcomesByQuestionIndex, highlightOutcomesByQuestionIndex]);

  const [stage, setStage] = React.useState<EndOfYearStage>(initialStage);
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const trackedHighlightSlidesRef = React.useRef<Set<number>>(new Set());
  const trackedGameCompleteRef = React.useRef(false);

  React.useEffect(() => {
    // Reset one-time tracking if we go back to the intro stage (e.g. via navigation in Storybook).
    if (stage === "intro") {
      trackedHighlightSlidesRef.current = new Set();
      trackedGameCompleteRef.current = false;
    }
  }, [stage]);

  React.useEffect(() => {
    if (stage !== "highlights") return;
    const slideNumber = highlightIndex + 1;
    if (trackedHighlightSlidesRef.current.has(slideNumber)) return;
    trackedHighlightSlidesRef.current.add(slideNumber);
    const eventName: AnalyticsEventName =
      slideNumber === 1
        ? "Career highlights 1"
        : slideNumber === 2
          ? "Career highlights 2"
          : slideNumber === 3
            ? "Career highlights 3"
            : "Career highlights";
    trackEvent(eventName, { character });
  }, [character, highlightIndex, stage, trackEvent]);

  React.useEffect(() => {
    if (stage !== "report") return;
    if (trackedGameCompleteRef.current) return;
    trackedGameCompleteRef.current = true;
    trackEvent("Game complete", { character });
  }, [character, stage, trackEvent]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.querySelector(".game-container");
    if (!el) return;
    const cls = "is-end-of-year-final";
    if (stage === "report") {
      el.classList.add(cls);
    } else {
      el.classList.remove(cls);
    }
    return () => el.classList.remove(cls);
  }, [stage]);

  React.useEffect(() => {
    setHighlightIndex(0);
  }, [includedHighlights.length]);

  const totalHighlights = includedHighlights.length;
  const currentHighlight = includedHighlights[highlightIndex];

  const currentOutcome: EoyHighlightOutcome =
    (currentHighlight &&
      effectiveOutcomesByQuestionIndex?.[currentHighlight.questionIndex]) ||
    "win";

  const shouldShowHighlightLogo =
    Boolean(currentHighlight?.highlightLogo) && currentOutcome === "win";

  const shouldHideHighlightLogoCard = Boolean(
    currentHighlight?.highlightLogo?.includes(
      "Smart Grid Analytics_Logo@3x_converted"
    )
  );

  const currentCopy =
    currentHighlight &&
    (currentOutcome === "loss"
      ? (currentHighlight.highlightCopyLoss ??
        currentHighlight.highlightCopyWin)
      : currentHighlight.highlightCopyWin);

  const currentTitle =
    currentHighlight &&
    (currentOutcome === "loss"
      ? (currentHighlight.highlightTitleLoss ??
        currentHighlight.highlightTitleWin)
      : currentHighlight.highlightTitleWin);

  const highlightSlideKey = React.useMemo(() => {
    if (stage !== "highlights" || !currentHighlight) return "highlights-none";
    return `highlight-${currentHighlight.questionIndex}-${currentOutcome}`;
  }, [currentHighlight, currentOutcome, stage]);

  const handleHome = React.useCallback(() => {
    if (onHome) return onHome();
    if (actions) {
      actions.resetGame();
      return;
    }
    setHighlightIndex(0);
    setStage("intro");
  }, [actions, onHome]);

  const handlePlayAsNewCharacter = React.useCallback(() => {
    if (onPlayAsNewCharacter) return onPlayAsNewCharacter();
    if (actions) {
      actions.resetGame();
    }
  }, [actions, onPlayAsNewCharacter]);

  const handleStartHighlights = React.useCallback(() => {
    trackEvent("Career highlights", { character });
    if (totalHighlights === 0) {
      setStage("report");
      return;
    }
    setHighlightIndex(0);
    setStage("highlights");
  }, [character, totalHighlights, trackEvent]);

  const handleBack = React.useCallback(() => {
    if (highlightIndex <= 0) {
      setStage("intro");
      return;
    }
    setHighlightIndex((i) => Math.max(0, i - 1));
  }, [highlightIndex]);

  const handleNext = React.useCallback(() => {
    if (highlightIndex >= totalHighlights - 1) {
      setStage("report");
      return;
    }
    setHighlightIndex((i) => Math.min(totalHighlights - 1, i + 1));
  }, [highlightIndex, totalHighlights]);

  const derivedReport = React.useMemo(() => {
    return deriveEoyReportCopy({
      totalScore: game?.totalScore ?? 0,
    });
  }, [game?.totalScore]);

  const totals = React.useMemo(() => {
    let totalGain = 0;
    let totalLoss = 0;
    for (const r of resultsForCharacter) {
      if (r.pointsImpact > 0) totalGain += r.pointsImpact;
      if (r.pointsImpact < 0) totalLoss += Math.abs(r.pointsImpact);
    }
    return { totalGain, totalLoss };
  }, [resultsForCharacter]);

  const effectiveReportProps: EoYReportProps = {
    videoSrc: reportProps?.videoSrc,
    reportTitle: reportProps?.reportTitle ?? derivedReport.reportTitle,
    reportBody: reportProps?.reportBody ?? derivedReport.reportBody,
    totalGain: reportProps?.totalGain ?? totals.totalGain,
    totalLoss: reportProps?.totalLoss ?? totals.totalLoss,
    articleHref:
      reportProps?.articleHref ??
      "https://www.ft.com/partnercontent/google-cloud/how-ai-is-transforming-business.html",
    learnMoreHref:
      reportProps?.learnMoreHref ??
      "https://rsvp.withgoogle.com/events/transforming-business-with-ai/forms/registration",
    playAsNewCharacterHref: reportProps?.playAsNewCharacterHref,
    onPlayAsNewCharacter:
      reportProps?.onPlayAsNewCharacter ?? handlePlayAsNewCharacter,
    className: reportProps?.className,
  };

  const stageBackgroundSrc =
    stage === "highlights"
      ? (currentHighlight?.highlightBackgroundImage ?? backgroundImageSrc)
      : backgroundImageSrc;

  const careerHighlightIntroOverrideSources = React.useMemo(() => {
    const characterName =
      characterProfiles.find((p) => p.index === effectiveCharacterIndex)
        ?.name ?? "Stella";
    const folderBase = `/assets/video/careerHighlighOverrideVideos/${characterName}`;
    const useMobileVariant = !isLgUp;

    const sources = [1, 2, 3].map((i) => {
      // Mobile overrides are provided as webm, but Safari (incl iOS) can't decode webm.
      // In that case, fall back to the mp4 variant.
      if (useMobileVariant && !isSafariBrowser) {
        return `${folderBase}/mobile/${characterName}_Career Highlights_${i}_converted.webm`;
      }
      return `${folderBase}/${characterName}_Career Highlights_${i}.mp4`;
    });

    // Encode spaces etc. so the resulting `src` is a valid URL.
    return sources.map((p) => assetUrl(encodeURI(p)));
  }, [effectiveCharacterIndex, isLgUp, isSafariBrowser]);

  const introVideoSources = React.useMemo(() => {
    // Per request: override Career Highlights intro videos with project-provided assets.
    if (careerHighlightIntroOverrideSources.length) {
      return careerHighlightIntroOverrideSources;
    }
    const sources = includedHighlights
      .map((h) => {
        const override = toPublicAssetPath(h.highlightVideoOverride);
        if (override) return override;
        const result = resultsByQuestionIndex.get(h.questionIndex);
        return toPublicAssetPath(result?.videoSrc);
      })
      .filter(Boolean) as string[];
    // Always provide at least one mp4 source so mobile doesn't render a source-less
    // intro video layer when attempt results are missing (e.g. Storybook, edge cases).
    return sources.length
      ? sources
      : [assetUrl("/assets/video/correct_post_action_video.mp4")];
  }, [
    careerHighlightIntroOverrideSources,
    includedHighlights,
    resultsByQuestionIndex,
  ]);

  const highlightBgVideoSrc = React.useMemo(() => {
    if (stage !== "highlights") return undefined;
    if (!introVideoSources.length) return undefined;
    // Per request: highlight slides should use the same looping videos as the Career Highlights intro
    // (not the per-question outcome videos from attempt results).
    const idx = Math.min(highlightIndex, introVideoSources.length - 1);
    return introVideoSources[idx] ?? introVideoSources[0];
  }, [highlightIndex, introVideoSources, stage]);

  return (
    <section className={classNames(styles.EndOfYearHighlightsScene, className)}>
      <div
        className={styles.backgroundLayer}
        style={{ backgroundImage: `url(${assetUrl(stageBackgroundSrc)})` }}
        aria-hidden
      />
      <div className={styles.backgroundScrim} aria-hidden />

      {stage === "highlights" && highlightBgVideoSrc && (
        <VideoPlayer
          key={`highlight-video-${currentHighlight?.questionIndex ?? "none"}-${highlightBgVideoSrc}`}
          className={styles.highlightVideoBg}
          src={highlightBgVideoSrc}
          autoPlay
          loop
          playsInline
          muted
          preload="auto"
        />
      )}

      {stage === "highlights" && (
        <Button
          label="HOME"
          onClick={handleHome}
          cornerVariant="all"
          className={styles.homeButton}
        />
      )}

      <div className={styles.stage}>
        {stage === "intro" && (
          <CareersHighlightIntroScene
            title={introTitle}
            description={introDescription}
            backgroundVideoSources={introVideoSources}
            onContinue={handleStartHighlights}
            onHome={handleHome}
          />
        )}

        {stage === "highlights" && currentHighlight && (
          <div className={styles.slideUiLayer}>
            <div key={highlightSlideKey} className={styles.metaStack}>
              {shouldShowHighlightLogo && (
                <InfoCard
                  className={classNames(styles.logoCard, {
                    [styles.logoCardHidden]: shouldHideHighlightLogoCard,
                  })}
                  aria-label="Highlight logo"
                >
                  {!shouldHideHighlightLogoCard && (
                    <Image
                      src={assetUrl(currentHighlight.highlightLogo)}
                      alt=""
                      width={70}
                      height={70}
                      className={styles.logoImage}
                    />
                  )}
                </InfoCard>
              )}

              <CardNotification
                variant="default"
                label="YOUR CAREER HIGHLIGHTS"
                iconName="frame_person"
                leftPrefix={`${highlightIndex + 1}/${totalHighlights}`}
                animationVariant="intro"
              />

              <InfoCard animationVariant="intro">
                <h2 className={classNames(styles.highlightCardTitle)}>
                  {currentTitle}
                </h2>
                <p className={classNames(styles.highlightCardBody)}>
                  {currentCopy}
                </p>
              </InfoCard>
            </div>

            <div className={styles.navRow}>
              <DirectionalButton
                label="BACK"
                direction="left"
                fullWidth
                onClick={handleBack}
              />
              <DirectionalButton
                label={
                  highlightIndex >= totalHighlights - 1
                    ? annualReviewCtaLabel
                    : "NEXT"
                }
                direction="right"
                fullWidth
                className={
                  highlightIndex >= totalHighlights - 1
                    ? styles.annualReviewButton
                    : undefined
                }
                onClick={handleNext}
              />
            </div>
          </div>
        )}

        {stage === "report" && (
          <div className={styles.reportWrap}>
            <EoYReport {...effectiveReportProps} />
          </div>
        )}
      </div>
    </section>
  );
};

export default EndOfYearHighlightsScene;
