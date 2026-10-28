const DEBUG_LOGS = process.env.NEXT_PUBLIC_DEBUG_LOGS === "true";
const IS_DEV = process.env.NODE_ENV === "development";

export function debugLog(...args: unknown[]) {
  if (IS_DEV || DEBUG_LOGS) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export function debugWarn(...args: unknown[]) {
  if (IS_DEV || DEBUG_LOGS) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
}


