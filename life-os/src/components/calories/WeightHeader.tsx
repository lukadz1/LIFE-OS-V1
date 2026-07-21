import { useState, type FormEvent } from "react";

interface WeightHeaderProps {
  latestKg: number | null;
  deltaKg: number | null;
  onLog: (weightKg: number) => void;
}

export function WeightHeader({ latestKg, deltaKg, onLog }: WeightHeaderProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = Number(input);
    if (!v || v <= 0) return;
    onLog(v);
    setInput("");
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
          Current weight
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-mono text-[44px] leading-none font-semibold tracking-tight text-text tabular-nums">
            {latestKg != null ? latestKg : "-"}
          </span>
          <span className="text-sm font-medium text-text-dim">kg</span>
        </div>
        {deltaKg != null && (
          <p
            className={`mt-1.5 text-[13px] font-medium ${
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
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="number"
          step="0.1"
          inputMode="decimal"
          placeholder="Log today"
          className="w-28 min-w-0 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
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
