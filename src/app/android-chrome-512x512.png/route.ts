export const dynamic = "force-static";

import { proxyFtPng } from "@/utils/proxyFtPng";

export function GET() {
  return proxyFtPng(512);
}


