/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";

import RootBody from "@/components/RootBody";
import Providers from "@/components/Providers";
import DevVersionLog from "@/components/DevVersionLog";
import Headers from "@/components/RootBody/Headers";
import Footer from "@/components/RootBody/Footer";
import { TrackingPixel } from "@phantomstudios/ft-react-components";
import { FONT_VARIABLES } from "@/theme/fonts";
import {
  PERMUTIVE_PROJECT_ID,
  PERMUTIVE_PUBLIC_API_KEY,
  SITE_URL,
} from "@/utils/environment";
import { PermutiveSetup } from "@phantomstudios/ft-react-components";
import FaviconEmbed from "@/theme/FaviconEmbed";
import OrientationPrompt from "@/components/OrientationPrompt";
import ErrorBoundaryWrapper from "@/components/ErrorBoundary/ErrorBoundaryWrapper";
import { assetUrl } from "@/utils/assetUrl";

import "@/theme/global.scss";
import "@/theme/origami-setup.scss";
import { TITLE, DESCRIPTION } from "@/content/meta";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

// Canonical production origin. Keep this in sync with DNS (avoid `www.` unless
// that hostname is explicitly configured and has valid SSL).
const DEFAULT_SITE_URL = "https://transformingbusiness.ft.com";

const normalizeSiteUrl = (url: string) => {
  const trimmed = url.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

/**
 * Prefer explicit canonical URLs when provided, otherwise fall back to Vercel's
 * deployment URL so social scrapers resolve absolute metadata correctly.
 */
const getMetadataBaseUrl = () => {
  const preferred =
    process.env.NEXT_PUBLIC_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
  if (preferred && preferred.trim()) return normalizeSiteUrl(preferred);

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel && vercel.trim()) return normalizeSiteUrl(vercel);

  return SITE_URL || DEFAULT_SITE_URL;
};

const METADATA_BASE_URL = getMetadataBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE_URL),
  applicationName: TITLE,
  title: TITLE,
  description: DESCRIPTION,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: METADATA_BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: TITLE,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: METADATA_BASE_URL,
    type: "website",
    siteName: TITLE,
    images: [
      {
        url: "https://transformingbusiness.ft.com/og-3.jpg",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://transformingbusiness.ft.com/og-3.jpg"],
  },
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  const assetBaseUrl = (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "").replace(
    /\/$/,
    ""
  );
  const rotatePhoneUrl = `url("${assetUrl("/assets/images/icons/rotate-phone.webp")}")`;
  const rotateArrowsUrl = `url("${assetUrl("/assets/images/icons/rotate-arrows.webp")}")`;
  return (
    <html
      lang="en"
      style={
        {
          "--asset-base-url": assetBaseUrl,
          "--asset-url-rotate-phone": rotatePhoneUrl,
          "--asset-url-rotate-arrows": rotateArrowsUrl,
        } as CSSProperties
      }
    >
      <head>
        {process.env.NEXT_PUBLIC_PORTFOLIO_DEMO !== "true" && <PermutiveSetup
          projectID={PERMUTIVE_PROJECT_ID}
          publicAPIKey={PERMUTIVE_PUBLIC_API_KEY}
        />}
        <FaviconEmbed />

        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://images.ft.com" />
        <link rel="preconnect" href="https://www.ft.com" />

        <link rel="dns-prefetch" href="https://consent-manager.ft.com" />
        <link rel="dns-prefetch" href="https://consent-notice.ft.com" />
        <link rel="dns-prefetch" href="https://spoor-api.ft.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link
          href="https://fonts.googleapis.com/css2?family=Doto:wght@400;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preload"
          as="video"
          href={assetUrl(
            "/assets/video/scene_videos/opening-splash_Video_converted.webm"
          )}
          type="video/webm"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="video"
          href={assetUrl(
            "/assets/video/scene_videos/opening-splash_Video_converted.mp4"
          )}
          type="video/mp4"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="video"
          href={assetUrl(
            "/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.webm"
          )}
          type="video/webm"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="video"
          href={assetUrl(
            "/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.mp4"
          )}
          type="video/mp4"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="video"
          href={assetUrl(
            "/assets/video/scene_videos/CharacterSelection-Desktop-PlayThrough.mp4"
          )}
          type="video/mp4"
          fetchPriority="high"
          media="(min-width: 1071px)"
        />
        <link
          rel="preload"
          as="video"
          href={assetUrl(
            "/assets/video/scene_videos/CharacterSelection-Mobile-PlayThrough.mp4"
          )}
          type="video/mp4"
          fetchPriority="high"
          media="(max-width: 1024px)"
        />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
        <link rel="preconnect" href="//cdn.jsdelivr.net" crossOrigin="" />
        <script
          async
          src="https://cdn.brandmetrics.com/survey/script/d7b54ce6-1b56-4932-8c28-af170b377e28.js"
        />
      </head>
      <body className={FONT_VARIABLES}>
        <ErrorBoundaryWrapper>
          <Providers>
            <DevVersionLog />
            <RootBody>
              <Headers />
              {children}
            </RootBody>
            <Footer />
            {process.env.NEXT_PUBLIC_PORTFOLIO_DEMO !== "true" && <TrackingPixel src="https://collector.brandmetrics.com/Info?pixel=e99ba31f7de24fbfbbe89ce468c1c7f7" />}
            <OrientationPrompt />
          </Providers>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
