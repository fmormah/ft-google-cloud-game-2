"use client";

import { useEffect } from "react";
import { useAnalytics, type AnalyticsEventParams } from "@/utils/analytics";

const FT_HOST_PATTERN = /ft\.com$/i;

function classifyDestination(href: string | null | undefined) {
  if (!href) return "onsite";
  try {
    const url = new URL(href, window.location.origin);
    if (url.hostname === window.location.hostname) {
      if (url.pathname === "/" || url.pathname === "/index.html") {
        return "hub-home";
      }
      return "internal";
    }
    if (FT_HOST_PATTERN.test(url.hostname)) {
      return "ft-network";
    }
    return "external";
  } catch {
    return "onsite";
  }
}

export function useGlobalClickAnalytics() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const clickable = target.closest<HTMLElement>(
        "[data-analytics-track], a, button, [role='button']"
      );
      if (
        !clickable ||
        clickable.getAttribute("data-analytics-ignore") === "true"
      )
        return;

      const text =
        clickable.getAttribute("data-analytics-text") ||
        clickable.textContent?.trim().replace(/\s+/g, " ").slice(0, 120) ||
        "";
      const href =
        clickable.getAttribute("data-analytics-href") ||
        (clickable instanceof HTMLAnchorElement ? clickable.href : "") ||
        "";
      const analyticsType = clickable.getAttribute("data-analytics-type") || "";
      const analyticsCategory =
        clickable.getAttribute("data-analytics-category") || "";

      const payload: AnalyticsEventParams = {
        click_text: text,
        link_url: href,
        click_category: analyticsCategory || classifyDestination(href),
      };

      if (analyticsType === "social-share") {
        trackEvent("social_share", payload);
        return;
      }

      if (href) {
        trackEvent("link_url", payload);
        return;
      }

      if (text) {
        trackEvent("click_text", payload);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [trackEvent]);
}
