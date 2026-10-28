"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import CanvasVideoPlayer, {
  type CanvasVideoPlayerHandle,
} from "@/components/organisms/CanvasVideoPlayer/CanvasVideoPlayer";
import CardNotification from "@/components/molecules/CardNotification/CardNotification";
import InfoCard from "@/components/molecules/InfoCard/InfoCard";
import DirectionalButton from "@/components/atoms/DirectionalButton/DirectionalButton";
import styles from "./CharacterSelect.module.scss";
import SwipeBarInstruction from "@/components/molecules/SwipeBarInstruction/SwipeBarInstruction";
import { characterProfiles } from "@/data/character-profiles";
import { ANIMATION } from "@/utils/constants";
import VideoPreloader from "@/components/organisms/VideoPreloader/VideoPreloader";
import Button from "@/components/atoms/Button/Button";
import type { CharacterProfile } from "@/types/game";
import { useIsMobile } from "@/hooks/useDevice";
import { useOptionalSoundManager } from "@/contexts/SoundManagerContext";
import { assetUrl } from "@/utils/assetUrl";

export interface CharacterSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  videoSrc?: string;
  profiles?: CharacterProfile[];
  initialIndex?: number;
  nextVideoSrc?: string;
  onCharacterSelect?: (profile: CharacterProfile) => void;
  onNext?: (nextIndex: number) => void;
  onBack?: (prevIndex: number) => void;
  deferUiUntilVideoEnd?: boolean;
  onPrimaryAction?: (profile: CharacterProfile) => void;
  onPrimaryActionWithFade?: (profile: CharacterProfile) => void;
  onUIVisible?: () => void;
}

const DEFAULT_VIDEO = assetUrl("/assets/video/character_select_video.mp4");

