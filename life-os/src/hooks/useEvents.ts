import { useCallback, useEffect, useState } from "react";
import { getEvents, saveEvents } from "../services/dataService";
import type { CalendarEvent, LifeAreaId } from "../types";
import { createId } from "../utils/id";

export interface EventInput {
  title: string;
  start: string;
  end: string;
  areaId: LifeAreaId | null;
  location?: string;
  recurringDays?: number[];
}

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

  // Persist whenever events change, but never before the initial load resolves —
  // otherwise a remount could flush the empty initial state over saved data.
  useEffect(() => {
    if (loading) return;
    void saveEvents(events);
  }, [events, loading]);

  const addEvent = useCallback((input: EventInput) => {
    const newEvent: CalendarEvent = { id: createId(), ...input };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<EventInput>) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...updates } : event)),
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  return { events, loading, addEvent, updateEvent, deleteEvent };
}
