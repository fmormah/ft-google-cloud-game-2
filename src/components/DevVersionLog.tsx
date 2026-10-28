"use client";

import React, { useEffect } from "react";
import { logDependencyVersions } from "@phantomstudios/ft-react-components";

export default function DevVersionLog() {
  useEffect(() => {
    logDependencyVersions({
      reactVersion: React.version,
      nextVersion: process.env.NEXT_PUBLIC_NEXT_VERSION || "unknown",
      appName: "ft-cloud-game-2",
    });
  }, []);

  return null;
}
