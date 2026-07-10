import { X } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import type { ExerciseInput } from "../../hooks/useExercises";
import type { Gym, TrainingDay } from "../../types";

interface AddExerciseModalProps {
  open: boolean;
  gyms: Gym[];
  days: TrainingDay[];
  defaultDayId: string;
  onClose: () => void;
  onAdd: (input: ExerciseInput) => void;
}

const fieldInput =
  "w-full rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none";

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-text-dim uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

export function AddExerciseModal({
  open,
  gyms,
  days,
  defaultDayId,
  onClose,
  onAdd,
}: AddExerciseModalProps) {
  const [name, setName] = useState("");
  const [gymId, setGymId] = useState<string>("both");
  const [dayId, setDayId] = useState(defaultDayId);
  const [repMin, setRepMin] = useState("5");
  const [repMax, setRepMax] = useState("8");
  const [step, setStep] = useState("2.5");
  const [startWeight, setStartWeight] = useState("20");
  const [bodyweight, setBodyweight] = useState(false);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      gymId,
      dayId,
      repMin: Number(repMin) || 5,
      repMax: Number(repMax) || 8,
      step: Number(step) || 2.5,
      startWeight: bodyweight ? 0 : Number(startWeight) || 0,
      bodyweight,
    });
    setName("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-label="Add exercise"
        className="flex max-h-[88vh] w-full max-w-[420px] flex-col gap-3.5 overflow-y-auto rounded-[18px] border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-[19px] text-text italic">
            Add exercise
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-text-dim transition-colors hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        <FieldRow label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Incline dumbbell press"
            className={fieldInput}
          />
        </FieldRow>

        <div className="grid grid-cols-2 gap-2.5">
          <FieldRow label="Gym">
            <select
              value={gymId}
              onChange={(e) => setGymId(e.target.value)}
              className={fieldInput}
            >
              <option value="both">Both</option>
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Day">
            <select
              value={dayId}
              onChange={(e) => setDayId(e.target.value)}
              className={fieldInput}
            >
              {days.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </FieldRow>
        </div>

        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={bodyweight}
            onChange={(e) => setBodyweight(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Bodyweight (log reps only)
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          <FieldRow label="Rep min">
            <input
              value={repMin}
              onChange={(e) => setRepMin(e.target.value)}
              type="number"
              inputMode="numeric"
              className={fieldInput}
            />
          </FieldRow>
          <FieldRow label="Rep max">
            <input
              value={repMax}
              onChange={(e) => setRepMax(e.target.value)}
              type="number"
              inputMode="numeric"
              className={fieldInput}
            />
          </FieldRow>
        </div>

        {!bodyweight && (
          <div className="grid grid-cols-2 gap-2.5">
            <FieldRow label="Step (kg)">
              <input
                value={step}
                onChange={(e) => setStep(e.target.value)}
                type="number"
                inputMode="decimal"
                className={fieldInput}
              />
            </FieldRow>
            <FieldRow label="Start weight (kg)">
              <input
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                type="number"
                inputMode="decimal"
                className={fieldInput}
              />
            </FieldRow>
          </div>
        )}

        <button
          type="submit"
          className="mt-1 w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-90"
        >
          Add exercise
        </button>
      </form>
    </div>
  );
}
