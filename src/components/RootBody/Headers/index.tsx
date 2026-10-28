"use client";

import {
  FTHeader,
  FTPartnerContent,
} from "@phantomstudios/ft-react-components";
import React from "react";
import { PARTNER_LINK, PARTNER_TITLE } from "@/content/meta";
import { SITE_URL } from "@/utils/environment";

const SITE_TITLE = "Transforming Business";

const PARTNER = { title: PARTNER_TITLE, url: PARTNER_LINK };

function decodeShareHrefEntities(href: string): string {
  // Only decode HTML entities that commonly break query strings when used in React props.
  // (React does not unescape HTML entities in prop strings; it sets them literally.)
  return href
    .replaceAll("&amp;", "&")
    .replaceAll("&#x3D;", "=")
    .replaceAll("&#61;", "=");
}

function fixHeaderShareLinkHrefs(root: ParentNode | null) {
  if (!root) return;
  const anchors = root.querySelectorAll<HTMLAnchorElement>("a[href]");
  for (const a of anchors) {
    const raw = a.getAttribute("href");
    if (!raw) continue;
    if (
      raw.includes("&amp;") ||
      raw.includes("&#x3D;") ||
      raw.includes("&#61;")
    ) {
      a.setAttribute("href", decodeShareHrefEntities(raw));
    }
  }
}

const Headers = () => {
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.querySelector(".header-container");
    if (!root) return;

    // Run once immediately and once on next tick (in case 3P components render async).
    fixHeaderShareLinkHrefs(root);
    const t = window.setTimeout(() => fixHeaderShareLinkHrefs(root), 0);

    // Keep it robust against future markup updates from the 3P header.
    const observer = new MutationObserver(() => fixHeaderShareLinkHrefs(root));
    observer.observe(root, { subtree: true, childList: true, attributes: true });

    return () => {
      window.clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="header-container">
      {/*
        FTHeader comes from a third-party FT component library which can render
        slightly different markup between server and client (e.g. Firefox
        normalising autocapitalize to "none" vs "off"). Wrapping it with
        suppressHydrationWarning prevents React from treating these benign
        differences as hydration errors during dev hydration.
      */}
      <div suppressHydrationWarning>
        <FTHeader />
      </div>
      <FTPartnerContent
        siteUrl={SITE_URL}
        siteTitle={SITE_TITLE}
        partner={PARTNER}
      />
    </div>
  );
};

export default Headers;
