import "@testing-library/jest-dom/vitest";

// JSDOM does not implement many media APIs; provide safe no-op stubs
Object.defineProperty(HTMLMediaElement.prototype, "load", {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: vi.fn(),
});

// Some tests rely on RAF timers during transitions
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number =>
    setTimeout(() => cb(Date.now()), 16) as unknown as number;
}
if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = (id: number): void => {
    clearTimeout(id as unknown as NodeJS.Timeout);
  };
}

// Provide a safe default mock for the cursor context used by UI components
vi.mock("@/contexts/CursorContext", () => {
  const stub = {
    mode: "default" as const,
    label: "",
    setMode: vi.fn(),
    setLabel: vi.fn(),
    setTemporaryMode: vi.fn(),
  };

  return {
    useCursor: () => stub,
    CursorProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});
