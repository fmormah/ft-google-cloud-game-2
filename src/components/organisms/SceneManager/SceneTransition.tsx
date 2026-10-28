import React, { useState, useEffect, useRef, useCallback } from "react";
import classNames from "classnames";
import styles from "./SceneTransition.module.scss";

const transitionTypes = ["fade_fast"];

interface SceneTransitionProps {
  activeSceneKey: string;
  children: React.ReactNode;
}

interface Scene {
  id: number;
  key: string;
  node: React.ReactNode;
}

const SceneTransition: React.FC<SceneTransitionProps> = ({
  activeSceneKey,
  children,
}) => {
  // A scene can be re-entered while its old instance is still fading out.
  // Unique entry IDs prevent React from restoring that instance's local state.
  const nextSceneId = useRef(1);
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 0, key: activeSceneKey, node: children },
  ]);
  const [transition, setTransition] = useState<{
    type: string;
    fromId: number;
  } | null>(null);
  const isTransitioning = useRef(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  useEffect(() => {
    const top = scenes[scenes.length - 1];
    if (!top) {
      setScenes([
        { id: nextSceneId.current++, key: activeSceneKey, node: children },
      ]);
      return;
    }
    if (activeSceneKey === top.key) {
      return;
    }

    if (!isTransitioning.current) {
      isTransitioning.current = true;
      const randomTransition =
        transitionTypes[Math.floor(Math.random() * transitionTypes.length)];
      setTransition({ type: randomTransition, fromId: top.id });
      const nextScene = {
        id: nextSceneId.current++,
        key: activeSceneKey,
        node: children,
      };
      setScenes((prev) => [...prev, nextScene]);
    } else {
      setPendingKey(activeSceneKey);
    }
  }, [activeSceneKey, children, scenes]);

  const handleAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || !transition) return;

      setScenes((prev) => prev.filter((s) => s.id !== transition.fromId));

      if (pendingKey) {
        const nextKey = pendingKey;
        setPendingKey(null);
        const nextScene = {
          id: nextSceneId.current++,
          key: nextKey,
          node: children,
        };
        setScenes((prev) => {
          const currentTop = prev[prev.length - 1];
          const randomTransition =
            transitionTypes[Math.floor(Math.random() * transitionTypes.length)];
          setTransition({ type: randomTransition, fromId: currentTop.id });
          isTransitioning.current = true;
          return [...prev, nextScene];
        });
        return;
      }

      setTransition(null);
      isTransitioning.current = false;
    },
    [transition, pendingKey, children],
  );

  return (
    <div className={styles.transitionContainer} data-scene={activeSceneKey}>
      {scenes.map((scene, index) => {
        const isTop = index === scenes.length - 1;
        const shouldAnimate = isTop && transition !== null;
        const isLeaving = transition?.fromId === scene.id;

        return (
          <div
            key={scene.id}
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
