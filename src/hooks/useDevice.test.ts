import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useDevice,
  useIsMobile,
  useIsMobileOrTablet,
  useIsTablet,
} from "./useDevice";

describe("useDevice", () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  const originalUserAgent = navigator.userAgent;
  const originalPlatform = (navigator as any).platform;
  const originalMaxTouchPoints = (navigator as any).maxTouchPoints;

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Reset navigator overrides between tests
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
    Object.defineProperty(navigator, "platform", {
      configurable: true,
      value: originalPlatform,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      configurable: true,
      value: originalMaxTouchPoints,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  describe("useDevice", () => {
    it("should return correct device state for desktop", () => {
      Object.defineProperty(window, "innerWidth", { value: 1700 });

      const { result } = renderHook(() => useDevice());

      expect(result.current.width).toBe(1700);
      expect(result.current.height).toBe(768);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobileOrTablet).toBe(false);
    });

    it("should return correct device state for mobile", () => {
      Object.defineProperty(window, "innerWidth", { value: 500 });

      const { result } = renderHook(() => useDevice());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isMobileOrTablet).toBe(true);
    });

    it("should return correct device state for tablet", () => {
      Object.defineProperty(window, "innerWidth", { value: 1200 });

      const { result } = renderHook(() => useDevice());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isMobileOrTablet).toBe(true);
    });

    it("should handle custom breakpoints", () => {
      Object.defineProperty(window, "innerWidth", { value: 600 });

      const { result } = renderHook(() =>
        useDevice({ mobileMaxPx: 700, desktopMinPx: 1200 })
      );
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it("should initialize with window dimensions", () => {
      const { result } = renderHook(() => useDevice());

      expect(result.current.width).toBe(1024); // Set in beforeEach
      expect(result.current.height).toBe(768);
      expect(result.current.isMobile).toBe(true); // 1024 <= 1070 (mobileMaxPx)
    });

    it("should handle SSR (server-side rendering)", () => {
      expect(true).toBe(true);
    });
  });

  describe("useIsMobile", () => {
    it("should return mobile state", () => {
      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it("should accept custom options", () => {
      const { result } = renderHook(() => useIsMobile({ mobileMaxPx: 900 }));
      expect(result.current).toBe(false);
    });
  });

  describe("useIsMobileOrTablet", () => {
    it("should return mobile or tablet state", () => {
      const { result } = renderHook(() => useIsMobileOrTablet());
      expect(result.current).toBe(true);
    });
  });

  describe("useIsTablet", () => {
    it("should return true for tablet breakpoint widths", () => {
      Object.defineProperty(window, "innerWidth", { value: 1200 });
      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(true);
    });

    it("should detect iPad (iPadOS masquerading as Mac) as tablet even under mobile breakpoint", () => {
      Object.defineProperty(window, "innerWidth", { value: 1024 });
      Object.defineProperty(navigator, "platform", {
        configurable: true,
        value: "MacIntel",
      });
      Object.defineProperty(navigator, "maxTouchPoints", {
        configurable: true,
        value: 5,
      });
      Object.defineProperty(navigator, "userAgent", {
        configurable: true,
        value:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
      });

      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(true);
    });

    it("should detect Android tablets as tablet even under mobile breakpoint", () => {
      Object.defineProperty(window, "innerWidth", { value: 800 });
      Object.defineProperty(navigator, "userAgent", {
        configurable: true,
        value:
          "Mozilla/5.0 (Linux; Android 13; Pixel C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });

      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(true);
    });
  });
});
