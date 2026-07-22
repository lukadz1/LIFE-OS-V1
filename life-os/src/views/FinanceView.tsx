import { useEffect, useState } from "react";
import { BudgetPanel } from "../components/finance/budget/BudgetPanel";
import { AllocationDonut } from "../components/finance/AllocationDonut";
import { AssetCategoryCard } from "../components/finance/AssetCategoryCard";
import { BillsPanel } from "../components/finance/bills/BillsPanel";
import { CurrencySwitch } from "../components/finance/CurrencySwitch";
import { NetWorthChart } from "../components/finance/NetWorthChart";
import { NetWorthHeader } from "../components/finance/NetWorthHeader";
import { readStorage, writeStorage } from "../data/storage";
import { useFinance } from "../hooks/useFinance";
import type { AssetCategory, Currency } from "../types";

const TABS = [
  { id: "networth", label: "Net worth" },
  { id: "budget", label: "Budget" },
  { id: "bills", label: "Bills & Debt" },
] as const;
type FinanceTab = (typeof TABS)[number]["id"];

export function FinanceView() {
  const {
    loading,
    accounts,
    totalsByCategory,
    netWorthChf,
    history,
    stats,
    refreshingCategory,
    addAccount,
    deleteAccount,
    refreshPrices,
  } = useFinance();

  const [currency, setCurrency] = useState<Currency>(() =>
    readStorage<Currency>("currency", "CHF"),
  );
  const [tab, setTab] = useState<FinanceTab>("networth");

  useEffect(() => {
    writeStorage("currency", currency);
  }, [currency]);

  const byCategory = (category: AssetCategory) =>
    accounts.filter((a) => a.category === category);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[32px] text-text italic">Finance</h1>
          <div className="mt-2 flex rounded-[10px] bg-field p-[3px] font-mono text-[12px]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-[8px] px-3.5 py-1.5 font-medium tracking-wide transition-colors ${
                  tab === t.id
                    ? "bg-accent text-accent-contrast"
                    : "text-text-dim hover:text-text"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <CurrencySwitch value={currency} onChange={setCurrency} />
      </div>

      {tab === "budget" ? (
        <BudgetPanel currency={currency} />
      ) : tab === "bills" ? (
        <BillsPanel currency={currency} />
      ) : loading ? (
        <div className="py-16 text-center text-sm text-text-dim">
          Loading your finances…
        </div>
      ) : (
        <>
          <NetWorthHeader
            netWorthChf={netWorthChf}
            currency={currency}
            hasAccounts={accounts.length > 0}
          />

          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <NetWorthChart
              className="lg:col-span-7"
              history={history}
              stats={stats}
              currency={currency}
            />
            <AllocationDonut
              className="lg:col-span-5"
              totalsByCategory={totalsByCategory}
              netWorthChf={netWorthChf}
              currency={currency}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AssetCategoryCard
              title="Bank accounts"
              accounts={byCategory("bank")}
              currency={currency}
              totalChf={totalsByCategory.bank}
              pricedMode={false}
              symbolPlaceholder="Account name"
              onAdd={(input) => addAccount("bank", input)}
              onDelete={deleteAccount}
            />
            <AssetCategoryCard
              title="Sparkonto"
              accounts={byCategory("sparkonto")}
              currency={currency}
              totalChf={totalsByCategory.sparkonto}
              pricedMode={false}
              symbolPlaceholder="Account name"
              onAdd={(input) => addAccount("sparkonto", input)}
              onDelete={deleteAccount}
            />
            <AssetCategoryCard
              title="Stocks · investments"
              accounts={byCategory("stocks")}
              currency={currency}
              totalChf={totalsByCategory.stocks}
              pricedMode
              symbolPlaceholder="Ticker (e.g. VTI)"
              quantityPlaceholder="Shares"
              unitNoun="shares"
              knownSymbols={[
                "VTI",
                "VOO",
                "AAPL",
                "MSFT",
                "GOOGL",
                "AMZN",
                "NVDA",
                "TSLA",
              ]}
              refreshing={refreshingCategory === "stocks"}
              onAdd={(input) => addAccount("stocks", input)}
              onDelete={deleteAccount}
              onRefreshPrices={() => refreshPrices("stocks")}
            />
            <AssetCategoryCard
              title="Crypto · live"
              accounts={byCategory("crypto")}
              currency={currency}
              totalChf={totalsByCategory.crypto}
              pricedMode
              symbolPlaceholder="Coin (e.g. BTC)"
              quantityPlaceholder="Quantity"
              unitNoun="coins"
              knownSymbols={["BTC", "ETH", "SOL", "ADA", "DOGE"]}
              refreshing={refreshingCategory === "crypto"}
              onAdd={(input) => addAccount("crypto", input)}
              onDelete={deleteAccount}
              onRefreshPrices={() => refreshPrices("crypto")}
            />
            <AssetCategoryCard
              title="Other assets"
              accounts={byCategory("other")}
              currency={currency}
              totalChf={totalsByCategory.other}
              pricedMode={false}
              symbolPlaceholder="Asset name"
              onAdd={(input) => addAccount("other", input)}
              onDelete={deleteAccount}
            />
          </div>
        </>
      )}
    </div>
  );
}
