import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { UserProfile } from "../../types";

interface SettingsModalProps {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

// Rounding minutes-style: 11.65in rounds to 12, which must roll over to the
// next foot (6'0") rather than display as the nonsensical "5'12"".
function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalIn = cm / 2.54;
  let ft = Math.floor(totalIn / 12);
  let inch = Math.round(totalIn % 12);
  if (inch === 12) {
    ft += 1;
    inch = 0;
  }
  return { ft, inch };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-text-dim uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

function UnitSeg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly [T, string][];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex shrink-0 rounded-[9px] bg-field p-[2px] text-xs">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded-[7px] px-2.5 py-2 font-medium transition-colors ${
            value === v
              ? "bg-segment text-text shadow-sm"
              : "text-text-dim hover:text-text"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const inputClass =
  "min-w-0 flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none";

export function SettingsModal({
  open,
  profile,
  onClose,
  onSave,
}: SettingsModalProps) {
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [heightCmInput, setHeightCmInput] = useState("");
  const [heightFtInput, setHeightFtInput] = useState("");
  const [heightInInput, setHeightInInput] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [weightInput, setWeightInput] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"m" | "f">("m");
  const [activity, setActivity] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSaved(false);
    setHeightUnit(profile.heightUnit);
    setWeightUnit(profile.weightUnit);
    setSex(profile.sex ?? "m");
    setAge(profile.age != null ? String(profile.age) : "");
    setActivity(
      profile.activityHrsPerWeek != null ? String(profile.activityHrsPerWeek) : "",
    );
    setHeightCmInput("");
    setHeightFtInput("");
    setHeightInInput("");
    if (profile.heightCm != null) {
      if (profile.heightUnit === "ft") {
        const { ft, inch } = cmToFtIn(profile.heightCm);
        setHeightFtInput(String(ft));
        setHeightInInput(String(inch));
      } else {
        setHeightCmInput(String(Math.round(profile.heightCm)));
      }
    }
    setWeightInput(
      profile.weightKg != null
        ? String(
            Math.round(
              profile.weightUnit === "lb"
                ? profile.weightKg * 2.20462
                : profile.weightKg,
            ),
          )
        : "",
    );
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleHeightUnitChange(unit: "cm" | "ft") {
    if (unit !== heightUnit) {
      if (unit === "ft") {
        const cm = Number(heightCmInput);
        if (cm > 0) {
          const { ft, inch } = cmToFtIn(cm);
          setHeightFtInput(String(ft));
          setHeightInInput(String(inch));
        }
      } else {
        const ft = Number(heightFtInput) || 0;
        const inch = Number(heightInInput) || 0;
        const cm = ft * 30.48 + inch * 2.54;
        if (cm > 0) setHeightCmInput(String(Math.round(cm)));
      }
    }
    setHeightUnit(unit);
  }

  function handleWeightUnitChange(unit: "kg" | "lb") {
    if (unit !== weightUnit) {
      const v = Number(weightInput);
      if (v > 0) {
        const kg = weightUnit === "lb" ? v / 2.20462 : v;
        setWeightInput(String(Math.round(unit === "lb" ? kg * 2.20462 : kg)));
      }
    }
    setWeightUnit(unit);
  }

  function handleSave() {
    let heightCm: number | null = null;
    if (heightUnit === "cm") {
      const v = Number(heightCmInput);
      if (v > 0) heightCm = v;
    } else {
      const ft = Number(heightFtInput) || 0;
      const inch = Number(heightInInput) || 0;
      const cm = ft * 30.48 + inch * 2.54;
      if (cm > 0) heightCm = Math.round(cm);
    }

    let weightKg: number | null = null;
    const wv = Number(weightInput);
    if (wv > 0) weightKg = weightUnit === "lb" ? +(wv / 2.20462).toFixed(1) : wv;

    const ageNum = Number(age);
    const activityNum = Number(activity);

    onSave({
      heightCm,
      heightUnit,
      weightKg,
      weightUnit,
      age: ageNum > 0 ? ageNum : null,
      sex,
      activityHrsPerWeek:
        activity !== "" && !Number.isNaN(activityNum) && activityNum >= 0
          ? activityNum
          : null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="Your data"
        className="max-h-[88vh] w-full max-w-[440px] overflow-y-auto rounded-[18px] border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[19px] text-text italic">
            Your data
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-text-dim transition-colors hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        <Field label="Height">
          <div className="flex items-center gap-2">
            {heightUnit === "cm" ? (
              <input
                value={heightCmInput}
                onChange={(e) => setHeightCmInput(e.target.value)}
                type="number"
                min="0"
                inputMode="decimal"
                placeholder="cm"
                className={inputClass}
              />
            ) : (
              <>
                <input
                  value={heightFtInput}
                  onChange={(e) => setHeightFtInput(e.target.value)}
                  type="number"
                  min="0"
                  inputMode="decimal"
                  placeholder="ft"
                  className={inputClass}
                />
                <input
                  value={heightInInput}
                  onChange={(e) => setHeightInInput(e.target.value)}
                  type="number"
                  min="0"
                  inputMode="decimal"
                  placeholder="in"
                  className={inputClass}
                />
              </>
            )}
            <UnitSeg
              options={
                [
                  ["cm", "cm"],
                  ["ft", "ft/in"],
                ] as const
              }
              value={heightUnit}
              onChange={handleHeightUnitChange}
            />
          </div>
        </Field>

        <Field label="Weight">
          <div className="flex items-center gap-2">
            <input
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="weight"
              className={inputClass}
            />
            <UnitSeg
              options={
                [
                  ["kg", "kg"],
                  ["lb", "lb"],
                ] as const
              }
              value={weightUnit}
              onChange={handleWeightUnitChange}
            />
          </div>
        </Field>

        <Field label="Age">
          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="years"
            className={`${inputClass} w-full`}
          />
        </Field>

        <Field label="Sex">
          <div className="flex rounded-[9px] bg-field p-[2px] text-sm">
            {(["m", "f"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSex(s)}
                className={`flex-1 rounded-[7px] py-2 font-medium transition-colors ${
                  sex === s
                    ? "bg-segment text-text shadow-sm"
                    : "text-text-dim hover:text-text"
                }`}
              >
                {s === "m" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Active hours / week">
          <input
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="e.g. 5"
            className={`${inputClass} w-full`}
          />
        </Field>

        <button
          onClick={handleSave}
          className="mt-1 w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-90"
        >
          Save
        </button>
        {saved && (
          <p className="mt-2 text-center text-xs text-accent">Saved ✓</p>
        )}
      </div>
    </div>
  );
}
