import { Check, Plus, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { RecurringInput } from "../../../hooks/useSpending";
import type {
  Currency,
  RecurrenceInterval,
  RecurringRule,
  SpendCategory,
} from "../../../types";
import { currencyToChf, formatMoney } from "../../../utils/currency";
import { todayISO } from "../../../utils/date";
import { INTERVAL_LABEL, dueRecurring } from "../../../utils/spendingEngine";

const INTERVALS: RecurrenceInterval[] = ["weekly", "monthly", "yearly"];

interface RecurringCardProps {
  recurring: RecurringRule[];
  categories: SpendCategory[];
  currency: Currency;
  onAdd: (input: RecurringInput) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onConfirm: (id: string) => void;
  onSkip: (id: string) => void;
}

export function RecurringCard({
  recurring,
  categories,
  currency,
  onAdd,
  onToggle,
  onDelete,
  onConfirm,
  onSkip,
}: RecurringCardProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [interval, setInterval] = useState<RecurrenceInterval>("monthly");

  const today = todayISO();
  const due = dueRecurring(recurring, today);
  const catName = (id: string | null) =>
    id ? categories.find((c) => c.id === id)?.name ?? "—" : "Uncategorized";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const val = Number(amount);
    if (!description.trim() || !val || val <= 0) return;
    onAdd({
      description: description.trim(),
      amountChf: currencyToChf(val, currency),
      categoryId: categoryId || null,
      interval,
      nextDue: today,
    });
    setDescription("");
    setAmount("");
  }

  return (
    <div className="panel-card flex flex-col rounded-[22px] bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-serif text-[19px] text-text italic">Recurring</h3>
        {due.length > 0 && (
          <span className="rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[10px] text-accent">
            {due.length} draft{due.length > 1 ? "s" : ""} due
          </span>
        )}
      </div>

      {due.length > 0 && (
        <div className="mb-3 flex flex-col gap-2 rounded-[14px] border border-accent/25 bg-accent/[0.06] p-3">
          <p className="font-mono text-[10px] tracking-wide text-text-dim uppercase">
            Confirm to book
          </p>
          {due.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-text">{r.description}</p>
                <p className="font-mono text-[11px] text-text-dim">
                  {formatMoney(r.amountChf, currency)} ·{" "}
                  {new Date(r.nextDue).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => onConfirm(r.id)}
                  aria-label="Confirm draft"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-contrast transition-opacity hover:opacity-90"
                >
                  <Check size={14} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => onSkip(r.id)}
                  aria-label="Skip draft"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-text-dim transition-colors hover:text-text"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Rent, Netflix"
          className="min-w-[7rem] flex-[1.5] rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={currency}
          inputMode="decimal"
          className="w-20 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value as RecurrenceInterval)}
          className="rounded-[10px] bg-field px-2 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
        >
          {INTERVALS.map((i) => (
            <option key={i} value={i}>
              {INTERVAL_LABEL[i]}
            </option>
          ))}
        </select>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="min-w-[7rem] flex-1 rounded-[10px] bg-field px-2 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
        >
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          aria-label="Add recurring rule"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </form>

      {recurring.length > 0 && (
        <div className="mt-3 flex flex-col gap-0.5 border-t border-border pt-2">
          {recurring.map((r) => (
            <div
              key={r.id}
              className="group flex items-center justify-between gap-2 rounded-[10px] px-1 py-1.5 transition-colors hover:bg-hover"
            >
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm ${r.active ? "text-text" : "text-text-dim line-through"}`}
                >
                  {r.description}
                </p>
                <p className="font-mono text-[11px] text-text-dim">
                  {INTERVAL_LABEL[r.interval]} · {catName(r.categoryId)} · next{" "}
                  {new Date(r.nextDue).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[13px] text-text">
                {formatMoney(r.amountChf, currency)}
              </span>
              <button
                onClick={() => onToggle(r.id)}
                className="shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] text-text-dim transition-colors hover:text-text"
              >
                {r.active ? "pause" : "resume"}
              </button>
              <button
                onClick={() => onDelete(r.id)}
                aria-label={`Delete ${r.description}`}
                className="shrink-0 rounded-lg p-1 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#ff453a]/10 hover:text-[#ff453a] focus-visible:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
