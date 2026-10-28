import { useCallback, useRef } from "react";

export interface AnimationStep {
  action: () => void;
  delay: number;
}

export interface UseAnimationSequenceOptions {
  onComplete?: () => void;
  autoStart?: boolean;
}

/**
 * Hook for managing sequential animation timing with setTimeout
 * Reduces boilerplate for complex animation sequences
 */
export function useAnimationSequence(
  steps: AnimationStep[],
  options: UseAnimationSequenceOptions = {}
) {
  const { onComplete, autoStart = false } = options;
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  const start = useCallback(() => {
    clearTimeouts();

    steps.forEach((step) => {
      const timeout = setTimeout(step.action, step.delay);
      timeoutRefs.current.push(timeout);
    });

    // Call onComplete after the last step
    if (onComplete && steps.length > 0) {
      const totalDuration = Math.max(...steps.map(step => step.delay));
      const completeTimeout = setTimeout(onComplete, totalDuration);
      timeoutRefs.current.push(completeTimeout);
    }
  }, [steps, onComplete, clearTimeouts]);

  // Auto-start if requested
  if (autoStart) {
    start();
  }

  return {
    start,
    stop: clearTimeouts,
  };
}
