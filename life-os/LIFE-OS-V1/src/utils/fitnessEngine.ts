import type { Exercise, SetLog, WeightEntry } from "../types";

const DEFAULT_UPGRADE_AT_REPS = 8;

export function getSetsForExercise(
  logs: SetLog[],
  exerciseId: string,
): SetLog[] {
  return logs
    .filter((s) => s.exerciseId === exerciseId)
    .sort((a, b) => a.at.localeCompare(b.at));
}

export function estimateOneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export interface Prescription {
  tag: "up" | "hold" | "down";
  weight: number | null;
  reps: number;
  reason: string;
}

export function prescribeNextSet(
  exercise: Exercise,
  lastSet: SetLog | null,
  upgradeAtReps: number = DEFAULT_UPGRADE_AT_REPS,
): Prescription | null {
  if (!lastSet) return null;
  const target = Math.min(upgradeAtReps, exercise.repMax);

  if (exercise.bodyweight) {
    if (lastSet.reps >= target) {
      return {
        tag: "up",
        weight: null,
        reps: lastSet.reps + 1,
        reason: `You hit ${lastSet.reps} reps last time — aim for ${lastSet.reps + 1} next session.`,
      };
    }
    return {
      tag: "hold",
      weight: null,
      reps: lastSet.reps,
      reason: `Repeat ${lastSet.reps} reps and focus on clean form.`,
    };
  }

  if (lastSet.reps >= target) {
    const nextWeight = Math.round((lastSet.weight + exercise.step) * 100) / 100;
    return {
      tag: "up",
      weight: nextWeight,
      reps: exercise.repMin,
      reason: `You hit ${lastSet.reps} reps at ${lastSet.weight}kg — add ${exercise.step}kg next set.`,
    };
  }
  if (lastSet.reps < exercise.repMin) {
    const nextWeight = Math.max(0, Math.round((lastSet.weight - exercise.step) * 100) / 100);
    return {
      tag: "down",
      weight: nextWeight,
      reps: exercise.repMin,
      reason: `You were under range at ${lastSet.weight}kg — drop to ${nextWeight}kg and rebuild.`,
    };
  }
  return {
    tag: "hold",
    weight: lastSet.weight,
    reps: exercise.repMax,
    reason: `Repeat ${lastSet.weight}kg and push for ${exercise.repMax} reps.`,
  };
}

// Average % change in estimated 1RM across exercises with >=2 sets in the
// window — a rough proxy for "getting stronger" to cross-reference against
// bodyweight change. Bodyweight-only exercises are excluded (1RM math doesn't
// apply without external load).
export function computeAggregateStrengthTrend(
  exercises: Exercise[],
  setLogs: SetLog[],
  windowDays: number,
): number | null {
  const cutoff = Date.now() - windowDays * 86400000;
  const trends: number[] = [];
  for (const ex of exercises) {
    if (ex.bodyweight) continue;
    const sets = setLogs
      .filter((s) => s.exerciseId === ex.id && new Date(s.at).getTime() >= cutoff)
      .sort((a, b) => a.at.localeCompare(b.at));
    if (sets.length < 2) continue;
    const first1rm = estimateOneRepMax(sets[0].weight, sets[0].reps);
    const last1rm = estimateOneRepMax(
      sets[sets.length - 1].weight,
      sets[sets.length - 1].reps,
    );
    if (first1rm <= 0) continue;
    trends.push(((last1rm - first1rm) / first1rm) * 100);
  }
  if (trends.length === 0) return null;
  return trends.reduce((sum, t) => sum + t, 0) / trends.length;
}

export function computeWindowedWeightDelta(
  entries: WeightEntry[],
  windowDays: number,
): number | null {
  if (entries.length < 2) return null;
  const sorted = [...entries].sort((a, b) => a.at.localeCompare(b.at));
  const latest = sorted[sorted.length - 1];
  const cutoff = Date.now() - windowDays * 86400000;
  // First entry at/after the cutoff; falls back to the oldest entry when the
  // whole history is shorter than the window.
  const windowStart =
    sorted.find((e) => new Date(e.at).getTime() >= cutoff) ?? sorted[0];
  if (windowStart.id === latest.id) return null;
  return Math.round((latest.weightKg - windowStart.weightKg) * 10) / 10;
}

export interface CompositionEstimate {
  musclePct: number;
  fatPct: number;
  headline: string;
  tone: "good" | "warn" | "bad";
}

// A rough estimate, not a scientific one: correlates bodyweight change with
// whether strength (via the aggregate 1RM trend) moved with it or against it.
export function estimateComposition(
  weightDeltaKg: number,
  strengthTrendPct: number | null,
): CompositionEstimate {
  const strength = strengthTrendPct ?? 0;

  if (Math.abs(weightDeltaKg) < 0.3) {
    return {
      musclePct: 50,
      fatPct: 50,
      headline:
        "Weight has been stable — not enough change to estimate composition.",
      tone: "warn",
    };
  }

  if (weightDeltaKg > 0) {
    if (strength > 2)
      return {
        musclePct: 70,
        fatPct: 30,
        headline: "Strength is climbing with the scale — likely mostly muscle.",
        tone: "good",
      };
    if (strength > -2)
      return {
        musclePct: 50,
        fatPct: 50,
        headline: "Strength is roughly flat — a mix of muscle and fat.",
        tone: "warn",
      };
    return {
      musclePct: 25,
      fatPct: 75,
      headline: "Weight is up without a strength gain — likely mostly fat.",
      tone: "bad",
    };
  }

  if (strength >= 0)
    return {
      musclePct: 10,
      fatPct: 90,
      headline: "Losing weight while holding strength — likely mostly fat loss.",
      tone: "good",
    };
  if (strength > -5)
    return {
      musclePct: 30,
      fatPct: 70,
      headline:
        "Some strength loss alongside the deficit — keep protein and lifting up.",
      tone: "warn",
    };
  return {
    musclePct: 50,
    fatPct: 50,
    headline: "Strength dropped notably — real risk of muscle loss.",
    tone: "bad",
  };
}
