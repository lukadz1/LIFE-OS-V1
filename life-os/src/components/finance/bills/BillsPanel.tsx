import { Check, Plus, Repeat, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useBillsDebts } from "../../../hooks/useBillsDebts";
import type { BillDebt, BillDebtKind, Currency } from "../../../types";
import { currencyToChf, formatMoney } from "../../../utils/currency";
import { formatDateLabel, todayISO } from "../../../utils/date";

const KINDS: { id: BillDebtKind; label: string }[] = [
  { id: "bill", label: "Bill" },
  { id: "debt", label: "Debt" },
];

function isOverdue(item: BillDebt): boolean {
  return !item.paid && !!item.dueDate && item.dueDate < todayISO();
}

function sortItems(items: BillDebt[]): BillDebt[] {
  return [...items].sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1;
    if (a.dueDate !== b.dueDate) {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    return a.createdAt.localeCompare(b.createdAt);
  });
}

interface BillsPanelProps {
  currency: Currency;
}

export function BillsPanel({ currency }: BillsPanelProps) {
  const { loading, items, addItem, togglePaid, deleteItem } = useBillsDebts();
  const [kind, setKind] = useState<BillDebtKind>("bill");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recurring, setRecurring] = useState(false);

  const sorted = useMemo(() => sortItems(items), [items]);

  const summary = useMemo(() => {
    const unpaid = items.filter((i) => !i.paid);
    const unpaidBillsChf = unpaid
      .filter((i) => i.kind === "bill")
      .reduce((sum, i) => sum + i.amountChf, 0);
    const unpaidDebtChf = unpaid
      .filter((i) => i.kind === "debt")
      .reduce((sum, i) => sum + i.amountChf, 0);
    const overdueCount = unpaid.filter(isOverdue).length;
    return { unpaidBillsChf, unpaidDebtChf, overdueCount };
  }, [items]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const val = Number(amount);
    if (!name.trim() || !val || val <= 0) return;
    addItem({
      kind,
      name: name.trim(),
      amountChf: currencyToChf(val, currency),
      dueDate: dueDate || null,
      recurring,
    });
    setName("");
    setAmount("");
    setDueDate("");
    setRecurring(false);
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-text-dim">
        Loading your bills…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="panel-card grid grid-cols-3 gap-3 rounded-[22px] bg-surface p-5">
        <div>
          <p className="font-mono text-[10px] tracking-wide text-text-dim uppercase">
            Unpaid bills
          </p>
          <p className="mt-0.5 font-mono text-[17px] font-medium text-text">
            {formatMoney(summary.unpaidBillsChf, currency)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-wide text-text-dim uppercase">
            Debt owed
          </p>
          <p className="mt-0.5 font-mono text-[17px] font-medium text-text">
            {formatMoney(summary.unpaidDebtChf, currency)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-wide text-text-dim uppercase">
            Overdue
          </p>
          <p
            className={`mt-0.5 font-mono text-[17px] font-medium ${
              summary.overdueCount > 0 ? "text-[#ff453a]" : "text-text"
            }`}
          >
            {summary.overdueCount}
          </p>
        </div>
      </div>

      <div className="panel-card rounded-[22px] bg-surface p-5">
        <h3 className="mb-3 font-serif text-[19px] text-text italic">
          Bills &amp; debt to pay
        </h3>

        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-center gap-2"
        >
          <div className="flex rounded-[10px] bg-field p-[3px] font-mono text-[12px]">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={`rounded-[8px] px-3 py-1.5 font-medium transition-colors ${
                  kind === k.id
                    ? "bg-accent text-accent-contrast"
                    : "text-text-dim hover:text-text"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Rent, Credit card)"
            className="min-w-0 flex-[1.4] rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${currency})`}
            inputMode="decimal"
            className="min-w-0 flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="min-w-0 rounded-[10px] bg-field px-3 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
          />
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-text-dim">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--color-accent)]"
            />
            Recurring
          </label>
          <button
            type="submit"
            aria-label="Add bill or debt"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-opacity hover:opacity-90"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </form>

        {sorted.length > 0 ? (
          <div className="mt-3 flex flex-col gap-0.5 border-t border-border pt-2">
            {sorted.map((item) => {
              const overdue = isOverdue(item);
              return (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 rounded-[14px] px-2 py-2 transition-colors hover:bg-hover"
                >
                  <button
                    onClick={() => togglePaid(item.id)}
                    aria-label={item.paid ? "Mark unpaid" : "Mark paid"}
                    className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                      item.paid
                        ? "border-accent bg-accent text-accent-contrast"
                        : "border-check text-transparent hover:border-accent"
                    }`}
                  >
                    <Check size={13} strokeWidth={3} />
                  </button>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide uppercase ${
                      item.kind === "debt"
                        ? "bg-[#a78bfa]/15 text-[#a78bfa]"
                        : "bg-[#60a5fa]/15 text-[#60a5fa]"
                    }`}
                  >
                    {item.kind}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[15px] ${
                        item.paid ? "text-text-dim line-through" : "text-text"
                      }`}
                    >
                      {item.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-dim">
                      <span className={overdue ? "font-medium text-[#ff453a]" : ""}>
                        {formatDateLabel(item.dueDate)}
                      </span>
                      {item.recurring && (
                        <span className="flex items-center gap-1" title="Recurring">
                          <Repeat size={11} />
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 font-mono text-[13px] text-text">
                    {formatMoney(item.amountChf, currency)}
                  </span>

                  <button
                    onClick={() => deleteItem(item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="shrink-0 rounded-lg p-1 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#ff453a]/10 hover:text-[#ff453a] focus-visible:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-center text-[13px] text-text-dim italic">
            Add a bill or debt above to start tracking what's owed.
          </p>
        )}
      </div>
    </div>
  );
}
