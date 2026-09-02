import { useEffect, useState } from "react";

/** Current time, refreshed every 30s — cheap enough for a "now" indicator
 * line without redrawing the calendar on every animation frame. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return now;
}
