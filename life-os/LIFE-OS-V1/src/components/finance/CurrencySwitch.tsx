import type { Currency } from "../../types";

const CURRENCIES: Currency[] = ["CHF", "USD", "EUR", "GBP"];

interface CurrencySwitchProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

export function CurrencySwitch({ value, onChange }: CurrencySwitchProps) {
  return (
    <div className="flex rounded-full bg-field p-[3px] font-mono text-xs">
      {CURRENCIES.map((currency) => (
        <button
          key={currency}
          onClick={() => onChange(currency)}
          className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
            value === currency
              ? "bg-accent text-accent-contrast"
              : "text-text-dim hover:text-text"
          }`}
        >
          {currency}
        </button>
      ))}
    </div>
  );
}
