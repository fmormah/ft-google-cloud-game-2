export function isSafari(): boolean {
  if (typeof window === "undefined" || !window.navigator) return false;
  
  const ua = window.navigator.userAgent.toLowerCase();
  const vendor = window.navigator.vendor?.toLowerCase() || "";
  
  return (
    vendor.includes("apple") &&
    ua.includes("safari") &&
    !ua.includes("chrome") &&
    !ua.includes("chromium") &&
    !ua.includes("android")
  );
}

export function getBrowserVideoSources(sources: Array<{ src: string; type?: string }>): Array<{ src: string; type?: string }> {
  if (!sources?.length) return [];

  const safari = isSafari();

  if (safari) {
    return sources.filter(s => s.type === "video/mp4");
  }

  return sources.filter(s => s.type === "video/webm");
}

export function isIOSSafari(): boolean {
  if (typeof window === "undefined" || !window.navigator) return false;
  
  const ua = window.navigator.userAgent.toLowerCase();
  const vendor = window.navigator.vendor?.toLowerCase() || "";
  
  const isIOSDevice = /iphone|ipad|ipod/.test(ua) || 
    (/macintosh/.test(ua) && /mobile/.test(ua));
  
  const isSafariBrowser = vendor.includes("apple") &&
    ua.includes("safari") &&
    !ua.includes("chrome") &&
    !ua.includes("chromium") &&
    !ua.includes("crios") &&
    !ua.includes("fxios");
  
  return isIOSDevice && isSafariBrowser;
}

/**
 * Detects if the current browser is iPhone/iPod Safari (excludes iPad/iPadOS).
 *
 * Useful for applying targeted mitigations that are only needed on iOS Safari phones.
 */
export function isIPhoneSafari(): boolean {
  if (typeof window === "undefined" || !window.navigator) return false;

  const ua = window.navigator.userAgent.toLowerCase();
  const vendor = window.navigator.vendor?.toLowerCase() || "";

  const isIPhoneOrIPod = /iphone|ipod/.test(ua);
  const isSafariBrowser =
    vendor.includes("apple") &&
    ua.includes("safari") &&
    !ua.includes("chrome") &&
    !ua.includes("chromium") &&
    !ua.includes("crios") &&
    !ua.includes("fxios") &&
    !ua.includes("edgios");

  return isIPhoneOrIPod && isSafariBrowser;
}

/**
 * Detects iPhone/iPod on iOS (any browser).
 *
 * Note: All iOS browsers use WebKit under the hood, so media/audio quirks can reproduce
 * across Safari + Chrome (CriOS) + others.
 */
export function isIPhoneIOS(): boolean {
  if (typeof window === "undefined" || !window.navigator) return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipod/.test(ua);
}

/**
 * Detects if the current browser is Chrome (mobile or desktop)
 */
export function isChrome(): boolean {
  if (typeof window === "undefined" || !window.navigator) return false;
  
  const ua = window.navigator.userAgent ?? "";
  // Chrome or Chrome iOS (CriOS), but exclude Edge, Opera, Samsung Browser
  return /Chrome|CriOS/.test(ua) && !/Edg|OPR|SamsungBrowser/.test(ua);
}

export function getOpeningSplashVideoUrl(): string {
  if (typeof window === "undefined" || !window.navigator) {
    return "/assets/video/scene_videos/opening-splash_Video_converted.webm";
  }

  const iosSafari = isIOSSafari();
  
  if (iosSafari) {
    return "/assets/video/scene_videos/opening-splash_Video_converted.mp4";
  }

  return "/assets/video/scene_videos/opening-splash_Video_converted.webm";
}

/**
 * Safely calls video.play() and catches AbortError exceptions.
 *
 * AbortError occurs when:
 * 1. The play() request is interrupted by a call to pause()
 * 2. The media element is removed from the document while play() is pending
 *
 * These are expected during rapid scene transitions and component unmounts,
 * so we suppress them to avoid console noise.
 *
 * @see https://developer.chrome.com/blog/play-request-was-interrupted
 */
export function safePlay(video: HTMLVideoElement | null | undefined): void {
  if (!video) return;
  
  const playPromise = video.play();
  
  if (playPromise !== undefined) {
    playPromise.catch((error: Error) => {
      // AbortError is expected during scene transitions / unmounts - suppress it
      if (error.name === "AbortError") {
        return;
      }
      // NotAllowedError can happen if autoplay is blocked - suppress it for muted videos
      if (error.name === "NotAllowedError") {
        return;
      }
      // Log other unexpected errors
      console.warn("Video play() failed:", error);
    });
  }
}
