import { useState, type FormEvent } from "react";
import type { PeakStackItem } from "../../types";

interface StackGridProps {
  stack: PeakStackItem[];
  setupOpen: boolean;
  onToggleSetup: () => void;
  onLog: (item: PeakStackItem) => void;
  onRemove: (id: string) => void;
  onUpdateMg: (id: string, mg: number) => void;
  onAdd: (name: string, mg: number) => void;
}

export function StackGrid({
  stack,
  setupOpen,
  onToggleSetup,
  onLog,
  onRemove,
  onUpdateMg,
  onAdd,
}: StackGridProps) {
  const [name, setName] = useState("");
  const [mg, setMg] = useState("");

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const val = Number(mg);
    if (!name.trim() || !val || val <= 0) return;
    onAdd(name.trim(), val);
    setName("");
    setMg("");
  }

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.1em] text-accent">
          · 01 YOUR DAY
        </p>
        <div className="flex items-center gap-3.5">
          <span className="font-mono text-[10px] tracking-[0.08em] text-text-dim">
            ONE TAP · YOUR STACK
          </span>
          <button
            onClick={onToggleSetup}
            className="rounded-lg border border-white/16 px-3 py-1.5 font-mono text-[10px] tracking-[0.04em] text-text/90 transition-colors hover:border-white/30"
          >
            + ADD
          </button>
          <button
            onClick={onToggleSetup}
            className="rounded-lg border border-white/16 px-3 py-1.5 font-mono text-[10px] tracking-[0.04em] text-text/90 transition-colors hover:border-white/30"
          >
            SETUP ▾
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {stack.map((item) => (
          <div
            key={item.id}
            className="relative flex flex-col gap-3.5 rounded-[14px] border border-white/8 bg-surface p-[18px]"
          >
            {setupOpen && (
              <button
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${item.name}`}
                className="absolute top-2.5 right-2.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/8 text-[12px] leading-none text-text-dim transition-colors hover:text-text"
              >
                ×
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-accent/32 bg-accent/12 text-sm font-semibold text-accent">
                {item.name.trim().charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <div className="text-[13px] text-text">{item.name}</div>
                {setupOpen ? (
                  <input
                    type="number"
                    value={item.mg}
                    onChange={(e) =>
                      onUpdateMg(item.id, Number(e.target.value) || 0)
                    }
                    className="mt-1 w-16 rounded-md border border-white/14 bg-white/6 px-1.5 py-0.5 font-mono text-[11px] text-text focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                ) : (
                  <div className="mt-0.5 text-[10.5px] text-text-dim">
                    {item.mg} mg
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onLog(item)}
              className="rounded-full bg-accent py-2.5 font-mono text-[11px] font-semibold tracking-[0.03em] text-accent-contrast transition-opacity hover:opacity-90"
            >
              + Log now
            </button>
          </div>
        ))}

        {setupOpen && (
          <form
            onSubmit={handleAdd}
            className="flex flex-col gap-2.5 rounded-[14px] border border-dashed border-white/18 bg-surface p-[18px]"
          >
            <p className="font-mono text-[10.5px] tracking-[0.08em] text-text-dim">
              ADD TO STACK
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="name"
              className="rounded-lg border border-white/14 bg-white/6 px-2.5 py-2 font-mono text-xs text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
            />
            <input
              value={mg}
              onChange={(e) => setMg(e.target.value)}
              placeholder="mg caffeine"
              inputMode="decimal"
              className="rounded-lg border border-white/14 bg-white/6 px-2.5 py-2 font-mono text-xs text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full border border-accent/40 bg-accent/16 py-2.5 font-mono text-[11px] font-semibold text-accent transition-opacity hover:opacity-90"
            >
              + Add item
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
