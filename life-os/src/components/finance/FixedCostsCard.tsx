import { Check, Circle, Pause, Play, Plus, X } from "lucide-react";
import { useState } from "react";
import type { BillDebtInput } from "../../hooks/useBillsDebts";
import type { RecurringInput } from "../../hooks/useSpending";
import type {
  BillDebt,
  Currency,
  RecurringRule,
  SpendCategory,
} from "../../types";
import { categoryEmoji } from "../../utils/categoryEmoji";
import { formatMoney } from "../../utils/currency";
import { formatDateLabel, todayISO } from "../../utils/date";

interface FixedCostsCardProps {
  recurring: RecurringRule[];
  bills: BillDebt[];
  categories: SpendCategory[];
  currency: Currency;
  onAddRecurring: (input: RecurringInput) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleRecurring: (id: string) => void;
  onConfirmRecurring: (id: string) => void;
  onSkipRecurring: (id: string) => void;
  onAddBill: (input: BillDebtInput) => void;
  onToggleBillPaid: (id: string) => void;
  onDeleteBill: (id: string) => void;
}

/** CHF per month a rule costs, whatever its interval. */
function monthlyEquivalentChf(rule: RecurringRule): number {
  if (rule.interval === "weekly") return (rule.amountChf * 52) / 12;
  if (rule.interval === "yearly") return rule.amountChf / 12;
  return rule.amountChf;
}

function ordinal(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  if (day % 10 === 1) return `${day}st`;
  if (day % 10 === 2) return `${day}nd`;
  if (day % 10 === 3) return `${day}rd`;
  return `${day}th`;
}

function scheduleLabel(rule: RecurringRule): string {
  const day = Number(rule.nextDue.slice(8, 10));
  if (rule.interval === "monthly") return `monthly · ${ordinal(day)}`;
  return rule.interval;
}

