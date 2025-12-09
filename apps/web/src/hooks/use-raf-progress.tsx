import { useThrottler } from "@tanstack/react-pacer/throttler";
import { useEffect, useRef, useState } from "react";

export default function useRAFProgress(realTimeProgress: number) {
  const [displayed, setDisplayed] = useState(realTimeProgress);
  const pending = useRef(realTimeProgress);

  const setThrottledProgress = useThrottler(setDisplayed, {
    wait: 200,
  });

  useEffect(() => {
    pending.current = realTimeProgress;
    const frame = requestAnimationFrame(() => {
      setThrottledProgress.maybeExecute(pending.current);
    });
    return () => cancelAnimationFrame(frame);
  }, [realTimeProgress, setThrottledProgress]);

  return displayed;
}
