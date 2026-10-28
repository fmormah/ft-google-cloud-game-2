export const dynamic = "force-static";

import { MetadataRoute } from "next";
import { SITE_URL } from "@/utils/environment";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL || "https://transformingbusiness.ft.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
