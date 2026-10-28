"use client";

import React from "react";
import SceneTransition from "./SceneTransition";

interface SceneTransitionWrapperProps {
  activeSceneKey: string;
  children: React.ReactNode;
}

const SceneTransitionWrapper: React.FC<SceneTransitionWrapperProps> = ({
  activeSceneKey,
  children,
}) => {
  return (
    <SceneTransition activeSceneKey={activeSceneKey}>
      {children}
    </SceneTransition>
  );
};

export default SceneTransitionWrapper;
