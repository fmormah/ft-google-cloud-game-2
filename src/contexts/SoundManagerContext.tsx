"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useGameSelectorOptional } from "@/store/GameStore";
import { assetUrl } from "@/utils/assetUrl";

export type SfxKey =
  | "buttonClick"
  | "openingSceneClick"
  | "swipeNavigation"
  | "rewind"
  | "bgMusic";

type SfxConfig = {
  src?: string;
  sources?: Array<{ src: string; type?: string }>;
  volume?: number;
  poolSize?: number; // only for one-shots
  loop?: boolean;
};

const SFX: Record<SfxKey, SfxConfig> = {
  buttonClick: {
    src: assetUrl("/assets/audio/button_click_converted.webm"),
    // Reduce just the default UI click SFX by 25%.
    volume: 0.75,
    poolSize: 6,
  },
  openingSceneClick: {
    src: assetUrl("/assets/audio/opening_scene_click_converted.webm"),
    volume: 1,
    poolSize: 4,
  },
  swipeNavigation: {
    src: assetUrl("/assets/audio/swipe_navigation_converted.webm"),
    volume: 1,
    poolSize: 4,
  },
  rewind: {
    src: assetUrl("/assets/audio/rewind_converted.webm"),
    volume: 1,
    loop: true,
  },
  bgMusic: {
    sources: [
      { src: assetUrl("/assets/audio/bg_music.mp3"), type: "audio/mpeg" },
    ],
    // Keep this comfortably under SFX volume.
    volume: 0.35,
    loop: true,
  },
};

type Pool = { audios: HTMLAudioElement[]; index: number };

export interface SoundManager {
  muted: boolean;
  play: (key: Exclude<SfxKey, "rewind" | "bgMusic">) => void;
  startLoop: (key: "rewind" | "bgMusic") => void;
  stopLoop: (key: "rewind" | "bgMusic") => void;
}

const SoundManagerContext = createContext<SoundManager | undefined>(undefined);

function resolveAudioSrc(cfg: SfxConfig): string {
  if (cfg.src) return cfg.src;
  const sources = cfg.sources ?? [];
  if (sources.length === 0) return "";

  // Client-only: pick the first playable source (prefer earlier entries).
  if (typeof document !== "undefined") {
    try {
      const test = document.createElement("audio");
      for (const s of sources) {
        if (!s.type) return s.src;
        const can = test.canPlayType(s.type);
        if (can === "probably" || can === "maybe") return s.src;
      }
    } catch {}
  }

  return sources[0].src;
}

function safePlay(audio: HTMLAudioElement) {
  try {
    const p = audio.play();
    if (p && typeof (p as Promise<void>).catch === "function") {
      (p as Promise<void>).catch(() => {});
    }
  } catch {}
}

function safePlayLoopIfPaused(audio: HTMLAudioElement) {
  // Avoid calling play() repeatedly on already-playing loop audio.
  // iOS Safari can get unstable/jittery when media elements constantly re-issue play().
  try {
    if (!audio.paused) return;
  } catch {}
  safePlay(audio);
}

function isDocumentVisible(): boolean {
  return (
    typeof document === "undefined" || document.visibilityState === "visible"
  );
}

function cleanupAudioElement(audio: HTMLAudioElement) {
  try {
    audio.pause();
  } catch {}
  try {
    // Reset for next use and hint the browser it can release resources.
    audio.currentTime = 0;
  } catch {}
  try {
    audio.removeAttribute("src");
    audio.load();
  } catch {}
}

