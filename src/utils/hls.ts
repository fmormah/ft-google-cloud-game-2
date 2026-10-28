import type { HlsConfig } from "hls.js";

export type HlsInstance = {
  attachMedia(media: HTMLMediaElement): void;
  loadSource(src: string): void;
  destroy(): void;
};

type HlsConstructor = {
  new (config?: HlsConfig): HlsInstance;
  isSupported(): boolean;
};

let cachedCtor: Promise<HlsConstructor | null> | null = null;

async function loadHlsConstructor(): Promise<HlsConstructor | null> {
  if (typeof window === "undefined") return null;

  if (!cachedCtor) {
    cachedCtor = import("hls.js")
      .then((mod) => mod.default as unknown as HlsConstructor)
      .catch(() => null);
  }

  const HlsCtor = await cachedCtor;
  if (!HlsCtor) return null;

  try {
    return HlsCtor.isSupported() ? HlsCtor : null;
  } catch {
    return null;
  }
}

export async function createHls(config?: HlsConfig): Promise<HlsInstance | null> {
  const HlsCtor = await loadHlsConstructor();
  if (!HlsCtor) return null;
  try {
    return new HlsCtor(config);
  } catch {
    return null;
  }
}


