import { Plus, X } from "lucide-react";
import { useState } from "react";
import type {
  Currency,
  FinanceAccount,
  SavingsGoal,
  SpendCategory,
  Transaction,
} from "../../types";
import { formatMoney } from "../../utils/currency";
import { savingsProgress } from "../../utils/spendingEngine";

interface MoneyCardProps {
  accounts: (FinanceAccount & { valueChf: number })[];
  netWorthChf: number;
  goals: SavingsGoal[];
  transactions: Transaction[];
  categories: SpendCategory[];
  currency: Currency;
  onAddAccount: (input: { name: string; valueChf: number }) => void;
  onSetAccountValue: (id: string, valueChf: number) => void;
  onDeleteAccount: (id: string) => void;
  onAddGoal: (input: { name: string; targetChf: number }) => void;
  onDepositGoal: (id: string, amountChf: number) => void;
  onDeleteGoal: (id: string) => void;
}

/** Everything owned in one flat list — tap a value to correct it, no asset
 * categories to manage. Price-tracked positions (stocks/crypto) stay
 * read-only and are marked "live". Savings goals live right below. */
export function MoneyCard({
  accounts,
  netWorthChf,
  goals,
  transactions,
  categories,
  currency,
  onAddAccount,
  onSetAccountValue,
  onDeleteAccount,
  onAddGoal,
  onDepositGoal,
  onDeleteGoal,
}: MoneyCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [valueDraft, setValueDraft] = useState("");

  const [addingAccount, setAddingAccount] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountValue, setAccountValue] = useState("");

  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositDraft, setDepositDraft] = useState("");

  const [addingGoal, setAddingGoal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  function parseAmount(raw: string): number | null {
    const value = Number(raw.replace(",", "."));
    return Number.isFinite(value) ? value : null;
  }

  function saveValue(id: string) {
    const value = parseAmount(valueDraft);
    if (value != null && value >= 0) onSetAccountValue(id, value);
    setEditingId(null);
  }

  function saveAccount() {
    const value = parseAmount(accountValue);
    if (!accountName.trim() || value == null || value < 0) return;
    onAddAccount({ name: accountName.trim(), valueChf: value });
    setAccountName("");
    setAccountValue("");
    setAddingAccount(false);
  }

  function saveDeposit(id: string) {
    const value = parseAmount(depositDraft);
    if (value != null && value > 0) onDepositGoal(id, value);
    setDepositId(null);
    setDepositDraft("");
  }

  function saveGoal() {
    const target = parseAmount(goalTarget);
    if (!goalName.trim() || target == null || target <= 0) return;
    onAddGoal({ name: goalName.trim(), targetChf: target });
    setGoalName("");
    setGoalTarget("");
    setAddingGoal(false);
  }

  const inputClass =
    "rounded-[10px] bg-field px-3 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none";

  return (
    <div className="panel-card rounded-[22px] bg-surface p-5">
      <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
        My money
      </p>
      <p className="mt-1.5 font-sans text-[42px] leading-none text-text">
        {formatMoney(netWorthChf, currency)}
      </p>

      <div className="mt-4 flex flex-col">
        {accounts.map((a) => {
          const priced = a.quantity != null;
          const editing = editingId === a.id;
          return (
            <div
              key={a.id}
              className="group flex items-center gap-3 border-b border-border py-2.5 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-text">
                  {a.name}
                  {priced && (
                    <span className="ml-2 rounded-full bg-field px-2 py-0.5 font-mono text-[10px] tracking-wide text-text-dim uppercase">
                      live
                    </span>
                  )}
                </p>
                {priced && (
                  <p className="mt-0.5 text-xs text-text-dim">
                    {a.quantity} {a.category === "crypto" ? "coins" : "shares"}
                  </p>
                )}
              </div>
              {editing ? (
                <input
                  autoFocus
                  type="text"
                  inputMode="decimal"
                  value={valueDraft}
                  onChange={(e) => setValueDraft(e.target.value)}
                  onBlur={() => saveValue(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveValue(a.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  aria-label={`Value of ${a.name}`}
                  className={`${inputClass} w-[110px] text-right font-mono`}
                />
              ) : (
                <button
                  onClick={() => {
                    if (priced) return;
                    setValueDraft(String(Math.round(a.valueChf)));
                    setEditingId(a.id);
                  }}
                  disabled={priced}
                  title={priced ? undefined : "Tap to edit"}
                  className={`shrink-0 rounded-[8px] px-1.5 py-0.5 font-mono text-[13.5px] text-text ${
                    priced ? "" : "transition-colors hover:bg-hover"
                  }`}
                >
                  {formatMoney(a.valueChf, currency)}
                </button>
              )}
              <button
                onClick={() => onDeleteAccount(a.id)}
                aria-label={`Delete ${a.name}`}
                className="shrink-0 rounded-full p-1.5 text-text-dim opacity-0 transition-all group-hover:opacity-100 hover:text-[#ff453a]"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {addingAccount ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Name, e.g. Neon"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className={`${inputClass} min-w-0 flex-1 basis-[140px]`}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder={currency}
            value={accountValue}
            onChange={(e) => setAccountValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveAccount();
            }}
            className={`${inputClass} w-[110px]`}
          />
          <button
            onClick={saveAccount}
            className="rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-contrast transition-opacity hover:opacity-90"
          >
            Add
          </button>
          <button
            onClick={() => setAddingAccount(false)}
            className="rounded-full border border-border px-4 py-2 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingAccount(true)}
          className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
        >
          <Plus size={14} />
          Add account
        </button>
      )}

      <p className="mt-5 mb-1 font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
        Savings goals
      </p>
      {goals.length === 0 && !addingGoal && (
        <p className="text-[13px] text-text-dim">
          No goals yet — saving for something?
        </p>
      )}
      <div className="flex flex-col gap-3">
        {goals.map((g) => {
          const progress = savingsProgress(g, transactions, categories);
          const pct = Math.min(1, progress.pct);
          const reached = progress.savedChf >= g.targetChf;
          return (
            <div key={g.id} className="group">
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-[14px] text-text">
                  {g.name}
                </p>
                <span className="shrink-0 font-mono text-[12.5px] text-text-dim">
                  {formatMoney(progress.savedChf, currency)} /{" "}
                  {formatMoney(g.targetChf, currency)}
                </span>
                <button
                  onClick={() => {
                    setDepositId(depositId === g.id ? null : g.id);
                    setDepositDraft("");
                  }}
                  aria-label={`Add money to ${g.name}`}
                  className="shrink-0 rounded-full border border-border p-1 text-text-dim transition-colors hover:text-text"
                >
                  <Plus size={13} />
                </button>
                <button
                  onClick={() => onDeleteGoal(g.id)}
                  aria-label={`Delete ${g.name}`}
                  className="shrink-0 rounded-full p-1 text-text-dim opacity-0 transition-all group-hover:opacity-100 hover:text-[#ff453a]"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gauge-track">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct * 100}%`,
                    backgroundColor: reached ? "#34d399" : "var(--color-accent)",
                  }}
                />
              </div>
              {depositId === g.id && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    inputMode="decimal"
                    placeholder={`Amount (${currency})`}
                    value={depositDraft}
                    onChange={(e) => setDepositDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveDeposit(g.id);
                      if (e.key === "Escape") setDepositId(null);
                    }}
                    className={`${inputClass} w-[140px]`}
                  />
                  <button
                    onClick={() => saveDeposit(g.id)}
                    className="rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-contrast transition-opacity hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {addingGoal ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Goal, e.g. New laptop"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            className={`${inputClass} min-w-0 flex-1 basis-[140px]`}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder={`Target (${currency})`}
            value={goalTarget}
            onChange={(e) => setGoalTarget(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveGoal();
            }}
            className={`${inputClass} w-[130px]`}
          />
          <button
            onClick={saveGoal}
            className="rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-contrast transition-opacity hover:opacity-90"
          >
            Add
          </button>
          <button
            onClick={() => setAddingGoal(false)}
            className="rounded-full border border-border px-4 py-2 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingGoal(true)}
          className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
        >
          <Plus size={14} />
          Add goal
        </button>
      )}
    </div>
  );
}
