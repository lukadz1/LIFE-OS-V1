import { useCallback, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "../data/storage";
import {
  getFuelEntries,
  getSupplementList,
  saveFuelEntries,
  saveSupplementList,
} from "../services/dataService";
import type { FuelEntry, FuelKind } from "../types";
import { isToday } from "../utils/date";
import { createId } from "../utils/id";

export function useFuel() {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [supplementList, setSupplementList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [waterGoal, setWaterGoalRaw] = useState<number>(() =>
    readStorage<number>("water-goal", 8),
  );

  useEffect(() => {
    let active = true;
    Promise.all([getFuelEntries(), getSupplementList()]).then(
      ([loadedEntries, loadedList]) => {
        if (!active) return;
        setEntries(loadedEntries);
        setSupplementList(loadedList);
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const todayEntries = useMemo(
    () => entries.filter((e) => isToday(e.at)),
    [entries],
  );

  const waterCount = useMemo(
    () => todayEntries.filter((e) => e.kind === "water").length,
    [todayEntries],
  );

  const caffeineToday = useMemo(
    () => todayEntries.filter((e) => e.kind === "caffeine"),
    [todayEntries],
  );
  const caffeineCount = caffeineToday.length;
  const lastCaffeineAt = useMemo(
    () =>
      caffeineToday.reduce<string | null>(
        (latest, e) => (!latest || e.at > latest ? e.at : latest),
        null,
      ),
    [caffeineToday],
  );

  const mealsToday = useMemo(
    () =>
      todayEntries
        .filter((e) => e.kind === "meal")
        .sort((a, b) => a.at.localeCompare(b.at)),
    [todayEntries],
  );
  const totalKcalToday = useMemo(
    () => mealsToday.reduce((sum, e) => sum + (e.kcal ?? 0), 0),
    [mealsToday],
  );

  const supplementsCheckedToday = useMemo(
    () =>
      new Set(
        todayEntries
          .filter((e) => e.kind === "supplement")
          .map((e) => e.label),
      ),
    [todayEntries],
  );

  // Every mutation saves inside the setEntries updater itself, using the array
  // it just computed — never via a separate effect reacting to `entries`. That
  // was the root cause of a real data-loss bug in the Finance tab (an
  // overlapping remount's load could race a reactive save and flush an empty
  // array over real data); saving only as the direct result of a user action
  // closes that race entirely.
  const addEntry = useCallback(
    (kind: FuelKind, label: string, kcal?: number) => {
      setEntries((prev) => {
        const next = [
          ...prev,
          { id: createId(), kind, label, kcal, at: new Date().toISOString() },
        ];
        void saveFuelEntries(next);
        return next;
      });
    },
    [],
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      void saveFuelEntries(next);
      return next;
    });
  }, []);

  const logWater = useCallback(() => addEntry("water", "Water"), [addEntry]);
  const logCaffeine = useCallback(
    (label: string) => addEntry("caffeine", label),
    [addEntry],
  );
  const logMeal = useCallback(
    (name: string, kcal?: number) => addEntry("meal", name, kcal),
    [addEntry],
  );

  const toggleSupplement = useCallback((name: string) => {
    setEntries((prev) => {
      const matches = prev.filter(
        (e) => e.kind === "supplement" && e.label === name && isToday(e.at),
      );
      const next =
        matches.length > 0
          ? prev.filter((e) => !matches.includes(e))
          : [
              ...prev,
              {
                id: createId(),
                kind: "supplement" as const,
                label: name,
                at: new Date().toISOString(),
              },
            ];
      void saveFuelEntries(next);
      return next;
    });
  }, []);

  const addSupplementToList = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSupplementList((prev) => {
      if (prev.some((s) => s.toLowerCase() === trimmed.toLowerCase()))
        return prev;
      const next = [...prev, trimmed];
      void saveSupplementList(next);
      return next;
    });
  }, []);

  const removeSupplementFromList = useCallback((name: string) => {
    setSupplementList((prev) => {
      const next = prev.filter((s) => s !== name);
      void saveSupplementList(next);
      return next;
    });
  }, []);

  const setWaterGoal = useCallback((value: number) => {
    const clamped = Math.max(1, Math.min(20, Math.round(value)));
    setWaterGoalRaw(clamped);
    writeStorage("water-goal", clamped);
  }, []);

  return {
    loading,
    waterCount,
    waterGoal,
    setWaterGoal,
    logWater,
    caffeineCount,
    caffeineToday,
    lastCaffeineAt,
    logCaffeine,
    mealsToday,
    totalKcalToday,
    logMeal,
    deleteEntry,
    supplementList,
    supplementsCheckedToday,
    toggleSupplement,
    addSupplementToList,
    removeSupplementFromList,
  };
}
