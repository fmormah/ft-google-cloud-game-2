export default class Hls {
  static isSupported() {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_config?: unknown) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  attachMedia(_media: HTMLMediaElement) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadSource(_src: string) {}

  destroy() {}
}


