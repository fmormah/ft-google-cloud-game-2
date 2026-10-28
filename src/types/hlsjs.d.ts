declare module "hls.js" {
  export type HlsConfig = Partial<{
    lowLatencyMode: boolean;
    maxBufferLength: number;
    maxMaxBufferLength: number;
    backBufferLength: number;
    fragLoadingTimeOut: number;
    manifestLoadingTimeOut: number;
  }>;

  export default class Hls {
    static isSupported(): boolean;
    constructor(config?: HlsConfig);
    attachMedia(media: HTMLMediaElement): void;
    loadSource(src: string): void;
    destroy(): void;
  }
}


