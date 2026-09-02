import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AddExpenseSheet } from "../components/finance/AddExpenseSheet";
import { FixedCostsCard } from "../components/finance/FixedCostsCard";
import { LeftToSpendCard } from "../components/finance/LeftToSpendCard";
import { MonthCard } from "../components/finance/MonthCard";
import { MoneyCard } from "../components/finance/MoneyCard";
import { readStorage, writeStorage } from "../data/storage";
import { useBillsDebts } from "../hooks/useBillsDebts";
import { useFinance } from "../hooks/useFinance";
import { useSpending } from "../hooks/useSpending";
import type { Currency } from "../types";
import { todayISO } from "../utils/date";
import { currentMonthKey, monthKey } from "../utils/spendingEngine";

/** Finance, radically simplified: one scrollable page. What's left this
 * month, where it went, the fixed costs, and what's owned — plus a floating
 * "+" that logs an expense in two taps. */
export function FinanceView() {
  const spending = useSpending();
  const finance = useFinance();
  const bills = useBillsDebts();

  const currency = readStorage<Currency>("currency", "CHF");
  const [budgetChf, setBudgetChf] = useState<number | null>(() =>
    readStorage<number | null>("monthly-budget", null),
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    writeStorage("monthly-budget", budgetChf);
  }, [budgetChf]);

  const loading = spending.loading || finance.loading || bills.loading;

  const month = currentMonthKey();
  const spentThisMonthChf = spending.transactions
    .filter((t) => monthKey(t.date) === month)
    .reduce((sum, t) => sum + t.amountChf, 0);

  return (
    <div>
      <h1 className="mb-5 font-sans text-[32px] text-text">Finance</h1>

      {loading ? (
        <div className="py-16 text-center text-sm text-text-dim">
          Loading your finances…
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-24 lg:grid lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-4">
            <LeftToSpendCard
              budgetChf={budgetChf}
              spentChf={spentThisMonthChf}
              currency={currency}
              onSetBudget={setBudgetChf}
            />
            <MonthCard
              transactions={spending.transactions}
              categories={spending.categories}
              currency={currency}
              onDeleteTransaction={spending.deleteTransaction}
              onChangeCategory={spending.updateTransactionCategory}
            />
          </div>

          <div className="flex flex-col gap-4">
            <FixedCostsCard
              recurring={spending.recurring}
              bills={bills.items}
              categories={spending.categories}
              currency={currency}
              onAddRecurring={spending.addRecurring}
              onDeleteRecurring={spending.deleteRecurring}
              onToggleRecurring={spending.toggleRecurring}
              onConfirmRecurring={spending.confirmRecurring}
              onSkipRecurring={spending.skipRecurring}
              onAddBill={bills.addItem}
              onToggleBillPaid={bills.togglePaid}
              onDeleteBill={bills.deleteItem}
            />
            <MoneyCard
              accounts={finance.accounts}
              netWorthChf={finance.netWorthChf}
              goals={spending.goals}
              transactions={spending.transactions}
              categories={spending.categories}
              currency={currency}
              onAddAccount={({ name, valueChf }) =>
                finance.addAccount("bank", { name, manualValueChf: valueChf })
              }
              onSetAccountValue={(id, valueChf) => {
                const account = finance.accounts.find((a) => a.id === id);
                if (account) {
                  finance.adjustAccountValue(id, valueChf - account.valueChf);
                }
              }}
              onDeleteAccount={finance.deleteAccount}
              onAddGoal={({ name, targetChf }) =>
                spending.addGoal({
                  name,
                  targetChf,
                  targetDate: null,
                  linkedCategoryId: null,
                })
              }
              onDepositGoal={spending.depositGoal}
              onDeleteGoal={spending.deleteGoal}
            />
          </div>
        </div>
      )}

      {/* Portaled: the view's enter animation transforms this subtree, which
          would re-anchor position:fixed to the view instead of the screen. */}
      {createPortal(
        <button
          onClick={() => setSheetOpen(true)}
          aria-label="Add expense"
          className="fixed right-[max(1.1rem,env(safe-area-inset-right))] bottom-[max(1.1rem,env(safe-area-inset-bottom))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[0_10px_30px_rgba(251,86,7,0.45)] transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>,
        document.body,
      )}

      {sheetOpen && (
        <AddExpenseSheet
          categories={spending.categories}
          currency={currency}
          onClose={() => setSheetOpen(false)}
          onSave={(entry) => {
            spending.addTransaction({ date: todayISO(), ...entry });
            setSheetOpen(false);
          }}
          onAddCategory={({ name, emoji }) =>
            spending.addCategory({
              name,
              emoji,
              bucket: "variable",
              monthlyBudgetChf: null,
              keywords: [],
            })
          }
          onDeleteCategory={spending.deleteCategory}
        />
      )}
    </div>
  );
}
