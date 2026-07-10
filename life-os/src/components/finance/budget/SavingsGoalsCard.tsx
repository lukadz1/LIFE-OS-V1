import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { SavingsGoalInput } from "../../../hooks/useSpending";
import type {
  Currency,
  SavingsGoal,
  SpendCategory,
  Transaction,
} from "../../../types";
import { currencyToChf, formatMoney } from "../../../utils/currency";
import { savingsProgress } from "../../../utils/spendingEngine";

interface SavingsGoalsCardProps {
  goals: SavingsGoal[];
  transactions: Transaction[];
  categories: SpendCategory[];
  currency: Currency;
  onAdd: (input: SavingsGoalInput) => void;
  onDeposit: (id: string, amountChf: number) => void;
  onDelete: (id: string) => void;
}

export function SavingsGoalsCard({
  goals,
  transactions,
  categories,
  currency,
  onAdd,
  onDeposit,
  onDelete,
}: SavingsGoalsCardProps) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [linkedCategoryId, setLinkedCategoryId] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const savingsCategories = categories.filter((c) => c.bucket === "savings");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const val = Number(target);
    if (!name.trim() || !val || val <= 0) return;
    onAdd({
      name: name.trim(),
      targetChf: currencyToChf(val, currency),
      targetDate: targetDate || null,
      linkedCategoryId: linkedCategoryId || null,
    });
    setName("");
    setTarget("");
    setTargetDate("");
  }

  return (
    <div className="panel-card flex flex-col rounded-[22px] bg-surface p-5">
      <h3 className="mb-3 font-serif text-[19px] text-text italic">
        Savings goals
      </h3>

      <form onSubmit={handleSubmit} className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Goal name"
          className="min-w-[7rem] flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={`Target (${currency})`}
          inputMode="decimal"
          className="w-28 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <select
          value={linkedCategoryId}
          onChange={(e) => setLinkedCategoryId(e.target.value)}
          className="min-w-[8rem] flex-1 rounded-[10px] bg-field px-2 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
        >
          <option value="">Manual deposits</option>
          {savingsCategories.map((c) => (
            <option key={c.id} value={c.id}>
              Link · {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="rounded-[10px] bg-field px-3 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Add savings goal"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </form>

      <div className="flex flex-col gap-3 border-t border-border pt-3">
        {goals.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-text-dim italic">
            No goals yet — set one to track your savings.
          </p>
        ) : (
          goals.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              progress={savingsProgress(goal, transactions, categories)}
              currency={currency}
              onDeposit={onDeposit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

function GoalRow({
  goal,
  progress,
  currency,
  onDeposit,
  onDelete,
}: {
  goal: SavingsGoal;
  progress: ReturnType<typeof savingsProgress>;
  currency: Currency;
  onDeposit: (id: string, amountChf: number) => void;
  onDelete: (id: string) => void;
}) {
  const [deposit, setDeposit] = useState("");
  const pct = Math.min(100, progress.pct * 100);
  const reached = progress.pct >= 1;

  function handleDeposit() {
    const val = Number(deposit);
    if (!val || val <= 0) return;
    onDeposit(goal.id, currencyToChf(val, currency));
    setDeposit("");
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm text-text">{goal.name}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[12px] text-text">
            {formatMoney(progress.savedChf, currency)}{" "}
            <span className="text-text-dim">
              / {formatMoney(goal.targetChf, currency)}
            </span>
          </span>
          <button
            onClick={() => onDelete(goal.id)}
            aria-label={`Delete ${goal.name}`}
            className="rounded p-0.5 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#ff453a] focus-visible:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gauge-track">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: reached ? "#30d158" : "var(--color-accent)",
          }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-text-dim">
          {Math.round(progress.pct * 100)}%
          {progress.etaLabel ? ` · ETA ${progress.etaLabel}` : ""}
          {progress.monthlyRate > 0
            ? ` · ${formatMoney(progress.monthlyRate, currency)}/mo`
            : ""}
        </span>
        {goal.linkedCategoryId ? (
          <span className="font-mono text-[10px] text-text-dim italic">
            auto-linked
          </span>
        ) : (
          <div className="flex items-center gap-1">
            <input
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDeposit()}
              placeholder="+ deposit"
              inputMode="decimal"
              className="w-20 rounded-md bg-field px-2 py-1 text-[11px] text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
            />
            <button
              onClick={handleDeposit}
              className="rounded-md bg-field px-2 py-1 font-mono text-[10px] text-text-dim transition-colors hover:text-text"
            >
              add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
