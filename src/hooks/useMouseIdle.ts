"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMousePosition } from "./useMousePosition";

export const useMouseIdle = (
  delay: number = 500,
  idleThreshold: number = 30
) => {
  const [isIdle, setIsIdle] = useState(false);
  const position = useMousePosition();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const lastPosition = useRef(position);

  useEffect(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    const distance = Math.sqrt(
      Math.pow(position.x - lastPosition.current.x, 2) +
        Math.pow(position.y - lastPosition.current.y, 2)
    );

    if (distance > idleThreshold) {
      setIsIdle(false);
      lastPosition.current = position;
    }

    timeoutId.current = setTimeout(() => {
      setIsIdle(true);
    }, delay);

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [position, delay, idleThreshold]);

  return isIdle;
};
