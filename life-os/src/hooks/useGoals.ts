import { useCallback, useEffect, useState } from "react";
import { getGoals, saveGoals } from "../services/dataService";
import type { Goal, LifeAreaId } from "../types";
import { createId } from "../utils/id";

export interface GoalInput {
  title: string;
  areaId: LifeAreaId | null;
  targetDate: string | null;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getGoals().then((data) => {
      if (!active) return;
      setGoals(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist whenever goals change, but never before the initial load resolves —
  // otherwise a remount could flush the empty initial state over saved data.
  useEffect(() => {
    if (loading) return;
    void saveGoals(goals);
  }, [goals, loading]);

  const addGoal = useCallback((input: GoalInput) => {
    const newGoal: Goal = {
      id: createId(),
      progress: 0,
      createdAt: new Date().toISOString(),
      ...input,
    };
    setGoals((prev) => [...prev, newGoal]);
  }, []);

  const adjustProgress = useCallback((id: string, delta: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              progress: Math.max(0, Math.min(100, goal.progress + delta)),
            }
          : goal,
      ),
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  }, []);

  return { goals, loading, addGoal, adjustProgress, deleteGoal };
}
