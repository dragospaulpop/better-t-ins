import { useEffect, useRef, useState } from "react";

export default function useRAFProgress(realTimeProgress: number) {
  const [displayed, setDisplayed] = useState(realTimeProgress);
  const pending = useRef(realTimeProgress);

  useEffect(() => {
    pending.current = realTimeProgress;
    const frame = requestAnimationFrame(() => {
      setDisplayed(pending.current);
    });
    return () => cancelAnimationFrame(frame);
  }, [realTimeProgress]);

  return displayed;
}
