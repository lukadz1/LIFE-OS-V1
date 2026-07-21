import { Flame } from "lucide-react";
import { useState, type FormEvent } from "react";

interface WeightTrackerCardProps {
  latestKg: number | null;
  deltaKg: number | null;
  streak: number;
  onLog: (weightKg: number) => void;
}

export function WeightTrackerCard({
  latestKg,
  deltaKg,
  streak,
  onLog,
}: WeightTrackerCardProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = Number(input);
    if (!v || v <= 0) return;
    onLog(v);
    setInput("");
  }

  return (
    <div>
      <div className="mb-1 flex items-baseline gap-2">
        <span className="font-mono text-[44px] leading-none font-semibold text-text">
          {latestKg != null ? latestKg : "-"}
        </span>
        <span className="text-base text-text-dim">kg</span>
      </div>
      {deltaKg != null && (
        <p
          className={`mb-3 text-sm font-medium ${
            deltaKg > 0
              ? "text-[#ff9f0a]"
              : deltaKg < 0
                ? "text-[#30d158]"
                : "text-text-dim"
          }`}
        >
          {deltaKg > 0 ? "+" : ""}
          {deltaKg}kg vs previous log
        </p>
      )}
      {streak > 0 && (
        <p className="mb-3 flex items-center gap-1.5 text-sm text-[#30d158]">
          <Flame size={14} />
          {streak} day{streak === 1 ? "" : "s"} logged in a row
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="number"
          step="0.1"
          inputMode="decimal"
          placeholder="Today's weight"
          className="min-w-0 flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-90"
        >
          Log
        </button>
      </form>
    </div>
  );
}
