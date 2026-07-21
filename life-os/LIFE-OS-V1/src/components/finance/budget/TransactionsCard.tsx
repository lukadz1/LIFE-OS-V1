import { Plus, Trash2, Upload } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { TransactionInput } from "../../../hooks/useSpending";
import type { Currency, SpendCategory, Transaction } from "../../../types";
import { currencyToChf, formatMoney } from "../../../utils/currency";
import { todayISO } from "../../../utils/date";
import { BUCKET_META, monthKey, monthLabel } from "../../../utils/spendingEngine";

interface TransactionsCardProps {
  transactions: Transaction[];
  categories: SpendCategory[];
  currency: Currency;
  onAdd: (input: TransactionInput) => void;
  onUpdateCategory: (id: string, categoryId: string | null) => void;
  onDelete: (id: string) => void;
  onOpenImport: () => void;
}

export function TransactionsCard({
  transactions,
  categories,
  currency,
  onAdd,
  onUpdateCategory,
  onDelete,
  onOpenImport,
}: TransactionsCardProps) {
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  const catById = (id: string | null) =>
    id ? categories.find((c) => c.id === id) ?? null : null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const val = Number(amount);
    if (!description.trim() || !val || val <= 0) return;
    onAdd({
      date,
      amountChf: currencyToChf(val, currency),
      description: description.trim(),
      categoryId: categoryId || null,
    });
    setDescription("");
    setAmount("");
  }

  // Group by month for readable separators.
  const groups: { month: string; items: Transaction[] }[] = [];
  for (const t of transactions) {
    const key = monthKey(t.date);
    const last = groups[groups.length - 1];
    if (last && last.month === key) last.items.push(t);
    else groups.push({ month: key, items: [t] });
  }

  return (
    <div className="panel-card flex flex-col rounded-[22px] bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-serif text-[19px] text-text italic">Transactions</h3>
        <button
          type="button"
          onClick={onOpenImport}
          className="flex items-center gap-1.5 rounded-full border border-border bg-field px-3 py-1.5 font-mono text-[11px] text-text-dim transition-colors hover:text-text"
        >
          <Upload size={12} />
          Import CSV
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-[10px] bg-field px-3 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="min-w-[8rem] flex-[1.5] rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Amount (${currency})`}
          inputMode="decimal"
          className="w-28 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="min-w-[8rem] flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
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
          aria-label="Add transaction"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </form>

      <div className="mt-3 max-h-[420px] overflow-y-auto border-t border-border pt-2">
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-text-dim italic">
            No transactions yet. Add one above or import a CSV.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.month}>
              <p className="mt-2 mb-1 font-mono text-[10px] tracking-wide text-text-dim uppercase">
                {monthLabel(group.month)} {group.month.slice(0, 4)}
              </p>
              {group.items.map((t) => {
                const cat = catById(t.categoryId);
                const color = cat
                  ? BUCKET_META[cat.bucket].color
                  : "var(--color-text-dim)";
                return (
                  <div
                    key={t.id}
                    className="group flex items-center justify-between gap-2 rounded-[10px] px-1 py-1.5 transition-colors hover:bg-hover"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text">
                        {t.description}
                      </p>
                      <p className="font-mono text-[11px] text-text-dim">
                        {new Date(t.date).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                        })}
                        {t.recurringId ? " · recurring" : ""}
                      </p>
                    </div>
                    <select
                      value={t.categoryId ?? ""}
                      onChange={(e) =>
                        onUpdateCategory(t.id, e.target.value || null)
                      }
                      className="max-w-[8rem] shrink-0 rounded-lg bg-field px-2 py-1 text-[11px] text-text focus:ring-2 focus:ring-accent focus:outline-none"
                      style={{ color }}
                    >
                      <option value="">—</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="w-20 shrink-0 text-right font-mono text-[13px] text-text">
                      {formatMoney(t.amountChf, currency)}
                    </span>
                    <button
                      onClick={() => onDelete(t.id)}
                      aria-label={`Delete ${t.description}`}
                      className="rounded-lg p-1 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#ff453a]/10 hover:text-[#ff453a] focus-visible:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
