import { useState } from "react";
import { useSpending } from "../../../hooks/useSpending";
import type { Currency } from "../../../types";
import { bucketTotals, currentMonthKey } from "../../../utils/spendingEngine";
import { BucketSummary } from "./BucketSummary";
import { CategoryBudgetsCard } from "./CategoryBudgetsCard";
import { CsvImportModal } from "./CsvImportModal";
import { RecurringCard } from "./RecurringCard";
import { SavingsGoalsCard } from "./SavingsGoalsCard";
import { SpendTrendChart } from "./SpendTrendChart";
import { TransactionsCard } from "./TransactionsCard";

interface BudgetPanelProps {
  currency: Currency;
}

export function BudgetPanel({ currency }: BudgetPanelProps) {
  const spending = useSpending();
  const [importOpen, setImportOpen] = useState(false);

  if (spending.loading) {
    return (
      <div className="py-16 text-center text-sm text-text-dim">
        Loading your budget…
      </div>
    );
  }

  const monthTotals = bucketTotals(
    spending.transactions,
    spending.categories,
    currentMonthKey(),
  );

  return (
    <div className="flex flex-col gap-4">
      <BucketSummary totals={monthTotals} currency={currency} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <SpendTrendChart
          className="lg:col-span-7"
          transactions={spending.transactions}
          categories={spending.categories}
          currency={currency}
        />
        <div className="lg:col-span-5">
          <RecurringCard
            recurring={spending.recurring}
            categories={spending.categories}
            currency={currency}
            onAdd={spending.addRecurring}
            onToggle={spending.toggleRecurring}
            onDelete={spending.deleteRecurring}
            onConfirm={spending.confirmRecurring}
            onSkip={spending.skipRecurring}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TransactionsCard
          transactions={spending.transactions}
          categories={spending.categories}
          currency={currency}
          onAdd={spending.addTransaction}
          onUpdateCategory={spending.updateTransactionCategory}
          onDelete={spending.deleteTransaction}
          onOpenImport={() => setImportOpen(true)}
        />
        <CategoryBudgetsCard
          categories={spending.categories}
          transactions={spending.transactions}
          currency={currency}
          onAdd={spending.addCategory}
          onUpdate={spending.updateCategory}
          onDelete={spending.deleteCategory}
        />
      </div>

      <SavingsGoalsCard
        goals={spending.goals}
        transactions={spending.transactions}
        categories={spending.categories}
        currency={currency}
        onAdd={spending.addGoal}
        onDeposit={spending.depositGoal}
        onDelete={spending.deleteGoal}
      />

      <CsvImportModal
        open={importOpen}
        existingTransactions={spending.transactions}
        categories={spending.categories}
        currency={currency}
        onClose={() => setImportOpen(false)}
        onImport={spending.addTransactions}
      />
    </div>
  );
}
