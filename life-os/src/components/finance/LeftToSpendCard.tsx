import { Pencil } from "lucide-react";
import { useState } from "react";
import type { Currency } from "../../types";
import { formatMoney } from "../../utils/currency";

interface LeftToSpendCardProps {
  budgetChf: number | null;
  spentChf: number;
  currency: Currency;
  onSetBudget: (budgetChf: number | null) => void;
}

/** The one number that matters: monthly budget minus what's spent. One tap on
 * the pencil edits the single budget figure — no per-category planning. */
export function LeftToSpendCard({
  budgetChf,
  spentChf,
  currency,
  onSetBudget,
}: LeftToSpendCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const now = new Date();
  const monthLabel = now
    .toLocaleDateString(undefined, { month: "long" })
    .toUpperCase();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;

  const hasBudget = budgetChf != null && budgetChf > 0;
  const leftChf = hasBudget ? budgetChf - spentChf : 0;
  const over = hasBudget && leftChf < 0;
  const perDayChf = daysLeft > 0 ? Math.max(0, leftChf) / daysLeft : 0;
  const pctLeft = hasBudget ? Math.max(0, leftChf) / budgetChf : 0;

  const barColor = over
    ? "#ff453a"
    : pctLeft < 0.1
      ? "#ff453a"
      : pctLeft < 0.3
        ? "#f59e0b"
        : "#34d399";

  function startEditing() {
    setDraft(hasBudget ? String(Math.round(budgetChf)) : "");
    setEditing(true);
  }

  function saveBudget() {
    const value = Number(draft.replace(",", "."));
    if (Number.isFinite(value) && value > 0) {
      onSetBudget(value);
      setEditing(false);
    }
  }

  return (
    <div className="panel-card rounded-[22px] bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
          {hasBudget ? `Left to spend · ${monthLabel}` : `Spent · ${monthLabel}`}
        </p>
        {!editing && (
          <button
            onClick={startEditing}
            aria-label="Edit monthly budget"
            className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] tracking-wide text-text-dim uppercase transition-colors hover:text-text"
          >
            <Pencil size={11} />
            Budget
          </button>
        )}
      </div>

      <p
        className={`mt-1.5 font-sans text-[42px] leading-none ${
          over ? "text-[#ff453a]" : "text-text"
        }`}
      >
        {formatMoney(hasBudget ? leftChf : spentChf, currency)}
      </p>

      {editing ? (
        <div className="mt-4 flex items-center gap-2">
          <input
            autoFocus
            type="text"
            inputMode="decimal"
            placeholder="Monthly budget"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveBudget();
              if (e.key === "Escape") setEditing(false);
            }}
            aria-label="Monthly budget"
            className="w-full max-w-[200px] rounded-[10px] bg-field px-3 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
          />
          <button
            onClick={saveBudget}
            className="rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-contrast transition-opacity hover:opacity-90"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-full border border-border px-4 py-2 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
          >
            Cancel
          </button>
        </div>
      ) : hasBudget ? (
        <>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gauge-track">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pctLeft * 100}%`, backgroundColor: barColor }}
            />
          </div>
          <p className="mt-2.5 text-[13px] text-text-dim">
            {over
              ? `${formatMoney(Math.abs(leftChf), currency)} over your ${formatMoney(budgetChf, currency)} budget`
              : `${formatMoney(spentChf, currency)} of ${formatMoney(budgetChf, currency)} spent · ${formatMoney(perDayChf, currency)}/day for ${daysLeft} more ${daysLeft === 1 ? "day" : "days"}`}
          </p>
        </>
      ) : (
        <button
          onClick={startEditing}
          className="mt-4 rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-contrast transition-opacity hover:opacity-90"
        >
          Set a monthly budget
        </button>
      )}
    </div>
  );
}
