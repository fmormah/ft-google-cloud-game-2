export const dynamic = "force-static";

import { MetadataRoute } from "next";
import { SITE_URL } from "@/utils/environment";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL || "https://transformingbusiness.ft.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
