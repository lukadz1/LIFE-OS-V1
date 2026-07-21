import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { FinanceAccountInput } from "../../hooks/useFinance";
import type { Currency, FinanceAccount } from "../../types";
import { currencyToChf, formatMoney } from "../../utils/currency";

interface AssetCategoryCardProps {
  title: string;
  accounts: (FinanceAccount & { valueChf: number })[];
  currency: Currency;
  totalChf: number;
  pricedMode: boolean;
  symbolPlaceholder?: string;
  quantityPlaceholder?: string;
  unitNoun?: string;
  knownSymbols?: string[];
  refreshing?: boolean;
  onAdd: (input: FinanceAccountInput) => void;
  onDelete: (id: string) => void;
  onRefreshPrices?: () => void;
}

export function AssetCategoryCard({
  title,
  accounts,
  currency,
  totalChf,
  pricedMode,
  symbolPlaceholder = "Name",
  quantityPlaceholder = "Quantity",
  unitNoun = "units",
  knownSymbols,
  refreshing = false,
  onAdd,
  onDelete,
  onRefreshPrices,
}: AssetCategoryCardProps) {
  const [manualMode, setManualMode] = useState(!pricedMode);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [manualValue, setManualValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (pricedMode && !manualMode) {
      const qty = Number(quantity);
      if (!qty || qty <= 0) return;
      onAdd({ name: name.trim(), quantity: qty });
    } else {
      const val = Number(manualValue);
      if (!manualValue || Number.isNaN(val)) return;
      onAdd({ name: name.trim(), manualValueChf: currencyToChf(val, currency) });
    }
    setName("");
    setQuantity("");
    setManualValue("");
  }

  return (
    <div className="panel-card flex flex-col rounded-[22px] bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-serif text-[19px] text-text italic">{title}</h3>
        <span className="font-mono text-[13px] text-text-dim">
          {formatMoney(totalChf, currency)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={manualMode ? "Name" : symbolPlaceholder}
          className="min-w-0 flex-[1.3] rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        {pricedMode && !manualMode ? (
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={quantityPlaceholder}
            inputMode="decimal"
            className="min-w-0 flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
          />
        ) : (
          <input
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder={`Value (${currency})`}
            inputMode="decimal"
            className="min-w-0 flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
          />
        )}
        <button
          type="submit"
          aria-label={`Add ${title.toLowerCase()} entry`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </form>

      {pricedMode && (
        <div className="mt-2 flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={onRefreshPrices}
            disabled={refreshing}
            className="flex items-center gap-1 text-text-dim transition-colors hover:text-text disabled:opacity-50"
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            refresh prices
          </button>
          <button
            type="button"
            onClick={() => setManualMode((v) => !v)}
            className="text-text-dim transition-colors hover:text-text"
          >
            {manualMode ? "+ use ticker instead" : "+ add manual entry"}
          </button>
        </div>
      )}

      {pricedMode && knownSymbols && !manualMode && (
        <p className="mt-1.5 truncate font-mono text-[10px] text-text-dim/70">
          Mock prices: {knownSymbols.join(", ")}
        </p>
      )}

      {accounts.length > 0 && (
        <div className="mt-3 flex flex-col gap-0.5 border-t border-border pt-2">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="group flex items-center justify-between gap-2 rounded-[10px] px-1 py-1.5 transition-colors hover:bg-hover"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-text">
                  {a.quantity != null ? a.name.toUpperCase() : a.name}
                </p>
                {a.quantity != null && (
                  <p className="font-mono text-[11px] text-text-dim">
                    {a.quantity} {unitNoun}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-[13px] text-text">
                  {formatMoney(a.valueChf, currency)}
                </span>
                <button
                  onClick={() => onDelete(a.id)}
                  aria-label={`Delete ${a.name}`}
                  className="rounded-lg p-1 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#ff453a]/10 hover:text-[#ff453a] focus-visible:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
