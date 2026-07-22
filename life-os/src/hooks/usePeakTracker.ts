import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getEvents,
  getPeakDoseLogs,
  getPeakFeelLogs,
  getPeakPlan,
  getPeakStack,
  savePeakDoseLogs,
  savePeakFeelLogs,
  savePeakPlan,
  savePeakStack,
} from "../services/dataService";
import type {
  CalendarEvent,
  PeakDoseLog,
  PeakFeelLog,
  PeakPlanItem,
  PeakStackItem,
} from "../types";
import { todayISO } from "../utils/date";
import { createId } from "../utils/id";

function isTodayIso(iso: string): boolean {
  return iso.slice(0, 10) === todayISO();
}

export function usePeakTracker() {
  const [stack, setStack] = useState<PeakStackItem[]>([]);
  const [doseLogs, setDoseLogs] = useState<PeakDoseLog[]>([]);
  const [feelLogs, setFeelLogs] = useState<PeakFeelLog[]>([]);
  const [plan, setPlan] = useState<PeakPlanItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [s, d, f, p, e] = await Promise.all([
        getPeakStack(),
        getPeakDoseLogs(),
        getPeakFeelLogs(),
        getPeakPlan(),
        getEvents(),
      ]);
      if (!active) return;
      setStack(s);
      setDoseLogs(d);
      setFeelLogs(f);
      setPlan(p);
      setEvents(e);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const doseLogsToday = useMemo(
    () => doseLogs.filter((d) => isTodayIso(d.at)),
    [doseLogs],
  );
  const feelLogsToday = useMemo(
    () => feelLogs.filter((f) => f.date === todayISO()),
    [feelLogs],
  );
  const planToday = useMemo(
    () => plan.filter((p) => p.date === todayISO()),
    [plan],
  );
  const eventsToday = useMemo(
    () =>
      events
        .filter((e) => isTodayIso(e.start))
        .sort((a, b) => a.start.localeCompare(b.start)),
    [events],
  );

  const addStackItem = useCallback((name: string, mg: number) => {
    const item: PeakStackItem = { id: createId(), name, mg };
    setStack((prev) => {
      const next = [...prev, item];
      void savePeakStack(next);
      return next;
    });
  }, []);

  const removeStackItem = useCallback((id: string) => {
    setStack((prev) => {
      const next = prev.filter((i) => i.id !== id);
      void savePeakStack(next);
      return next;
    });
  }, []);

  const updateStackItemMg = useCallback((id: string, mg: number) => {
    setStack((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, mg } : i));
      void savePeakStack(next);
      return next;
    });
  }, []);

  const logDose = useCallback((item: PeakStackItem) => {
    const log: PeakDoseLog = {
      id: createId(),
      itemId: item.id,
      mg: item.mg,
      at: new Date().toISOString(),
    };
    setDoseLogs((prev) => {
      const next = [...prev, log];
      void savePeakDoseLogs(next);
      return next;
    });
  }, []);

  const upsertFeel = useCallback((hour: number, value: number) => {
    const hr = Math.round(hour * 2) / 2;
    const date = todayISO();
    setFeelLogs((prev) => {
      const idx = prev.findIndex((f) => f.date === date && f.hour === hr);
      const next =
        idx >= 0
          ? prev.map((f, i) => (i === idx ? { ...f, value } : f))
          : [...prev, { id: createId(), hour: hr, value, date }];
      next.sort((a, b) => a.hour - b.hour);
      void savePeakFeelLogs(next);
      return next;
    });
  }, []);

  const addPlanItem = useCallback((text: string) => {
    const item: PeakPlanItem = { id: createId(), text, date: todayISO() };
    setPlan((prev) => {
      const next = [...prev, item];
      void savePeakPlan(next);
      return next;
    });
  }, []);

  const removePlanItem = useCallback((id: string) => {
    setPlan((prev) => {
      const next = prev.filter((i) => i.id !== id);
      void savePeakPlan(next);
      return next;
    });
  }, []);

  return {
    loading,
    stack,
    doseLogsToday,
    feelLogsToday,
    planToday,
    eventsToday,
    addStackItem,
    removeStackItem,
    updateStackItemMg,
    logDose,
    upsertFeel,
    addPlanItem,
    removePlanItem,
  };
}
