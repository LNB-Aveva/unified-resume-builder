import { useState, useEffect, useRef } from "react";

export function useLoadingMessages(messages: string[], intervalMs = 4000) {
  const [loadingMsg, setLoadingMsg] = useState(messages[0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  function start() {
    indexRef.current = 0;
    setLoadingMsg(messages[0]);
    intervalRef.current = setInterval(() => {
      indexRef.current = Math.min(indexRef.current + 1, messages.length - 1);
      setLoadingMsg(messages[indexRef.current]);
    }, intervalMs);
  }

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  useEffect(() => () => stop(), []);

  return { loadingMsg, start, stop };
}
