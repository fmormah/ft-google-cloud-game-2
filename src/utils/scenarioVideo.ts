export type ScenarioVideoVariant = "auto" | "desktop" | "mobile";

import { isIPhoneIOS } from "@/utils/browser";

function parseScenarioVideoVariant(raw: string | undefined): ScenarioVideoVariant | null {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "auto" || v === "desktop" || v === "mobile") return v;
  return null;
}

/**
 * Controls which variant to use for scenario/post-action videos that have
 * both desktop/mobile encodes.
 *
 * - `auto`: choose based on device
 * - `desktop`: force desktop variant
 * - `mobile`: force mobile variant
 */
export function getScenarioVideoVariant(): ScenarioVideoVariant {
  const parsed = parseScenarioVideoVariant(process.env.NEXT_PUBLIC_SCENARIO_VIDEO_VARIANT);
  return parsed ?? "auto";
}

export function resolveScenarioVideoIsMobile(deviceIsMobile: boolean): boolean {
  const variant = getScenarioVideoVariant();
  if (variant === "mobile") return true;
  if (variant === "desktop") return false;
  return deviceIsMobile;
}

/**
 * Picks the scenario video source variant by swapping `.mp4`/`.webm` extensions.
 * If the src doesn't end in one of those extensions, it is returned unchanged.
 */
export function selectScenarioVideoSrc(
  src: string | undefined | null,
  deviceIsMobile: boolean
): string | null {
  if (!src) return null;

  const isMobile = resolveScenarioVideoIsMobile(deviceIsMobile);
  if (isMobile) {
    // Mobile: prefer webm, except iOS phones which should prefer mp4.
    if (isIPhoneIOS()) {
      return src.replace(/\.webm$/i, ".mp4");
    }
    return src.replace(/\.mp4$/i, ".webm");
  }
  // Desktop: prefer mp4
  return src.replace(/\.webm$/i, ".mp4");
}


