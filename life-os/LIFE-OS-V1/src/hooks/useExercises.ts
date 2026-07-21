import { useCallback, useEffect, useState } from "react";
import {
  getExercises,
  getSetLogs,
  saveExercises,
  saveSetLogs,
} from "../services/dataService";
import type { Exercise, SetLog } from "../types";
import { createId } from "../utils/id";

export type ExerciseInput = Omit<Exercise, "id">;

// Every mutation saves inside the setState updater, using the array it just
// computed — never via a separate effect reacting to state. That's the fix
// for a real data-loss bug found in the Finance tab (an overlapping mount's
// load could race a reactive save and flush an empty array over real data).
export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [setLogs, setSetLogs] = useState<SetLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getExercises(), getSetLogs()]).then(([ex, logs]) => {
      if (!active) return;
      setExercises(ex);
      setSetLogs(logs);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const addExercise = useCallback((input: ExerciseInput) => {
    const id = createId();
    setExercises((prev) => {
      const next = [...prev, { ...input, id }];
      void saveExercises(next);
      return next;
    });
    return id;
  }, []);

  const renameExercise = useCallback((id: string, name: string) => {
    setExercises((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, name } : e));
      void saveExercises(next);
      return next;
    });
  }, []);

  const deleteExercise = useCallback((id: string) => {
    setExercises((prev) => {
      const next = prev.filter((e) => e.id !== id);
      void saveExercises(next);
      return next;
    });
    setSetLogs((prev) => {
      const next = prev.filter((s) => s.exerciseId !== id);
      void saveSetLogs(next);
      return next;
    });
  }, []);

  const logSet = useCallback(
    (exerciseId: string, weight: number, reps: number) => {
      setSetLogs((prev) => {
        const next = [
          ...prev,
          {
            id: createId(),
            exerciseId,
            weight,
            reps,
            at: new Date().toISOString(),
          },
        ];
        void saveSetLogs(next);
        return next;
      });
    },
    [],
  );

  const deleteSet = useCallback((id: string) => {
    setSetLogs((prev) => {
      const next = prev.filter((s) => s.id !== id);
      void saveSetLogs(next);
      return next;
    });
  }, []);

  return {
    loading,
    exercises,
    setLogs,
    addExercise,
    renameExercise,
    deleteExercise,
    logSet,
    deleteSet,
  };
}
