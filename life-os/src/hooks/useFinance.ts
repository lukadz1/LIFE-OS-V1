import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getFinanceAccounts,
  getNetWorthHistory,
  saveFinanceAccounts,
  saveNetWorthHistory,
} from "../services/dataService";
import { getCryptoPriceUsd, getStockPriceUsd } from "../services/priceService";
import type { AssetCategory, FinanceAccount, NetWorthSnapshot } from "../types";
import { FX_RATES_PER_CHF } from "../utils/currency";
import { isoDateDaysAgo, todayISO } from "../utils/date";
import { createId } from "../utils/id";

export interface FinanceAccountInput {
  name: string;
  quantity?: number;
  manualValueChf?: number;
}

export interface FinanceStats {
  allTimeHigh: number | null;
  allTimeLow: number | null;
  oneDayChangePct: number | null;
  snapshotCount: number;
}

function computeAccountValueChf(
  account: FinanceAccount,
  priceCache: Record<string, number>,
): number {
  if (account.quantity != null) {
    const priceUsd = priceCache[account.name.toUpperCase()];
    if (priceUsd == null) return 0;
    return account.quantity * (priceUsd / FX_RATES_PER_CHF.USD);
  }
  return account.manualValueChf ?? 0;
}

async function fetchPricesFor(
  list: FinanceAccount[],
): Promise<Record<string, number>> {
  const patch: Record<string, number> = {};
  await Promise.all(
    list
      .filter((a) => a.quantity != null)
      .map(async (a) => {
        const key = a.name.toUpperCase();
        const price =
          a.category === "stocks"
            ? await getStockPriceUsd(key)
            : a.category === "crypto"
              ? await getCryptoPriceUsd(key)
              : null;
        if (price != null) patch[key] = price;
      }),
  );
  return patch;
}

export function useFinance() {
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [history, setHistory] = useState<NetWorthSnapshot[]>([]);
  const [priceCache, setPriceCache] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshingCategory, setRefreshingCategory] =
    useState<AssetCategory | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [loadedAccounts, loadedHistory] = await Promise.all([
        getFinanceAccounts(),
        getNetWorthHistory(),
      ]);
      const patch = await fetchPricesFor(loadedAccounts);
      if (!active) return;
      setAccounts(loadedAccounts);
      setHistory(loadedHistory);
      setPriceCache(patch);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const accountsWithValue = useMemo(
    () =>
      accounts.map((a) => ({
        ...a,
        valueChf: computeAccountValueChf(a, priceCache),
      })),
    [accounts, priceCache],
  );

  const totalsByCategory = useMemo(() => {
    const totals: Record<AssetCategory, number> = {
      bank: 0,
      sparkonto: 0,
      stocks: 0,
      crypto: 0,
      other: 0,
    };
    for (const a of accountsWithValue) totals[a.category] += a.valueChf;
    return totals;
  }, [accountsWithValue]);

  const netWorthChf = useMemo(
    () => Object.values(totalsByCategory).reduce((sum, v) => sum + v, 0),
    [totalsByCategory],
  );

  // Only start recording history once real accounts exist — an empty portfolio
  // should show the "0 snapshots" empty state, not a flat line at zero.
  // The save happens inside the updater (not a separate reactive effect keyed
  // on `history`) so a stray overlapping mount can never persist a stale array —
  // we only ever write the value we just computed from live state.
  useEffect(() => {
    if (loading || accounts.length === 0) return;
    const today = todayISO();
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.date === today && last.valueChf === netWorthChf)
        return prev;
      const withoutToday = prev.filter((p) => p.date !== today);
      const next = [...withoutToday, { date: today, valueChf: netWorthChf }].sort(
        (a, b) => a.date.localeCompare(b.date),
      );
      void saveNetWorthHistory(next);
      return next;
    });
  }, [netWorthChf, loading, accounts.length]);

  const stats: FinanceStats = useMemo(() => {
    if (history.length === 0) {
      return {
        allTimeHigh: null,
        allTimeLow: null,
        oneDayChangePct: null,
        snapshotCount: 0,
      };
    }
    const values = history.map((h) => h.valueChf);
    const yesterday = isoDateDaysAgo(1);
    const prior = [...history].reverse().find((s) => s.date <= yesterday);
    const latest = history[history.length - 1];
    const oneDayChangePct =
      prior && prior.valueChf !== 0
        ? ((latest.valueChf - prior.valueChf) / prior.valueChf) * 100
        : null;
    return {
      allTimeHigh: Math.max(...values),
      allTimeLow: Math.min(...values),
      oneDayChangePct,
      snapshotCount: history.length,
    };
  }, [history]);

  // Both mutations save inside the setAccounts updater, using the array it just
  // computed, rather than a separate effect reacting to `accounts`. That means
  // storage is only ever written as the direct result of a user action — never
  // as a side effect of a load resolving, so an overlapping/stale mount can't
  // race a real save and flush an empty or stale array over saved data.
  const addAccount = useCallback(
    (category: AssetCategory, input: FinanceAccountInput) => {
      const newAccount: FinanceAccount = {
        id: createId(),
        category,
        name: input.name.trim(),
        quantity: input.quantity,
        manualValueChf: input.manualValueChf,
        createdAt: new Date().toISOString(),
      };
      setAccounts((prev) => {
        const next = [...prev, newAccount];
        void saveFinanceAccounts(next);
        return next;
      });
      if (newAccount.quantity != null) {
        void fetchPricesFor([newAccount]).then((patch) =>
          setPriceCache((prev) => ({ ...prev, ...patch })),
        );
      }
    },
    [],
  );

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      void saveFinanceAccounts(next);
      return next;
    });
  }, []);

  const refreshPrices = useCallback(
    async (category: AssetCategory) => {
      setRefreshingCategory(category);
      const targets = accounts.filter((a) => a.category === category);
      const patch = await fetchPricesFor(targets);
      setPriceCache((prev) => ({ ...prev, ...patch }));
      setRefreshingCategory(null);
    },
    [accounts],
  );

  return {
    loading,
    accounts: accountsWithValue,
    totalsByCategory,
    netWorthChf,
    history,
    stats,
    refreshingCategory,
    addAccount,
    deleteAccount,
    refreshPrices,
  };
}
