import { createRequire } from "module";
import path from "path";

const _require = createRequire(import.meta.url);

// Point to local shim for webpack and use the package entry for Turbopack to avoid server-relative paths.
const oHeaderEntryTurbo = "@financial-times/o-header/main.js";
const oHeaderEntryWebpack = path.resolve(process.cwd(), "src/shims/o-header");
const oToggleEntry = "@financial-times/o-toggle/main.js";
const oTrackingEntry = "@financial-times/o-tracking/main.js";
const oViewportEntry = "@financial-times/o-viewport/main.js";
const ftDomDelegateEntry = "ftdomdelegate/main.js";

function getAssetRemotePatterns(): Array<{
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
}> {
  const raw = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
  if (!raw) return [];
  try {
    const url = new URL(raw);
    const pathname = url.pathname?.replace(/\/$/, "") || "";
    return [
      {
        protocol: url.protocol === "http:" ? "http" : "https",
        hostname: url.hostname,
        // If base URL includes a path (e.g. https://storage.googleapis.com/<bucket>),
        // restrict the allowed image path to that prefix.
        pathname: `${pathname || ""}/**`,
      },
    ];
  } catch {
    // Invalid URL - ignore.
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.GITHUB_PAGES === "true" ? { output: "export" as const, trailingSlash: true } : {}),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  env: {
    NEXT_PUBLIC_NEXT_VERSION: _require("next/package.json").version,
  },
  turbopack: {
    // Use `$` to target only bare module imports so Sass `@import` paths are untouched.
    resolveAlias: {
      "@financial-times/o-header": oHeaderEntryTurbo,
      "@financial-times/o-toggle": oToggleEntry,
      "@financial-times/o-tracking": oTrackingEntry,
      "@financial-times/o-viewport": oViewportEntry,
      ftdomdelegate: ftDomDelegateEntry,
    },
  },
  transpilePackages: [
    "@phantomstudios/ft-react-components",
    "@phantomstudios/ft-lib",
  ],
  productionBrowserSourceMaps: true,
  // Optimize production builds
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // Optimize images
  images: {
    unoptimized: process.env.GITHUB_PAGES === "true",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: getAssetRemotePatterns(),
  },
  sassOptions: {
    // Set required FT system code for FT image service source
    additionalData: `$system-code: '${
      process.env.NEXT_PUBLIC_FT_SYSTEM_CODE || "build-service"
    }';`,
    includePaths: [
      // Allow Sass to resolve packages from root node_modules (e.g. `mathsass`)
      path.resolve(process.cwd(), "node_modules"),
      // Absolute path helps node-sass resolution for Origami packages
      path.resolve(process.cwd(), "node_modules/@financial-times"),
    ],
    // Turbopack uses dart-sass' `loadPaths` option (new JS API)
    loadPaths: [
      path.resolve(process.cwd(), "node_modules"),
      path.resolve(process.cwd(), "node_modules/@financial-times"),
    ],
    prependData: `$system-code: next;`,
  },
  // Webpack configuration with source maps and FT overrides
  webpack: (config: unknown, ctx: { isServer: boolean; dev: boolean }) => {
    const { isServer, dev } = ctx;

    const cfg = config as {
      devtool?: string;
      optimization?: Record<string, unknown>;
      resolve?: { alias?: Record<string, unknown> };
    };

    // Enable source maps in development for better Lighthouse debugging
    if (dev && !isServer) {
      cfg.devtool = "eval-source-map";
      cfg.optimization = {
        ...(cfg.optimization || {}),
        moduleIds: "named",
        chunkIds: "named",
        // Reduce bundle analysis overhead
        usedExports: false,
      };
    }

    cfg.resolve = cfg.resolve || {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias || {}),
      // Use local override for FT partner app styles so we can control Sass imports.
      "@phantomstudios/ft-react-components/src/components/ft/styles/app.scss":
        path.resolve(process.cwd(), "src/theme/ft-partner-app.scss"),
      // Map Origami header to its browser entry for both webpack and turbopack.
      "@financial-times/o-header$": oHeaderEntryWebpack,
      "@financial-times/o-toggle": oToggleEntry,
      "@financial-times/o-tracking": oTrackingEntry,
      "@financial-times/o-viewport": oViewportEntry,
      ftdomdelegate: ftDomDelegateEntry,
    };

    if (isServer) {
      cfg.resolve.alias = {
        ...(cfg.resolve.alias || {}),
      };
    }

    return cfg;
  },
  async rewrites() {
    if (process.env.GITHUB_PAGES === "true") return [];
    return [
      {
        source: "/ft/partner-content/:path*",
        destination: "/ft/partner-content/:path*",
      },
    ];
  },
  // HTTP headers for better caching and performance
  async headers() {
    if (process.env.GITHUB_PAGES === "true") return [];
    return [
      {
        source: "/ft/partner-content/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default process.env.GITHUB_PAGES === "true"
  ? { ...nextConfig, headers: undefined, rewrites: undefined }
  : nextConfig;
