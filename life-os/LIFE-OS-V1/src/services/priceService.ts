// Mock live-price feed. Prices are illustrative, not real market data.
// Swapping in a real backend later (e.g. a stock quote API + CoinGecko) means
// rewriting the two lookup functions below — callers never change.

const MOCK_STOCK_PRICES_USD: Record<string, number> = {
  VTI: 295.4,
  VOO: 545.2,
  AAPL: 227.5,
  MSFT: 430.2,
  GOOGL: 175.8,
  AMZN: 205.3,
  NVDA: 138.6,
  TSLA: 248.9,
};

const MOCK_CRYPTO_PRICES_USD: Record<string, number> = {
  BTC: 96500,
  ETH: 3400,
  SOL: 210,
  ADA: 0.95,
  DOGE: 0.38,
};

function jitter(price: number, spreadPct: number): number {
  const swing = (Math.random() * 2 - 1) * spreadPct;
  return Math.max(0, price * (1 + swing));
}

export async function getStockPriceUsd(ticker: string): Promise<number | null> {
  const base = MOCK_STOCK_PRICES_USD[ticker.toUpperCase()];
  if (base == null) return null;
  return jitter(base, 0.004);
}

export async function getCryptoPriceUsd(coin: string): Promise<number | null> {
  const base = MOCK_CRYPTO_PRICES_USD[coin.toUpperCase()];
  if (base == null) return null;
  return jitter(base, 0.012);
}

export function isKnownStockTicker(ticker: string): boolean {
  return ticker.toUpperCase() in MOCK_STOCK_PRICES_USD;
}

export function isKnownCryptoCoin(coin: string): boolean {
  return coin.toUpperCase() in MOCK_CRYPTO_PRICES_USD;
}
