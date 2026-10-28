"use client";

import { useEffect } from "react";
import { ConfigType, useFTTracker } from "@phantomstudios/ft-react-components";
import { RootBodyElement } from "./styles";
import { useGlobalClickAnalytics } from "@/hooks/useGlobalClickAnalytics";

interface Props {
  children: React.ReactNode;
}

const RootBody = ({ children }: Props) => {
  const { setPageViewData, setTrackingOptions, FTTracker } = useFTTracker();
  useGlobalClickAnalytics();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PORTFOLIO_DEMO === "true") return;
    if (setTrackingOptions) {
      setTrackingOptions({
        scrollTrackerSelector: "body",
        isCustomGTMEvent: true,
        sendGTMPageViewYN: true,
      });
    }

    if (FTTracker) {
      const trackerAny = FTTracker as unknown as {
        initializeConsentMonitor?: () => void;
        initConsentMonitor?: () => void;
      };
      const initFn =
        trackerAny.initializeConsentMonitor || trackerAny.initConsentMonitor;
      if (typeof initFn === "function") {
        try {
          initFn();
        } catch {}
      }
    }
  }, [setTrackingOptions, FTTracker]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PORTFOLIO_DEMO === "true") return;
    if (setPageViewData) {
      setPageViewData({
        advertiserIndustry: "Technology",
        app: "Interactive_infographic",
        articleName: "Transforming Business",
        author: "External",
        campaignName: "Transforming Business",
        commercial_product: "ft",
        contentType: "Product_focussed",
        isBranded: true,
        feature: "microsite",
        hasVideo: true,
        primaryTopic: "Technology",
        product: "paid-post",
        publishDate: "2025-11-27",
        secondaryTopic: "Artificial_intelligence",
        server: "https://spoor-api.ft.com/px.gif",
        sponsor: "Google Cloud",
        title: "Transforming Business",
        url: typeof window !== "undefined" ? window.location.href : "",
        videoType: "Other",
        adbook_campaign_id: "600272",
      } as unknown as ConfigType);
    }
  }, [setPageViewData]);

  return <RootBodyElement>{children}</RootBodyElement>;
};

export default RootBody;
