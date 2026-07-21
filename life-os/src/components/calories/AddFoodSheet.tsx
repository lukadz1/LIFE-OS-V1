import { useState } from "react";
import { MACRO_COLORS } from "./MacroBreakdown";

interface AddFoodSheetProps {
  onClose: () => void;
  onSave: (entry: {
    label: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  }) => void;
}

const fieldClass =
  "min-w-0 flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none";

export function AddFoodSheet({ onClose, onSave }: AddFoodSheetProps) {
  const [label, setLabel] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const canSave = label.trim().length > 0 && Number(kcal) > 0;

  function handleSave() {
    if (!canSave) return;
    onSave({
      label: label.trim(),
      kcal: Number(kcal) || 0,
      proteinG: Number(protein) || 0,
      carbsG: Number(carbs) || 0,
      fatG: Number(fat) || 0,
    });
  }

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[40] bg-black/60 backdrop-blur-[2px]"
      />
      <div
        className="fixed inset-x-0 bottom-0 z-[41] mx-auto max-w-[460px] rounded-t-[26px] border-x border-t border-white/10 px-5.5 pt-2.5 pb-[calc(2rem+env(safe-area-inset-bottom))]"
        style={{ background: "#0c0c0c" }}
      >
        <div className="mx-auto mt-2 mb-4.5 h-1 w-9 rounded-full bg-white/15" />
        <h3 className="font-serif text-[28px] italic">Add food</h3>
        <div className="mt-4 flex flex-col gap-3">
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What did you eat?"
            className={`${fieldClass} w-full`}
          />
          <div className="flex items-center gap-2">
            <input
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              placeholder="kcal"
              inputMode="numeric"
              className={fieldClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <MacroField
              value={protein}
              onChange={setProtein}
              placeholder="Protein g"
              color={MACRO_COLORS.protein}
            />
            <MacroField
              value={carbs}
              onChange={setCarbs}
              placeholder="Carbs g"
              color={MACRO_COLORS.carbs}
            />
            <MacroField
              value={fat}
              onChange={setFat}
              placeholder="Fat g"
              color={MACRO_COLORS.fat}
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-white/15 px-6 py-3.5 text-center font-serif text-[20px] text-text-dim italic"
          >
            cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 rounded-full bg-accent px-6 py-3.5 text-center font-serif text-[20px] text-accent-contrast italic disabled:opacity-40"
          >
            save
          </button>
        </div>
      </div>
    </>
  );
}

function MacroField(props: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  color: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <span
        aria-hidden
        className="absolute top-1/2 left-2.5 h-2 w-2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: props.color }}
      />
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        inputMode="numeric"
        className={`${fieldClass} w-full pl-6`}
      />
    </div>
  );
}
