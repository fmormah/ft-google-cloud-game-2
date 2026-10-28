"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type CursorMode = "default" | "stationary" | "hover";

interface CursorContextProps {
  mode: CursorMode;
  label: string;
  // Sets the scene/base mode (persistent)
  setMode: (mode: CursorMode) => void;
  setLabel: (label: string) => void;
  // Sets a temporary override (e.g., stationary on hover); pass null to clear
  setTemporaryMode: (mode: CursorMode | null) => void;
}

const CursorContext = createContext<CursorContextProps | undefined>(undefined);

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [sceneMode, setSceneMode] = useState<CursorMode>("default");
  const [temporaryMode, setTemporaryModeState] = useState<CursorMode | null>(
    null
  );
  const [label, setLabel] = useState<string>("");

  return (
    <CursorContext.Provider
      value={{
        mode: temporaryMode ?? sceneMode,
        label,
        setMode: setSceneMode,
        setLabel,
        setTemporaryMode: setTemporaryModeState,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
};
