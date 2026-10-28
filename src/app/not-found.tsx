"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CursorProvider, useCursor } from "@/contexts/CursorContext";
import ActiveCursorWrapper from "@/components/atoms/ActiveCursor/ActiveCursorWrapper";
import HoloInformationScene from "@/components/organisms/scenes/HoloInformationScene/HoloInformationScene";
import { ASSETS } from "@/utils/constants";
import { SITE_URL } from "@/utils/environment";
import { useDevice } from "@/hooks/useDevice";

export default function NotFound() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const { width } = useDevice();
  const isCursorAllowedByWidth = width >= 800;
  const shouldShowCustomCursor = hasMounted && isCursorAllowedByWidth;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canonicalUrl = SITE_URL || "https://transformingbusiness.ft.com";
    const currentPath = window.location.pathname;
    const fullCanonicalUrl = `${canonicalUrl}${currentPath}`;

    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = fullCanonicalUrl;
    document.head.appendChild(link);

    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical && canonical.getAttribute("href") === fullCanonicalUrl) {
        canonical.remove();
      }
    };
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const copy = useMemo(() => {
    return {
      title: "404: Let’s circle back",
      body:
        "It looks like Transforming Business has taken this offline, but it’s on our radar and we’re running the numbers on it. Let’s touch base again soon, and hopefully we’ll have our ducks in a row by the time you’re back.",
      ctaLabel: "Return home",
      ctaDirection: "left" as const,
      onNext: () => router.push("/"),
    };
  }, [router]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.querySelector(".game-container");
    if (!el) return;

    el.classList.add("is-holo-info");

    return () => {
      el.classList.remove("is-holo-info");
    };
  }, []);

  const CursorSetup = () => {
    const { setMode } = useCursor();
    useEffect(() => {
      setMode("default");
    }, [setMode]);
    return null;
  };
  return (
    <CursorProvider>
      <main className="game-container">
        <div
          style={{
            position: "relative",
            height: "100%",
            width: "100%",
            cursor: shouldShowCustomCursor ? "none" : "auto",
          }}
        >
          <CursorSetup />
          <ActiveCursorWrapper
            isVisible={shouldShowCustomCursor}
            invertColors
            hideOnIdle={false}
          />
          <HoloInformationScene
            primaryCtaLabel={copy.ctaLabel}
            primaryCtaDirection={copy.ctaDirection}
            primaryCtaHref="/"
            onNext={copy.onNext}
            backgroundVideoSrc={ASSETS.VIDEO.HOLO_404_BG_LOOP}
            videoSources={ASSETS.VIDEO_SOURCES.HOLO_404_DISPLAY}
          >
            <h2>{copy.title}</h2>
            <p>{copy.body}</p>
          </HoloInformationScene>
        </div>
      </main>
    </CursorProvider>
  );
}