const CharacterSelect: React.FC<CharacterSelectProps> = ({
  className,
  videoSrc = DEFAULT_VIDEO,
  profiles,
  initialIndex = 0,
  nextVideoSrc,
  onCharacterSelect,
  onNext,
  onBack,
  deferUiUntilVideoEnd = false,
  onPrimaryAction,
  onPrimaryActionWithFade,
  onUIVisible,
  ...rest
}) => {
  const videoRef = useRef<CanvasVideoPlayerHandle>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const effectiveNextVideoSrc = isMobile ? undefined : nextVideoSrc;
  const sound = useOptionalSoundManager();
  const [hasPlayedOnce, setHasPlayedOnce] = useState<boolean>(false);
  const timeoutIdsRef = useRef<number[]>([]);
  const setSafeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutIdsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    // Ensure the scene starts at the top of the page whenever it mounts.
    if (typeof window === "undefined") return;
    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)")?.matches ?? false;
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    } catch {
      // Fallback for older browsers that don't support the scroll options object.
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, []);

  const transitionRate = useMemo(() => {
    if (typeof window === "undefined") return 2;
    const isChrome =
      typeof (window as any).chrome !== "undefined" &&
      /Chrome/.test(navigator.userAgent) &&
      !/Edg/.test(navigator.userAgent);
    return isChrome ? 2 : 1;
  }, []);
  const [nextVideoReady, setNextVideoReady] = useState(false);
  const [nextVideoLoadTimeout, setNextVideoLoadTimeout] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const availableProfiles = useMemo<CharacterProfile[]>(
    () => profiles ?? characterProfiles,
    [profiles]
  );
  const [currentIndex, setCurrentIndex] = useState<number>(
    Math.min(
      Math.max(initialIndex, 0),
      Math.max(availableProfiles.length - 1, 0)
    )
  );

  const current = availableProfiles[currentIndex];
  const totalProfiles = availableProfiles.length;
  const characterIndexLabel =
    totalProfiles > 0 ? `${currentIndex + 1}/${totalProfiles}` : undefined;

  const [uiVisible, setUiVisible] = useState<boolean>(false);
  const [showSwipeHint, setShowSwipeHint] = useState<boolean>(true);
  const hasNotifiedUIVisibleRef = useRef<boolean>(false);
  const [infoCardAnimation, setInfoCardAnimation] = useState<
    "intro" | "reverse" | undefined
  >(undefined);
  const [isNavLocked, setIsNavLocked] = useState<boolean>(false);
  const swipeStartXRef = useRef<number | null>(null);
  const swipePointerIdRef = useRef<number | null>(null);
  const swipeMovedRef = useRef<boolean>(false);

  // Safety net: if the video metadata never loads (decode/network/autoplay edge cases),
  // don't block the UI (and downstream cursor visibility) forever.
  useEffect(() => {
    if (uiVisible) return;
    setSafeTimeout(() => {
      setUiVisible(true);
    }, 2000);
  }, [setSafeTimeout, uiVisible]);

  const isUiEnabled = uiVisible && (!isMobile || !showSwipeHint);

  useEffect(() => {
    if (isUiEnabled) {
      setInfoCardAnimation("intro");
      setSafeTimeout(() => {
        setInfoCardAnimation(undefined);
      }, ANIMATION.INFOCARD.INTRO_TOTAL_DURATION);
    }
  }, [isUiEnabled, onUIVisible, setSafeTimeout]);

  useEffect(() => {
    if (!uiVisible) return;
    if (hasNotifiedUIVisibleRef.current) return;
    hasNotifiedUIVisibleRef.current = true;
    onUIVisible?.();
  }, [onUIVisible, uiVisible]);

  const handleHome = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (!hasPlayedOnce) return;
    const profile = availableProfiles[currentIndex];
    if (!profile) return;
    const target = isMobile
      ? profile.characterSelectVideoIndex.mobile
      : profile.characterSelectVideoIndex.desktop;
    if (typeof target === "number") {
      videoRef.current?.transitionToIndexHold(target, transitionRate);
    }
  }, [
    hasPlayedOnce,
    currentIndex,
    availableProfiles,
    transitionRate,
    isMobile,
  ]);

  const changeCharacter = (newIndex: number, isNext: boolean = true) => {
    if (isNavLocked) return;
    setIsNavLocked(true);
    setInfoCardAnimation("reverse");

    setSafeTimeout(() => {
      setCurrentIndex(newIndex);
      setInfoCardAnimation("intro");
      if (isNext) {
        onNext?.(newIndex);
      } else {
        onBack?.(newIndex);
      }
    }, ANIMATION.CHARACTER_CHANGE.REVERSE_TO_INTRO_DELAY);

    setSafeTimeout(() => {
      setInfoCardAnimation(undefined);
    }, ANIMATION.CHARACTER_CHANGE.TOTAL_SEQUENCE_DURATION);

    setSafeTimeout(() => {
      setIsNavLocked(false);
    }, ANIMATION.CHARACTER_CHANGE.TOTAL_SEQUENCE_DURATION);
  };

  const goBack = () => {
    if (isNavLocked) return;
    if (currentIndex === 0) return;
    const nextIdx = currentIndex - 1;
    changeCharacter(nextIdx, false);
  };

  const goNext = () => {
    if (isNavLocked) return;
    if (currentIndex === availableProfiles.length - 1) return;
    const nextIdx = currentIndex + 1;
    changeCharacter(nextIdx, true);
  };

  const commitSwipe = useCallback(
    (endX: number, startX: number) => {
      // While the swipe instructions are showing (mobile-only), the first touch/swipe
      // should dismiss the instructions WITHOUT navigating to a different character.
      if (isMobile && showSwipeHint) {
        setShowSwipeHint(false);
        return;
      }

      const deltaX = endX - startX;
      const threshold = 50;
      if (Math.abs(deltaX) >= threshold) {
        sound?.play("swipeNavigation");
        if (deltaX < 0) {
          if (currentIndex < availableProfiles.length - 1) {
            goNext();
          }
        } else {
          if (currentIndex > 0) {
            goBack();
          }
        }
      }
    },
    [
      availableProfiles.length,
      currentIndex,
      goBack,
      goNext,
      isMobile,
      showSwipeHint,
      sound,
    ]
  );

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    // Only respond to the primary mouse button (touch/pen don't use `button` the same way).
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (swipePointerIdRef.current != null) return; // already tracking a pointer

    // Don't start a swipe gesture when the pointer down began on interactive UI.
    // Otherwise pointer-capture on the root can prevent buttons from receiving clicks.
    const target = e.target as HTMLElement | null;
    if (target) {
      const isOnUiLayer = !!target.closest?.(`.${styles.uiLayer}`);
      const isOnInteractive = !!target.closest?.(
        "button, a, input, textarea, select, [role='button']"
      );
      if (isOnUiLayer || isOnInteractive) return;
    }

    swipePointerIdRef.current = e.pointerId;
    swipeStartXRef.current = e.clientX;
    swipeMovedRef.current = false;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Some browsers can throw if capture isn't allowed; swipe still works without it.
    }
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (swipePointerIdRef.current !== e.pointerId) return;
    if (swipeStartXRef.current == null) return;
    const deltaX = e.clientX - swipeStartXRef.current;
    if (Math.abs(deltaX) > 5) {
      swipeMovedRef.current = true;
    }
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (isNavLocked) return;
    if (swipePointerIdRef.current !== e.pointerId) return;
    if (swipeStartXRef.current == null) return;

    const startX = swipeStartXRef.current;
    const endX = e.clientX;
    swipeStartXRef.current = null;
    swipePointerIdRef.current = null;
    swipeMovedRef.current = false;

    commitSwipe(endX, startX);
  };

  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = () => {
    swipeStartXRef.current = null;
    swipePointerIdRef.current = null;
    swipeMovedRef.current = false;
  };

  useEffect(() => {
    setNextVideoReady(false);
    setNextVideoLoadTimeout(false);
  }, [effectiveNextVideoSrc]);

  useEffect(() => {
    if (effectiveNextVideoSrc && !nextVideoReady) {
      const timeout = setTimeout(() => {
        setNextVideoLoadTimeout(true);
      }, 1500);
      return () => clearTimeout(timeout);
    } else if (nextVideoReady) {
      setNextVideoLoadTimeout(false);
    }
  }, [effectiveNextVideoSrc, nextVideoReady]);

  const handleSelect = useCallback(() => {
    if (effectiveNextVideoSrc && !nextVideoReady && !nextVideoLoadTimeout)
      return;
    if (!current) return;
    if (onPrimaryActionWithFade) {
      setIsFadingOut(true);
      onPrimaryActionWithFade(current);
    } else {
      (onPrimaryAction ?? onCharacterSelect)?.(current);
    }
  }, [
    current,
    nextVideoLoadTimeout,
    nextVideoReady,
    effectiveNextVideoSrc,
    onCharacterSelect,
    onPrimaryAction,
    onPrimaryActionWithFade,
  ]);

  return (
    <div
      ref={rootRef}
      className={classNames(styles.CharacterSelect, className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      {...rest}
    >
      <div className={styles.videoLayer} aria-hidden>
        <CanvasVideoPlayer
          ref={videoRef}
          src={videoSrc}
          muted
          autoPlay={false}
          loop={false}
          enableRewindSfx={false}
          rewindEffectiveRateMobile={0.75}
          disableMobileCanvasTransform
          onError={() => {
            // If the video can't load, still allow the user to navigate/select.
            setUiVisible(true);
          }}
          onLoadedMetadata={() => {
            const profile = availableProfiles[currentIndex];
            const target = profile
              ? isMobile
                ? profile.characterSelectVideoIndex.mobile
                : profile.characterSelectVideoIndex.desktop
              : 0;
            setHasPlayedOnce(true);
            setUiVisible(true);
            if (typeof target === "number") {
              videoRef.current?.skipTo(target);
            }
          }}
          onEnded={() => {
            setHasPlayedOnce(true);
            setUiVisible(true);
            const profile = availableProfiles[0];
            if (profile) {
              const target = isMobile
                ? profile.characterSelectVideoIndex.mobile
                : profile.characterSelectVideoIndex.desktop;
              if (typeof target === "number") {
                videoRef.current?.transitionToIndexHold(target, transitionRate);
              }
            }
          }}
        />
      </div>
      {uiVisible && (
        <div
          className={classNames(styles.swipeHint, {
            [styles.isHidden]: !showSwipeHint,
          })}
          aria-hidden
        >
          <SwipeBarInstruction
            size="sm"
            leftLabel="SWIPE"
            rightLabel="TO EXPLORE CHARACTERS"
            className={styles.swipeHint__img}
          />
        </div>
      )}

      <div
        className={classNames(styles.uiLayer, {
          // Keep the UI layer non-interactive/hidden until the swipe instructions are gone (mobile-only).
          [styles.uiHidden]: !isUiEnabled,
          [styles.uiVisible]: isUiEnabled && deferUiUntilVideoEnd,
          [styles.isFadingOut]: isFadingOut,
        })}
      >
        <div className={styles.metaStack}>
          <CardNotification
            variant="default"
            label={current?.jobTitle ?? ""}
            iconName="frame_person"
            hasAnimation={false}
            leftPrefix={characterIndexLabel}
            animationVariant={infoCardAnimation}
          />
          <InfoCard animationVariant={infoCardAnimation}>
            <h2 className="type-title">{current?.name}</h2>
            <p className="type-body">{current?.characterDescription}</p>
          </InfoCard>
        </div>

        <div className={styles.buttons}>
          <div className={styles.controlsTop}>
            <DirectionalButton
              label="Back"
              direction="left"
              fullWidth
              disabled={isNavLocked || currentIndex === 0}
              onClick={goBack}
            />
            <Button
              label="Select character"
              className={styles.selectButton}
              onClick={handleSelect}
              disabled={
                !!(
                  effectiveNextVideoSrc &&
                  !nextVideoReady &&
                  !nextVideoLoadTimeout
                )
              }
            />
            <DirectionalButton
              label="Next"
              direction="right"
              fullWidth
              disabled={
                isNavLocked || currentIndex === availableProfiles.length - 1
              }
              onClick={goNext}
            />
          </div>
          <div className={styles.controlsBottom}>
            <Button
              label="HOME"
              onClick={handleHome}
              fullWidth
              className={styles.homeButtonMobile}
            />
            <DirectionalButton
              label="Select character"
              direction="right"
              fullWidth
              aria-label="Select character"
              onClick={handleSelect}
            />
          </div>
        </div>
      </div>
      <Button
        label="HOME"
        onClick={handleHome}
        cornerVariant="all"
        className={styles.homeButtonDesktop}
      />

      {effectiveNextVideoSrc && (
        <VideoPreloader
          src={effectiveNextVideoSrc}
          priority="high"
          onLoadedData={() => setNextVideoReady(true)}
          onError={() => setNextVideoReady(true)}
        />
      )}
    </div>
  );
};

export default CharacterSelect;

export type { CharacterProfile };
