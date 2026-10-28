"use client";

import { useEffect, useMemo, useState } from "react";

export interface DeviceState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMobileOrTablet: boolean;
}

export interface UseDeviceOptions {
  mobileMaxPx?: number; // inclusive
  desktopMinPx?: number; // inclusive
}

const DEFAULTS: Required<UseDeviceOptions> = {
  // Align with SCSS breakpoints (spec-mobile-max/spec-desktop-min)
  mobileMaxPx: 1024,
  desktopMinPx: 1650,
};

function classify(width: number, opts: Required<UseDeviceOptions>) {
  const isMobile = width <= opts.mobileMaxPx;
  const isDesktop = width >= opts.desktopMinPx;
  const isTablet = !isMobile && !isDesktop; // between
  return { isMobile, isTablet, isDesktop, isMobileOrTablet: !isDesktop };
}

function isTabletByUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const platform = (navigator as any).platform || "";
  const maxTouchPoints = (navigator as any).maxTouchPoints || 0;

  // iPadOS 13+ reports as Mac; this is the most reliable signal in practice.
  const isIpad =
    /\biPad\b/i.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);

  // Android tablets typically include "Android" but omit "Mobile".
  const isAndroidTablet = /\bAndroid\b/i.test(ua) && !/\bMobile\b/i.test(ua);

  return isIpad || isAndroidTablet;
}

export function useDevice(options?: UseDeviceOptions): DeviceState {
  const opts = useMemo(() => ({ ...DEFAULTS, ...options }), [options]);

  const [size, setSize] = useState(() => ({
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
  }));

  useEffect(() => {
    function onResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const classes = classify(size.width, opts);

  return { width: size.width, height: size.height, ...classes };
}

export function useIsMobile(options?: UseDeviceOptions) {
  return useDevice(options).isMobile;
}

/**
 * Tablet detector that prefers layout breakpoints but also treats iPads/Android tablets
 * as tablets even when their viewport width falls under the "mobile" breakpoint.
 */
export function useIsTablet(options?: UseDeviceOptions) {
  const device = useDevice(options);
  return device.isTablet || isTabletByUserAgent();
}

export function useIsMobileOrTablet(options?: UseDeviceOptions) {
  return useDevice(options).isMobileOrTablet;
}
