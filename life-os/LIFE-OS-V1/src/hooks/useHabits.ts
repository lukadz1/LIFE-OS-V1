import { useCallback, useEffect, useState } from "react";
import { getHabits, saveHabits } from "../services/dataService";
import type { Habit, LifeAreaId } from "../types";
import { createId } from "../utils/id";

export interface HabitInput {
  name: string;
  areaId: LifeAreaId | null;
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getHabits().then((data) => {
      if (!active) return;
      setHabits(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist whenever habits change, but never before the initial load resolves —
  // otherwise a remount could flush the empty initial state over saved data.
  useEffect(() => {
    if (loading) return;
    void saveHabits(habits);
  }, [habits, loading]);

  const addHabit = useCallback((input: HabitInput) => {
    const newHabit: Habit = {
      id: createId(),
      completedDates: [],
      createdAt: new Date().toISOString(),
      ...input,
    };
    setHabits((prev) => [...prev, newHabit]);
  }, []);

  const toggleDate = useCallback((id: string, date: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        const done = habit.completedDates.includes(date);
        return {
          ...habit,
          completedDates: done
            ? habit.completedDates.filter((d) => d !== date)
            : [...habit.completedDates, date].sort(),
        };
      }),
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  }, []);

  return { habits, loading, addHabit, toggleDate, deleteHabit };
}
