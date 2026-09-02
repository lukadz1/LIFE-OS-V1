import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { Currency, SpendCategory, Transaction } from "../../types";
import { categoryEmoji } from "../../utils/categoryEmoji";
import { formatMoney } from "../../utils/currency";
import { formatPastDate } from "../../utils/date";
import { currentMonthKey, monthKey } from "../../utils/spendingEngine";

const MAX_BREAKDOWN_ROWS = 6;
const COLLAPSED_ROWS = 8;
const EXPANDED_ROWS = 40;

interface MonthCardProps {
  transactions: Transaction[];
  categories: SpendCategory[];
  currency: Currency;
  onDeleteTransaction: (id: string) => void;
  onChangeCategory: (id: string, categoryId: string | null) => void;
}

/** Where the money went this month (auto-computed bars, nothing to configure)
 * plus the recent expense list. Tapping a row opens a tiny inline editor to
 * recategorize or delete it. */
export function MonthCard({
  transactions,
  categories,
  currency,
  onDeleteTransaction,
  onChangeCategory,
}: MonthCardProps) {
  const [showAll, setShowAll] = useState(false);
  const [openTxId, setOpenTxId] = useState<string | null>(null);

  const month = currentMonthKey();
  const byId = new Map(categories.map((c) => [c.id, c]));

  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (monthKey(t.date) !== month) continue;
    const key = t.categoryId ?? "uncategorized";
    totals.set(key, (totals.get(key) ?? 0) + t.amountChf);
  }
  const breakdown = [...totals.entries()]
    .map(([id, value]) => ({
      id,
      category: id === "uncategorized" ? null : (byId.get(id) ?? null),
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_BREAKDOWN_ROWS);
  const maxValue = breakdown[0]?.value ?? 0;

  const recent = [...transactions].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
  const visible = recent.slice(0, showAll ? EXPANDED_ROWS : COLLAPSED_ROWS);

  return (
    <div className="panel-card rounded-[22px] bg-surface p-5">
      <h3 className="font-sans text-[22px] text-text">This month</h3>

      {breakdown.length === 0 ? (
        <p className="mt-3 text-[13px] text-text-dim">
          Nothing logged yet — tap + to add your first expense.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2.5">
          {breakdown.map(({ id, category, value }) => (
            <div key={id} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-center text-[15px]">
                {categoryEmoji(category)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13.5px] text-text">
                    {category?.name ?? "Other"}
                  </span>
                  <span className="shrink-0 font-mono text-[12.5px] text-text-dim">
                    {formatMoney(value, currency)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gauge-track">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{
                      width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <>
          <p className="mt-5 mb-1 font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
            Recent
          </p>
          <div className="flex flex-col">
            {visible.map((t) => {
              const category = t.categoryId
                ? (byId.get(t.categoryId) ?? null)
                : null;
              const open = openTxId === t.id;
              return (
                <div key={t.id} className="border-b border-border last:border-0">
                  <button
                    onClick={() => setOpenTxId(open ? null : t.id)}
                    className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-hover"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-field text-[15px]">
                      {categoryEmoji(category)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-text">
                        {t.description}
                      </p>
                      <p className="mt-0.5 text-xs text-text-dim">
                        {formatPastDate(t.date)}
                        {category ? ` · ${category.name}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[13.5px] text-text">
                      {formatMoney(t.amountChf, currency)}
                    </span>
                  </button>
                  {open && (
                    <div className="flex items-center gap-2 pb-3 pl-11">
                      <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5">
                        {categories.map((c) => (
                          <button
                            key={c.id}
                            onClick={() =>
                              onChangeCategory(
                                t.id,
                                t.categoryId === c.id ? null : c.id,
                              )
                            }
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] transition-colors ${
                              t.categoryId === c.id
                                ? "bg-accent font-medium text-accent-contrast"
                                : "bg-field text-text-dim hover:text-text"
                            }`}
                          >
                            {categoryEmoji(c)} {c.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          onDeleteTransaction(t.id);
                          setOpenTxId(null);
                        }}
                        aria-label="Delete expense"
                        className="shrink-0 rounded-full p-1.5 text-[#ff453a] transition-colors hover:bg-hover"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {recent.length > COLLAPSED_ROWS && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 w-full rounded-full border border-border py-2 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
            >
              {showAll ? "Show less" : `Show all (${recent.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
