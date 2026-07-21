import { useState } from "react";
import type { Exercise } from "../../types";

interface SetLoggerProps {
  exercise: Exercise;
  initialWeight: number;
  onLog: (weight: number, reps: number) => void;
}

const REP_PILLS = [5, 6, 7, 8, 9, 10, 11, 12];

export function SetLogger({ exercise, initialWeight, onLog }: SetLoggerProps) {
  const [weight, setWeight] = useState(initialWeight);
  const [reps, setReps] = useState<number | null>(null);
  const [repsInput, setRepsInput] = useState("");

  function handleLog() {
    const repsValue = reps ?? Number(repsInput);
    if (!repsValue || repsValue <= 0) return;
    onLog(exercise.bodyweight ? 0 : weight, repsValue);
    setReps(null);
    setRepsInput("");
  }

  return (
    <div className="flex flex-col gap-3">
      {!exercise.bodyweight && (
        <div>
          <label className="mb-1.5 block font-mono text-[10px] tracking-wide text-text-dim uppercase">
            Weight (kg)
          </label>
          <div className="grid grid-cols-[auto_1fr_auto] items-stretch gap-2">
            <button
              onClick={() => setWeight((w) => Math.max(0, w - exercise.step))}
              aria-label="Decrease weight"
              className="min-w-[48px] rounded-[10px] bg-field text-lg font-bold text-text transition-colors hover:bg-hover"
            >
              −
            </button>
            <div className="flex items-center justify-center rounded-[10px] bg-field font-mono text-xl font-bold text-text">
              {weight}
            </div>
            <button
              onClick={() => setWeight((w) => w + exercise.step)}
              aria-label="Increase weight"
              className="min-w-[48px] rounded-[10px] bg-field text-lg font-bold text-text transition-colors hover:bg-hover"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block font-mono text-[10px] tracking-wide text-text-dim uppercase">
          Reps
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {REP_PILLS.map((r) => (
            <button
              key={r}
              onClick={() => {
                setReps(r);
                setRepsInput(String(r));
              }}
              className={`rounded-[8px] py-2.5 text-sm font-semibold transition-colors ${
                reps === r
                  ? "bg-accent text-accent-contrast"
                  : "bg-field text-text-dim hover:text-text"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <input
          value={repsInput}
          onChange={(e) => {
            setRepsInput(e.target.value);
            setReps(null);
          }}
          type="number"
          inputMode="numeric"
          placeholder="or type reps"
          className="mt-1.5 w-full rounded-[10px] bg-field px-3 py-2 text-center text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
      </div>

      <button
        onClick={handleLog}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-90"
      >
        Log set
      </button>
    </div>
  );
}