/** First upcoming occurrence of a given day-of-month (this month or next). */
function nextDueForDay(day: number): string {
  const now = new Date();
  let due = new Date(now.getFullYear(), now.getMonth(), day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (due < today) due = new Date(now.getFullYear(), now.getMonth() + 1, day);
  return `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;
}

/** Every regular cost in one flat list: due ones surface on top with a
 * one-tap "Paid" (books the expense and rolls the date forward), plus a short
 * section for one-off bills. */
export function FixedCostsCard({
  recurring,
  bills,
  categories,
  currency,
  onAddRecurring,
  onDeleteRecurring,
  onToggleRecurring,
  onConfirmRecurring,
  onSkipRecurring,
  onAddBill,
  onToggleBillPaid,
  onDeleteBill,
}: FixedCostsCardProps) {
  const [addingCost, setAddingCost] = useState(false);
  const [costName, setCostName] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [costDay, setCostDay] = useState(1);

  const [addingBill, setAddingBill] = useState(false);
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDue, setBillDue] = useState("");

  const today = todayISO();
  const byId = new Map(categories.map((c) => [c.id, c]));

  const due = recurring.filter((r) => r.active && r.nextDue <= today);
  const upcoming = recurring
    .filter((r) => !(r.active && r.nextDue <= today))
    .sort((a, b) => Number(!a.active) - Number(!b.active) || a.nextDue.localeCompare(b.nextDue));
  const totalMonthlyChf = recurring
    .filter((r) => r.active)
    .reduce((sum, r) => sum + monthlyEquivalentChf(r), 0);

  const unpaidBills = bills
    .filter((b) => !b.paid)
    .sort((a, b) => {
      if (a.dueDate !== b.dueDate) {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return a.createdAt.localeCompare(b.createdAt);
    });

  function saveCost() {
    const amount = Number(costAmount.replace(",", "."));
    if (!costName.trim() || !Number.isFinite(amount) || amount <= 0) return;
    onAddRecurring({
      description: costName.trim(),
      amountChf: amount,
      categoryId: null,
      interval: "monthly",
      nextDue: nextDueForDay(costDay),
    });
    setCostName("");
    setCostAmount("");
    setCostDay(1);
    setAddingCost(false);
  }

  function saveBill() {
    const amount = Number(billAmount.replace(",", "."));
    if (!billName.trim() || !Number.isFinite(amount) || amount <= 0) return;
    onAddBill({
      kind: "bill",
      name: billName.trim(),
      amountChf: amount,
      dueDate: billDue || null,
      recurring: false,
    });
    setBillName("");
    setBillAmount("");
    setBillDue("");
    setAddingBill(false);
  }

  const inputClass =
    "rounded-[10px] bg-field px-3 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none";

  return (
    <div className="panel-card rounded-[22px] bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-sans text-[22px] text-text">Fixed costs</h3>
        {totalMonthlyChf > 0 && (
          <span className="shrink-0 font-mono text-[12.5px] text-text-dim">
            {formatMoney(totalMonthlyChf, currency)} / mo
          </span>
        )}
      </div>

      {due.length > 0 && (
        <div className="mt-3.5 flex flex-col gap-2">
          {due.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-2.5 rounded-[14px] border border-[#f59e0b]/40 bg-[#f59e0b]/8 px-3 py-2.5"
            >
              <span className="text-[15px]">
                {categoryEmoji(r.categoryId ? byId.get(r.categoryId) : null)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-text">{r.description}</p>
                <p className="mt-0.5 text-xs font-medium text-[#f59e0b]">
                  Due {formatDateLabel(r.nextDue).toLowerCase()} ·{" "}
                  {formatMoney(r.amountChf, currency)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => onConfirmRecurring(r.id)}
                  className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[12.5px] font-medium text-accent-contrast transition-opacity hover:opacity-90"
                >
                  <Check size={13} />
                  Paid
                </button>
                <button
                  onClick={() => onSkipRecurring(r.id)}
                  className="rounded-full border border-border px-3 py-1.5 text-[12.5px] font-medium text-text-dim transition-colors hover:text-text"
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-col">
        {upcoming.map((r) => (
          <div
            key={r.id}
            className={`group flex items-center gap-3 border-b border-border py-2.5 last:border-0 ${
              r.active ? "" : "opacity-45"
            }`}
          >
            <span className="w-6 shrink-0 text-center text-[15px]">
              {categoryEmoji(r.categoryId ? byId.get(r.categoryId) : null)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] text-text">{r.description}</p>
              <p className="mt-0.5 text-xs text-text-dim">
                {r.active ? scheduleLabel(r) : "paused"}
              </p>
            </div>
            <span className="shrink-0 font-mono text-[13.5px] text-text">
              {formatMoney(r.amountChf, currency)}
            </span>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => onToggleRecurring(r.id)}
                aria-label={r.active ? "Pause" : "Resume"}
                className="rounded-full p-1.5 text-text-dim transition-colors hover:text-text"
              >
                {r.active ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button
                onClick={() => onDeleteRecurring(r.id)}
                aria-label="Delete fixed cost"
                className="rounded-full p-1.5 text-text-dim transition-colors hover:text-[#ff453a]"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {addingCost ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Name, e.g. Spotify"
            value={costName}
            onChange={(e) => setCostName(e.target.value)}
            className={`${inputClass} min-w-0 flex-1 basis-[140px]`}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder={currency}
            value={costAmount}
            onChange={(e) => setCostAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveCost();
            }}
            className={`${inputClass} w-[90px]`}
          />
          <select
            value={costDay}
            onChange={(e) => setCostDay(Number(e.target.value))}
            aria-label="Day of month"
            className={`${inputClass} w-[84px]`}
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {ordinal(d)}
              </option>
            ))}
          </select>
          <button
            onClick={saveCost}
            className="rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-contrast transition-opacity hover:opacity-90"
          >
            Add
          </button>
          <button
            onClick={() => setAddingCost(false)}
            className="rounded-full border border-border px-4 py-2 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingCost(true)}
          className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
        >
          <Plus size={14} />
          Add fixed cost
        </button>
      )}

      <p className="mt-5 mb-1 font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
        One-off bills
      </p>
      {unpaidBills.length === 0 && !addingBill && (
        <p className="text-[13px] text-text-dim">Nothing open right now.</p>
      )}
      <div className="flex flex-col">
        {unpaidBills.map((b) => {
          const overdue = !!b.dueDate && b.dueDate < today;
          return (
            <div
              key={b.id}
              className="group flex items-center gap-3 border-b border-border py-2.5 last:border-0"
            >
              <button
                onClick={() => onToggleBillPaid(b.id)}
                aria-label={`Mark ${b.name} paid`}
                className="shrink-0 text-check transition-colors hover:text-[#34d399]"
              >
                <Circle size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-text">{b.name}</p>
                <p
                  className={`mt-0.5 text-xs ${
                    overdue ? "font-medium text-[#ff453a]" : "text-text-dim"
                  }`}
                >
                  {formatDateLabel(b.dueDate)}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[13.5px] text-text">
                {formatMoney(b.amountChf, currency)}
              </span>
              <button
                onClick={() => onDeleteBill(b.id)}
                aria-label="Delete bill"
                className="shrink-0 rounded-full p-1.5 text-text-dim opacity-0 transition-all group-hover:opacity-100 hover:text-[#ff453a]"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {addingBill ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Name, e.g. Zahnarzt"
            value={billName}
            onChange={(e) => setBillName(e.target.value)}
            className={`${inputClass} min-w-0 flex-1 basis-[140px]`}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder={currency}
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveBill();
            }}
            className={`${inputClass} w-[90px]`}
          />
          <input
            type="date"
            value={billDue}
            onChange={(e) => setBillDue(e.target.value)}
            aria-label="Due date"
            className={`${inputClass} w-[150px]`}
          />
          <button
            onClick={saveBill}
            className="rounded-full bg-accent px-4 py-2 text-[13px] font-medium text-accent-contrast transition-opacity hover:opacity-90"
          >
            Add
          </button>
          <button
            onClick={() => setAddingBill(false)}
            className="rounded-full border border-border px-4 py-2 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingBill(true)}
          className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
        >
          <Plus size={14} />
          Add bill
        </button>
      )}
    </div>
  );
}
