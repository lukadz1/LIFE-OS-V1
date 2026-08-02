import { useCallback, useEffect, useState } from "react";
import {
  getExercises,
  getSetLogs,
  getSplitDays,
  saveExercises,
  saveSetLogs,
  saveSplitDays,
} from "../services/dataService";
import type { Exercise, SetLog, SplitDay } from "../types";
import { createId } from "../utils/id";

export type ExerciseInput = Omit<Exercise, "id">;

// Every mutation saves inside the setState updater, using the array it just
// computed — never via a separate effect reacting to state. That's the fix
// for a real data-loss bug found in the Finance tab (an overlapping mount's
// load could race a reactive save and flush an empty array over real data).
export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [setLogs, setSetLogs] = useState<SetLog[]>([]);
  const [splitDays, setSplitDays] = useState<SplitDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getExercises(), getSetLogs(), getSplitDays()]).then(
      ([ex, logs, days]) => {
        if (!active) return;
        setExercises(ex);
        setSetLogs(logs);
        setSplitDays(days);
        setLoading(false);
      },
    );
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

  const updateExercise = useCallback(
    (id: string, patch: Partial<ExerciseInput>) => {
      setExercises((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
        void saveExercises(next);
        return next;
      });
    },
    [],
  );

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
    setSplitDays((prev) => {
      const next = prev.map((d) => ({
        ...d,
        exerciseIds: d.exerciseIds.filter((eid) => eid !== id),
      }));
      void saveSplitDays(next);
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

  // ---- training split days ----
  const addSplitDay = useCallback((name: string) => {
    const id = createId();
    setSplitDays((prev) => {
      const next = [
        ...prev,
        { id, name, exerciseIds: [], createdAt: new Date().toISOString() },
      ];
      void saveSplitDays(next);
      return next;
    });
    return id;
  }, []);

  const renameSplitDay = useCallback((id: string, name: string) => {
    setSplitDays((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, name } : d));
      void saveSplitDays(next);
      return next;
    });
  }, []);

  const deleteSplitDay = useCallback((id: string) => {
    setSplitDays((prev) => {
      const next = prev.filter((d) => d.id !== id);
      void saveSplitDays(next);
      return next;
    });
  }, []);

  // Adds or removes an exercise from a day's list — deterministic, not a toggle,
  // so a checkbox tap always lands in the state its checked-ness implies.
  const setDayExercise = useCallback(
    (dayId: string, exerciseId: string, included: boolean) => {
      setSplitDays((prev) => {
        const next = prev.map((d) => {
          if (d.id !== dayId) return d;
          const has = d.exerciseIds.includes(exerciseId);
          if (included === has) return d;
          return {
            ...d,
            exerciseIds: included
              ? [...d.exerciseIds, exerciseId]
              : d.exerciseIds.filter((id) => id !== exerciseId),
          };
        });
        void saveSplitDays(next);
        return next;
      });
    },
    [],
  );

  // Moves an exercise one slot earlier/later within a day's ordering — a
  // no-op past either end rather than wrapping or throwing.
  const reorderDayExercises = useCallback(
    (dayId: string, exerciseId: string, direction: "up" | "down") => {
      setSplitDays((prev) => {
        const next = prev.map((d) => {
          if (d.id !== dayId) return d;
          const i = d.exerciseIds.indexOf(exerciseId);
          const j = direction === "up" ? i - 1 : i + 1;
          if (i === -1 || j < 0 || j >= d.exerciseIds.length) return d;
          const ids = [...d.exerciseIds];
          [ids[i], ids[j]] = [ids[j], ids[i]];
          return { ...d, exerciseIds: ids };
        });
        void saveSplitDays(next);
        return next;
      });
    },
    [],
  );

  return {
    loading,
    exercises,
    setLogs,
    splitDays,
    addExercise,
    renameExercise,
    updateExercise,
    deleteExercise,
    logSet,
    deleteSet,
    addSplitDay,
    renameSplitDay,
    deleteSplitDay,
    setDayExercise,
    reorderDayExercises,
  };
}
