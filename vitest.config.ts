import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { resolve } from "path";

function ignoreAssets() {
  // ignore only non-CSS assets so CSS Modules can be processed
  const RE = /\.(png|jpe?g|gif|svg|mp3|mp4)$/i;
  return {
    name: "ignore-assets",
    enforce: "pre" as const,
    resolveId(id: string) {
      return RE.test(id) ? id : null;
    },
    load(id: string) {
      return RE.test(id) ? "export default {}" : null;
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      // Tests don't need real HLS behavior; this avoids hard dependency resolution in Vitest.
      "hls.js": resolve(__dirname, "src/shims/hlsjs.ts"),
    },
  },

  css: {
    postcss: { plugins: [] },
    modules: {
      // keep local class names readable and stable for tests
      generateScopedName: "[local]",
    },
  },

  plugins: [react(), ignoreAssets()],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./.storybook/vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", "out", "reference-projects/**"],

    browser: {
      enabled: false,
      headless: true,
      instances: [{ browser: "chromium" }],
      screenshotFailures: false,
    },
  },
});
