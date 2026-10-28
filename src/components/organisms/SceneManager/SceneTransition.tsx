import React, { useState, useEffect, useCallback } from "react";
import classNames from "classnames";
import styles from "./SceneTransition.module.scss";

interface SceneTransitionProps {
  activeSceneKey: string;
  children: React.ReactNode;
}

interface Scene {
  id: number;
  key: string;
  node: React.ReactNode;
}

interface TransitionState {
  scenes: Scene[];
  fromId: number | null;
  pending: Pick<Scene, "key" | "node"> | null;
  nextId: number;
}

const SceneTransition: React.FC<SceneTransitionProps> = ({
  activeSceneKey,
  children,
}) => {
  const [state, setState] = useState<TransitionState>(() => ({
    scenes: [{ id: 0, key: activeSceneKey, node: children }],
    fromId: null,
    pending: null,
    nextId: 1,
  }));

  useEffect(() => {
    setState((current) => {
      const top = current.scenes[current.scenes.length - 1];
      if (activeSceneKey === top.key) {
        // A newer request can cancel a queued return to an earlier scene.
        return current.pending ? { ...current, pending: null } : current;
      }
      if (current.fromId !== null) {
        return { ...current, pending: { key: activeSceneKey, node: children } };
      }
      return {
        scenes: [
          top,
          { id: current.nextId, key: activeSceneKey, node: children },
        ],
        fromId: top.id,
        pending: null,
        nextId: current.nextId + 1,
      };
    });
  }, [activeSceneKey, children]);

  const handleAnimationEnd = useCallback(
    (sceneId: number, event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      // Retire the old scene and start any queued scene in one state update.
      // Separate setters can replay a queued transition or reuse fading state.
      setState((current) => {
        const top = current.scenes[current.scenes.length - 1];
        if (current.fromId === null || top.id !== sceneId) return current;
        if (current.pending && current.pending.key !== top.key) {
          return {
            scenes: [top, { id: current.nextId, ...current.pending }],
            fromId: top.id,
            pending: null,
            nextId: current.nextId + 1,
          };
        }
        return { ...current, scenes: [top], fromId: null, pending: null };
      });
    },
    [],
  );

  return (
    <div className={styles.transitionContainer} data-scene={activeSceneKey}>
      {state.scenes.map((scene, index) => {
        const isTop = index === state.scenes.length - 1;
        const shouldAnimate = isTop && state.fromId !== null;
        const isLeaving = state.fromId === scene.id;

        return (
          <div
            // Re-entering a scene always starts a fresh component instance.
            key={scene.id}
            className={classNames(styles.sceneWrapper, {
              [styles.sceneTop]: isTop,
              [styles.fade_fast]: shouldAnimate,
              [styles.sceneLeaving]: isLeaving,
              [styles.sceneLeavingFast]: isLeaving,
            })}
            onAnimationEnd={
              shouldAnimate
                ? (event) => handleAnimationEnd(scene.id, event)
                : undefined
            }
          >
            {scene.node}
          </div>
        );
      })}
    </div>
  );
};

export default SceneTransition;
