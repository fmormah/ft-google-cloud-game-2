import { useEffect, useRef, useState } from "react";

const defaultScrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface UseWordScrambleOptions {
  scrambleChars?: string;
  revealDurationMs?: number;
  revealDelayMs?: number;
  scrambleSpeedMs?: number;
}

export const useWordScramble = (
  text: string,
  options: UseWordScrambleOptions = {}
) => {
  const {
    scrambleChars = defaultScrambleChars,
    revealDurationMs = 2000,
    revealDelayMs = 0,
    scrambleSpeedMs = 50,
  } = options;

  const [displayText, setDisplayText] = useState("");
  const [opacity, setOpacity] = useState(0);
  const scrambleIntervalRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayText(
      text
        .split("")
        .map(
          () => scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        )
        .join("")
    );
    setOpacity(0);

    const startScrambling = () => {
      let revealProgress = 0;
      const revealIncrement =
        text.length / (revealDurationMs / scrambleSpeedMs);
      const opacityIncrement = 1 / (revealDurationMs / scrambleSpeedMs);

      scrambleIntervalRef.current = window.setInterval(() => {
        revealProgress += revealIncrement;
        const revealedCharCount = Math.floor(revealProgress);

        const newText = text
          .split("")
          .map((char, index) => {
            if (index < revealedCharCount) {
              return char;
            }
            if (char === " ") {
              return " ";
            }
            return scrambleChars[
              Math.floor(Math.random() * scrambleChars.length)
            ];
          })
          .join("");

        setDisplayText(newText);
        setOpacity((prev) => Math.min(prev + opacityIncrement, 1));

        if (revealProgress >= text.length) {
          setDisplayText(text);
          setOpacity(1);
          if (scrambleIntervalRef.current != null) {
            clearInterval(scrambleIntervalRef.current);
          }
        }
      }, scrambleSpeedMs);
    };

    revealTimeoutRef.current = window.setTimeout(
      startScrambling,
      revealDelayMs
    );

    return () => {
      if (scrambleIntervalRef.current != null) {
        clearInterval(scrambleIntervalRef.current);
      }
      if (revealTimeoutRef.current != null) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, [text, scrambleChars, revealDurationMs, revealDelayMs, scrambleSpeedMs]);

  return { displayText, opacity };
};
