import { ArrowRight, Repeat } from "lucide-react";
import type { BillDebt, Currency } from "../../../types";
import { formatMoney } from "../../../utils/currency";
import { formatDateLabel, todayISO } from "../../../utils/date";

const MAX_ROWS = 4;

function isOverdue(item: BillDebt): boolean {
  return !item.paid && !!item.dueDate && item.dueDate < todayISO();
}

interface UpcomingBillsCardProps {
  items: BillDebt[];
  currency: Currency;
  onViewAll: () => void;
  className?: string;
}

export function UpcomingBillsCard({
  items,
  currency,
  onViewAll,
  className = "",
}: UpcomingBillsCardProps) {
  const upcoming = items
    .filter((i) => !i.paid)
    .sort((a, b) => {
      if (a.dueDate !== b.dueDate) {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return a.createdAt.localeCompare(b.createdAt);
    })
    .slice(0, MAX_ROWS);

  return (
    <div className={`panel-card flex flex-col rounded-[22px] bg-surface p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-sans text-[22px] text-text">Bills &amp; Payments</h3>
        <button
          onClick={onViewAll}
          className="flex shrink-0 items-center gap-1 font-mono text-[11px] tracking-wide text-text-dim uppercase transition-colors hover:text-text"
        >
          See all
          <ArrowRight size={12} />
        </button>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
          <p className="max-w-[26ch] text-[13px] text-text-dim">
            Nothing tracked yet — add a bill or debt in Finance → Bills &amp; Debt.
          </p>
          <button
            onClick={onViewAll}
            className="mt-1 rounded-full bg-accent px-4 py-1.5 text-[12.5px] font-medium text-accent-contrast transition-opacity hover:opacity-90"
          >
            Add a bill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {upcoming.map((item) => {
            const overdue = isOverdue(item);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-[14px] border border-border px-3 py-2.5"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-semibold uppercase ${
                    item.kind === "debt"
                      ? "bg-[#a78bfa]/15 text-[#a78bfa]"
                      : "bg-[#60a5fa]/15 text-[#60a5fa]"
                  }`}
                >
                  {item.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-text">{item.name}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-dim">
                    <span className={overdue ? "font-medium text-[#ff453a]" : ""}>
                      {formatDateLabel(item.dueDate)}
                    </span>
                    {item.recurring && <Repeat size={10} aria-label="Recurring" />}
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[13.5px] text-text">
                  {formatMoney(item.amountChf, currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
