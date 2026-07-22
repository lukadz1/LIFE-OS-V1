import { useState, type FormEvent } from "react";
import type { PeakPlanItem } from "../../types";

interface TodaysPlanProps {
  items: PeakPlanItem[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}

export function TodaysPlan({ items, onAdd, onRemove }: TodaysPlanProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  }

  return (
    <div className="mt-[22px] border-t border-border pt-[18px]">
      <p className="mb-2.5 font-mono text-[10px] tracking-[0.1em] text-text-dim">
        TODAY'S PLAN
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. deep work 9-11 hard, gym 1930, road 30m, big gap email"
          className="min-w-0 flex-1 rounded-lg border border-white/12 bg-white/5 px-3 py-2.5 font-mono text-[11.5px] text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-white/18 px-4 font-mono text-[10.5px] text-text/90 transition-colors hover:border-white/30"
        >
          ↵ ADD
        </button>
      </form>
      {items.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/7 bg-white/4 px-3 py-2.5 text-[11.5px] text-text/90"
            >
              <span>{item.text}</span>
              <button
                onClick={() => onRemove(item.id)}
                aria-label="Remove plan item"
                className="text-[13px] text-text-dim/60 transition-colors hover:text-text"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
