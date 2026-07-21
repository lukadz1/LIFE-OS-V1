import { useEffect, useState } from "react";
import { getEvents } from "../services/dataService";
import type { CalendarEvent } from "../types";

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getEvents().then((data) => {
      if (!active) return;
      setEvents(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { events, loading };
}
