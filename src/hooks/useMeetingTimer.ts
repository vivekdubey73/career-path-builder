import { useEffect, useRef, useState } from "react";

export function useMeetingTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    startedAt.current = Date.now();
    setSeconds(0);
    const id = window.setInterval(() => {
      if (startedAt.current) {
        setSeconds(Math.floor((Date.now() - startedAt.current) / 1000));
      }
    }, 1000);
    return () => {
      window.clearInterval(id);
      startedAt.current = null;
    };
  }, [active]);

  const formatted = formatDuration(seconds);
  return { seconds, formatted };
}

export function formatDuration(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
