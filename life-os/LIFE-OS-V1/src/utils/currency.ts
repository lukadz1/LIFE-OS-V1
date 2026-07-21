import type { Currency } from "../types";

// Mock rates, CHF-based (units of currency per 1 CHF). Swap for a live FX API later.
export const FX_RATES_PER_CHF: Record<Currency, number> = {
  CHF: 1,
  USD: 1.11,
  EUR: 1.04,
  GBP: 0.88,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CHF: "CHF",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function chfToCurrency(valueChf: number, currency: Currency): number {
  return valueChf * FX_RATES_PER_CHF[currency];
}

export function currencyToChf(value: number, currency: Currency): number {
  return value / FX_RATES_PER_CHF[currency];
}

export function formatMoney(valueChf: number, currency: Currency): string {
  const converted = chfToCurrency(valueChf, currency);
  const rounded = Math.round(converted).toLocaleString(undefined);
  return currency === "CHF"
    ? `CHF ${rounded}`
    : `${CURRENCY_SYMBOLS[currency]}${rounded}`;
}
