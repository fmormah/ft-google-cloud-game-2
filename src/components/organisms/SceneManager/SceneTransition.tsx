import React, { useState, useEffect, useRef, useCallback } from "react";
import classNames from "classnames";
import styles from "./SceneTransition.module.scss";

const transitionTypes = ["fade_fast"];

interface SceneTransitionProps {
  activeSceneKey: string;
  children: React.ReactNode;
}

interface Scene {
  key: string;
  node: React.ReactNode;
}

const SceneTransition: React.FC<SceneTransitionProps> = ({
  activeSceneKey,
  children,
}) => {
  const [scenes, setScenes] = useState<Scene[]>([
    { key: activeSceneKey, node: children },
  ]);
  const [transition, setTransition] = useState<{
    type: string;
    fromKey: string;
  } | null>(null);
  const isTransitioning = useRef(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  useEffect(() => {
    const top = scenes[scenes.length - 1];
    if (!top) {
      setScenes([{ key: activeSceneKey, node: children }]);
      return;
    }
    if (activeSceneKey === top.key) {
      return;
    }

    if (!isTransitioning.current) {
      isTransitioning.current = true;
      const randomTransition =
        transitionTypes[Math.floor(Math.random() * transitionTypes.length)];
      setTransition({ type: randomTransition, fromKey: top.key });
      setScenes((prev) => [...prev, { key: activeSceneKey, node: children }]);
    } else {
      setPendingKey(activeSceneKey);
    }
  }, [activeSceneKey, children, scenes]);

  const handleAnimationEnd = useCallback(() => {
    if (!transition) return;

    setScenes((prev) => prev.filter((s) => s.key !== transition.fromKey));

    if (pendingKey) {
      const nextKey = pendingKey;
      setPendingKey(null);
      setScenes((prev) => {
        const currentTop = prev[prev.length - 1];
        const randomTransition =
          transitionTypes[Math.floor(Math.random() * transitionTypes.length)];
        setTransition({ type: randomTransition, fromKey: currentTop.key });
        isTransitioning.current = true;
        return [...prev, { key: nextKey, node: children }];
      });
      return;
    }

    setTransition(null);
    isTransitioning.current = false;
  }, [transition, pendingKey, children]);

  return (
    <div className={styles.transitionContainer} data-scene={activeSceneKey}>
      {scenes.map((scene, index) => {
        const isTop = index === scenes.length - 1;
        const shouldAnimate = isTop && transition !== null;
        const isLeaving = transition?.fromKey === scene.key;

        return (
          <div
            key={scene.key}
            className={classNames(styles.sceneWrapper, {
              [styles.sceneTop]: isTop,
              [styles[transition?.type || ""]]: shouldAnimate,
              [styles.sceneLeaving]: isLeaving,
              [styles.sceneLeavingFast]:
                isLeaving && transition?.type === "fade_fast",
            })}
            onAnimationEnd={shouldAnimate ? handleAnimationEnd : undefined}
          >
            {scene.node}
          </div>
        );
      })}
    </div>
  );
};

export default SceneTransition;
