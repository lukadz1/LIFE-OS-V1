import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCalorieEntries,
  getCalorieGoals,
  saveCalorieEntries,
  saveCalorieGoals,
} from "../services/dataService";
import type { CalorieEntry, CalorieGoals } from "../types";
import { isSameDay } from "../utils/date";
import { createId } from "../utils/id";

export function useCalories() {
  const [entries, setEntries] = useState<CalorieEntry[]>([]);
  const [goals, setGoalsState] = useState<CalorieGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    Promise.all([getCalorieEntries(), getCalorieGoals()]).then(
      ([loadedEntries, loadedGoals]) => {
        if (!active) return;
        setEntries(loadedEntries);
        setGoalsState(loadedGoals);
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const entriesForDay = useMemo(
    () => entries.filter((e) => isSameDay(new Date(e.at), selectedDate)),
    [entries, selectedDate],
  );

  const totals = useMemo(
    () =>
      entriesForDay.reduce(
        (acc, e) => ({
          kcal: acc.kcal + e.kcal,
          proteinG: acc.proteinG + e.proteinG,
          carbsG: acc.carbsG + e.carbsG,
          fatG: acc.fatG + e.fatG,
        }),
        { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
      ),
    [entriesForDay],
  );

  // Same save-inside-updater pattern as useFuel/useWeightTracker — avoids a
  // reactive-effect race that can flush stale/empty data over a real save.
  const addEntry = useCallback(
    (entry: {
      label: string;
      kcal: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
    }) => {
      setEntries((prev) => {
        const at = new Date(selectedDate);
        const now = new Date();
        at.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        const next = [
          ...prev,
          { id: createId(), ...entry, at: at.toISOString() },
        ];
        void saveCalorieEntries(next);
        return next;
      });
    },
    [selectedDate],
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      void saveCalorieEntries(next);
      return next;
    });
  }, []);

  const setGoals = useCallback((next: CalorieGoals) => {
    setGoalsState(next);
    void saveCalorieGoals(next);
  }, []);

  return {
    loading,
    entries,
    goals,
    setGoals,
    selectedDate,
    setSelectedDate,
    entriesForDay,
    totals,
    addEntry,
    deleteEntry,
  };
}