export const SoundManagerProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const muted = useGameSelectorOptional((s) => s.audioMuted, true);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const poolsRef = useRef<Partial<Record<SfxKey, Pool>>>({});
  type LoopKey = "rewind" | "bgMusic";
  const loopAudioRef = useRef<Partial<Record<LoopKey, HTMLAudioElement>>>({});
  const activeLoopsRef = useRef<Set<LoopKey>>(new Set());
  const wasPlayingOnHideRef = useRef<Set<LoopKey>>(new Set());

  const getPool = useCallback(
    (key: Exclude<SfxKey, "rewind" | "bgMusic">): Pool => {
      const existing = poolsRef.current[key];
      if (existing) return existing;
      const cfg = SFX[key];
      const resolvedSrc = resolveAudioSrc(cfg);
      const size = Math.max(1, cfg.poolSize ?? 4);
      const audios: HTMLAudioElement[] = Array.from({ length: size }, () => {
        const a = new Audio(resolvedSrc);
        a.preload = "auto";
        a.loop = false;
        a.volume = cfg.volume ?? 1;
        a.muted = mutedRef.current;
        return a;
      });
      const pool: Pool = { audios, index: 0 };
      poolsRef.current[key] = pool;
      return pool;
    },
    []
  );

  const getLoopAudio = useCallback((key: LoopKey): HTMLAudioElement => {
    const existing = loopAudioRef.current[key];
    if (existing) return existing;
    const cfg = SFX[key];
    const resolvedSrc = resolveAudioSrc(cfg);
    const a = new Audio(resolvedSrc);
    a.preload = "auto";
    a.loop = true;
    a.volume = cfg.volume ?? 1;
    a.muted = mutedRef.current;
    loopAudioRef.current[key] = a;
    return a;
  }, []);

  // Keep all known audio elements in sync with mute state.
  useEffect(() => {
    const pools = poolsRef.current;
    (Object.keys(pools) as SfxKey[]).forEach((key) => {
      const pool = pools[key];
      if (!pool) return;
      pool.audios.forEach((a) => {
        a.muted = muted;
        if (muted) {
          try {
            a.pause();
            a.currentTime = 0;
          } catch {}
        }
      });
    });

    const loopAudios = loopAudioRef.current;
    (Object.keys(loopAudios) as LoopKey[]).forEach((key) => {
      const loopAudio = loopAudios[key];
      if (!loopAudio) return;
      loopAudio.muted = muted;
      if (muted) {
        try {
          loopAudio.pause();
          // Preserve bg music position on mute; reset only "mechanical" loops.
          if (key !== "bgMusic") loopAudio.currentTime = 0;
        } catch {}
      } else if (
        activeLoopsRef.current.has(key) &&
        (typeof document === "undefined" ||
          document.visibilityState === "visible")
      ) {
        safePlayLoopIfPaused(loopAudio);
      }
    });

    // If a loop was marked active while muted, ensure it actually starts once unmuted
    // (even if the loop audio element hasn't been created yet).
    if (
      !muted &&
      (typeof document === "undefined" ||
        document.visibilityState === "visible")
    ) {
      activeLoopsRef.current.forEach((key) => {
        const a = loopAudioRef.current[key] ?? getLoopAudio(key);
        a.muted = false;
        safePlayLoopIfPaused(a);
      });
    }
  }, [getLoopAudio, muted]);

  // Pause audio when the page/app is not visible (mobile lock screen, app switcher, tab switch),
  // and resume loops that were previously playing when we become visible again.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof document === "undefined") return;

    const pauseAll = () => {
      // Stop any one-shots that may still be playing.
      const pools = poolsRef.current;
      (Object.keys(pools) as SfxKey[]).forEach((key) => {
        const pool = pools[key];
        if (!pool) return;
        pool.audios.forEach((a) => {
          try {
            a.pause();
            a.currentTime = 0;
          } catch {}
        });
      });

      // Pause active loops (preserve currentTime so they can resume smoothly).
      wasPlayingOnHideRef.current = new Set();
      const loopAudios = loopAudioRef.current;
      (Object.keys(loopAudios) as LoopKey[]).forEach((key) => {
        const a = loopAudios[key];
        if (!a) return;
        const wasPlaying = !a.paused;
        if (wasPlaying) wasPlayingOnHideRef.current.add(key);
        try {
          a.pause();
        } catch {}
      });
    };

    const resumeLoops = () => {
      if (muted) return;
      // Resume loops that should be active.
      // - Always attempt to resume bgMusic if it's marked active (covers cases where it was
      //   activated while hidden, or got paused by the OS / tab lifecycle).
      // - For other loops (e.g. "rewind"), only resume if they were actually playing when
      //   we were backgrounded (avoids accidentally starting a loop that was "active" but
      //   already paused/stopped for other reasons).
      activeLoopsRef.current.forEach((key) => {
        const shouldResume =
          key === "bgMusic" || wasPlayingOnHideRef.current.has(key);
        if (!shouldResume) return;
        const a = loopAudioRef.current[key] ?? getLoopAudio(key);
        safePlayLoopIfPaused(a);
      });
      wasPlayingOnHideRef.current = new Set();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        resumeLoops();
      } else {
        pauseAll();
      }
    };

    // Standard page visibility.
    document.addEventListener("visibilitychange", handleVisibility);
    // Fires reliably on iOS Safari when navigating away / backgrounding.
    window.addEventListener("pagehide", pauseAll);
    // Page Lifecycle API (Chrome/Android).
    window.addEventListener("freeze", pauseAll as EventListener);
    window.addEventListener("resume", resumeLoops as EventListener);

    // Ensure we start in the correct state (e.g. provider mounts while hidden).
    handleVisibility();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", pauseAll);
      window.removeEventListener("freeze", pauseAll as EventListener);
      window.removeEventListener("resume", resumeLoops as EventListener);
    };
  }, [getLoopAudio, muted]);

  const play = useCallback(
    (key: Exclude<SfxKey, "rewind" | "bgMusic">) => {
      if (typeof window === "undefined") return;
      if (mutedRef.current) return;
      if (!isDocumentVisible()) return;
      const pool = getPool(key);
      const audio = pool.audios[pool.index % pool.audios.length];
      pool.index = (pool.index + 1) % pool.audios.length;
      audio.muted = mutedRef.current;
      // Re-apply configured volume at playback time so adjustments are picked up
      // even if the pool was created before a config change (e.g. hot reload).
      audio.volume = SFX[key]?.volume ?? 1;
      try {
        audio.currentTime = 0;
      } catch {}
      safePlay(audio);

      // iOS Safari can pause a currently playing HTMLAudioElement (e.g. bgMusic)
      // when another one-shot audio starts. If we have active loops, make a best-effort
      // attempt to resume them after this SFX completes.
      // This is intentionally conservative:
      // - Only resumes loops that are marked active
      // - Only runs when not muted and the document is visible
      const resumeActiveLoops = () => {
        if (mutedRef.current) return;
        if (!isDocumentVisible()) return;
        activeLoopsRef.current.forEach((loopKey) => {
          const loopAudio =
            loopAudioRef.current[loopKey] ?? getLoopAudio(loopKey);
          loopAudio.muted = mutedRef.current;
          safePlayLoopIfPaused(loopAudio);
        });
      };

      // Prefer resuming when the one-shot ends; also schedule a fallback in case
      // `ended` doesn't fire due to platform quirks.
      audio.onended = () => {
        // Only run once for this playback.
        audio.onended = null;
        resumeActiveLoops();
      };
      window.setTimeout(resumeActiveLoops, 350);
    },
    [getPool]
  );

  const startLoop = useCallback(
    (key: LoopKey) => {
      if (typeof window === "undefined") return;
      activeLoopsRef.current.add(key);
      if (mutedRef.current) return;
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      )
        return;
      const audio = getLoopAudio(key);
      audio.muted = mutedRef.current;
      safePlayLoopIfPaused(audio);
    },
    [getLoopAudio]
  );

  const stopLoop = useCallback((key: LoopKey) => {
    activeLoopsRef.current.delete(key);
    const audio = loopAudioRef.current[key];
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
  }, []);

  // Cleanup on unmount (useful for hot reload / route changes).
  useEffect(() => {
    return () => {
      try {
        // One-shots
        const pools = poolsRef.current;
        (Object.keys(pools) as SfxKey[]).forEach((key) => {
          const pool = pools[key];
          if (!pool) return;
          pool.audios.forEach(cleanupAudioElement);
        });

        // Loops
        const loops = loopAudioRef.current;
        (Object.keys(loops) as LoopKey[]).forEach((key) => {
          const a = loops[key];
          if (!a) return;
          cleanupAudioElement(a);
        });
      } catch {}
      activeLoopsRef.current = new Set();
      wasPlayingOnHideRef.current = new Set();
      poolsRef.current = {};
      loopAudioRef.current = {};
    };
  }, []);

  const value = useMemo<SoundManager>(() => {
    return { muted, play, startLoop, stopLoop };
  }, [muted, play, startLoop, stopLoop]);

  return (
    <SoundManagerContext.Provider value={value}>
      {children}
    </SoundManagerContext.Provider>
  );
};

export const useSoundManager = (): SoundManager => {
  const ctx = useContext(SoundManagerContext);
  if (!ctx)
    throw new Error("useSoundManager must be used within SoundManagerProvider");
  return ctx;
};

export const useOptionalSoundManager = (): SoundManager | undefined => {
  return useContext(SoundManagerContext);
};
