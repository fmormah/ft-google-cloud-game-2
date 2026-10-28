"use client";

import { useEffect } from "react";

const FTCookieMessage = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import("@financial-times/o-cookie-message")
      .then(({ default: OCookieMessage }) => {
        const isFtDomain = window.location.hostname.endsWith("ft.com");
        if (!isFtDomain) {
          // Prevent live-only act behavior on non-ft domains
          document.addEventListener("oCookieMessage.act", (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
          });
          // Use fallback acceptUrl to suppress console errors locally
          // eslint-disable-next-line new-cap
          new OCookieMessage(null, { acceptUrl: "/" });
        } else {
          // eslint-disable-next-line new-cap
          new OCookieMessage();
        }
      })
      .catch(() => {
        // swallow errors to avoid breaking render on dev
      });
  }, []);

  return null;
};

export default FTCookieMessage;
