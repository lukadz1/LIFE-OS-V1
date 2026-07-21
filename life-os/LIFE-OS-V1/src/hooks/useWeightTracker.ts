import { useCallback, useEffect, useState } from "react";
import { getWeightEntries, saveWeightEntries } from "../services/dataService";
import type { WeightEntry } from "../types";
import { createId } from "../utils/id";
import { habitStreak } from "../utils/streak";

export function useWeightTracker() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getWeightEntries().then((data) => {
      if (!active) return;
      setEntries(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Save inside the updater, not a reactive effect — see useFinance.ts for
  // why (a real data-loss bug from an overlapping mount racing a save).
  const logWeight = useCallback((weightKg: number) => {
    setEntries((prev) => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const withoutToday = prev.filter((e) => e.at.slice(0, 10) !== todayStr);
      const next = [
        ...withoutToday,
        { id: createId(), weightKg, at: new Date().toISOString() },
      ].sort((a, b) => a.at.localeCompare(b.at));
      void saveWeightEntries(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      void saveWeightEntries(next);
      return next;
    });
  }, []);

  const sorted = [...entries].sort((a, b) => a.at.localeCompare(b.at));
  const latest = sorted[sorted.length - 1] ?? null;
  const previous = sorted[sorted.length - 2] ?? null;
  const delta =
    latest && previous
      ? Math.round((latest.weightKg - previous.weightKg) * 10) / 10
      : null;
  const streak = habitStreak(entries.map((e) => e.at.slice(0, 10)));

  return {
    loading,
    entries: sorted,
    latest,
    delta,
    streak,
    logWeight,
    deleteEntry,
  };
}
