import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { CategoryInput } from "../../../hooks/useSpending";
import type {
  Currency,
  SpendCategory,
  Transaction,
  TxBucket,
} from "../../../types";
import { currencyToChf, formatMoney } from "../../../utils/currency";
import {
  BUCKETS,
  BUCKET_META,
  budgetStatus,
  currentMonthKey,
} from "../../../utils/spendingEngine";

interface CategoryBudgetsCardProps {
  categories: SpendCategory[];
  transactions: Transaction[];
  currency: Currency;
  onAdd: (input: CategoryInput) => void;
  onUpdate: (id: string, patch: Partial<CategoryInput>) => void;
  onDelete: (id: string) => void;
}

export function CategoryBudgetsCard({
  categories,
  transactions,
  currency,
  onAdd,
  onUpdate,
  onDelete,
}: CategoryBudgetsCardProps) {
  const [name, setName] = useState("");
  const [bucket, setBucket] = useState<TxBucket>("variable");
  const [budget, setBudget] = useState("");
  const [keywords, setKeywords] = useState("");
  const month = currentMonthKey();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const budgetNum = Number(budget);
    onAdd({
      name: name.trim(),
      bucket,
      monthlyBudgetChf:
        budget && budgetNum > 0 ? currencyToChf(budgetNum, currency) : null,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    });
    setName("");
    setBudget("");
    setKeywords("");
  }

  return (
    <div className="panel-card flex flex-col rounded-[22px] bg-surface p-5">
      <h3 className="mb-3 font-serif text-[19px] text-text italic">
        Category budgets · {new Date(`${month}-01`).toLocaleDateString(undefined, { month: "long" })}
      </h3>

      <form
        onSubmit={handleSubmit}
        className="mb-3 flex flex-wrap items-center gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category"
          className="min-w-[7rem] flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <select
          value={bucket}
          onChange={(e) => setBucket(e.target.value as TxBucket)}
          className="rounded-[10px] bg-field px-2 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
        >
          {BUCKETS.map((b) => (
            <option key={b} value={b}>
              {BUCKET_META[b].label}
            </option>
          ))}
        </select>
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder={`Budget (${currency})`}
          inputMode="decimal"
          className="w-28 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Keywords (comma-sep)"
          className="min-w-[8rem] flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Add category"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </form>

      <div className="flex flex-col gap-4 border-t border-border pt-3">
        {BUCKETS.map((b) => {
          const inBucket = categories.filter((c) => c.bucket === b);
          if (inBucket.length === 0) return null;
          return (
            <div key={b}>
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: BUCKET_META[b].color }}
                />
                <p className="font-mono text-[10px] tracking-wide text-text-dim uppercase">
                  {BUCKET_META[b].label}
                </p>
              </div>
              <div className="flex flex-col gap-2.5">
                {inBucket.map((c) => (
                  <CategoryRow
                    key={c.id}
                    category={c}
                    status={budgetStatus(c, transactions, month)}
                    currency={currency}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  status,
  currency,
  onUpdate,
  onDelete,
}: {
  category: SpendCategory;
  status: ReturnType<typeof budgetStatus>;
  currency: Currency;
  onUpdate: (id: string, patch: Partial<CategoryInput>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const hasBudget = status.budgetChf != null;
  const pct = status.pct != null ? Math.min(100, status.pct * 100) : 0;
  const barColor = status.over ? "#ff453a" : "#30d158";

  function commit() {
    const num = Number(draft);
    onUpdate(category.id, {
      monthlyBudgetChf: draft && num > 0 ? currencyToChf(num, currency) : null,
    });
    setEditing(false);
    setDraft("");
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm text-text">{category.name}</span>
        <div className="flex shrink-0 items-center gap-2 font-mono text-[12px]">
          <span className="text-text">{formatMoney(status.spentChf, currency)}</span>
          <span className="text-text-dim">/</span>
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              placeholder="0"
              inputMode="decimal"
              className="w-16 rounded bg-field px-1.5 py-0.5 text-right text-text focus:ring-2 focus:ring-accent focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setDraft(
                  status.budgetChf != null
                    ? String(Math.round(currencyToChf(status.budgetChf, currency)))
                    : "",
                );
              }}
              className="text-text-dim transition-colors hover:text-text"
            >
              {hasBudget ? formatMoney(status.budgetChf as number, currency) : "set budget"}
            </button>
          )}
          <button
            onClick={() => onDelete(category.id)}
            aria-label={`Delete ${category.name}`}
            className="rounded p-0.5 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#ff453a] focus-visible:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {hasBudget && (
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gauge-track">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: barColor }}
            />
          </div>
          <span
            className="shrink-0 font-mono text-[10px]"
            style={{ color: status.over ? "#ff453a" : "var(--color-text-dim)" }}
          >
            {status.over
              ? `${formatMoney(Math.abs(status.remainingChf as number), currency)} over`
              : `${formatMoney(status.remainingChf as number, currency)} left`}
          </span>
        </div>
      )}
    </div>
  );
}
