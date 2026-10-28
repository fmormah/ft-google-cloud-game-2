"use client";

import { FTTrackerProvider } from "@phantomstudios/ft-react-components";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <FTTrackerProvider>{children}</FTTrackerProvider>;
};

export default Providers;
