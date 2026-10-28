export const dynamic = "force-static";

import { proxyFtPng } from "@/utils/proxyFtPng";

export function GET() {
  // 180x180 is the most widely used iOS home screen icon size.
  return proxyFtPng(180);
}


