import { Plus } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { AddExpenseSheet } from "../components/finance/AddExpenseSheet";
import { RecentActivityCard } from "../components/home/finance/RecentActivityCard";
import { SpendingPlanCard } from "../components/home/finance/SpendingPlanCard";
import { TopCategoriesCard } from "../components/home/finance/TopCategoriesCard";
import { UpcomingBillsCard } from "../components/home/finance/UpcomingBillsCard";
import { BottomTabBar } from "../components/home/BottomTabBar";
import { GreetingHero } from "../components/home/GreetingHero";
import { LauncherCard } from "../components/home/LauncherCard";
import type { ViewId } from "../components/layout/NavBar";
import { readStorage } from "../data/storage";
import { useBillsDebts } from "../hooks/useBillsDebts";
import { useEvents } from "../hooks/useEvents";
import { useFinance } from "../hooks/useFinance";
import { useGoals } from "../hooks/useGoals";
import { useSchool } from "../hooks/useSchool";
import { useSpending } from "../hooks/useSpending";
import { useTasks } from "../hooks/useTasks";
import type { Currency } from "../types";
import { formatMoney } from "../utils/currency";
import { isToday, todayISO } from "../utils/date";
import { currentMonthKey, monthKey } from "../utils/spendingEngine";

interface HomeViewProps {
  onNavigate: (view: ViewId) => void;
}

const ACCENT = "var(--color-accent)";

interface StatTileProps {
  label: string;
  value: string;
  tone?: "default" | "warn";
}

function StatTile({ label, value, tone = "default" }: StatTileProps) {
  return (
    <div className="panel-card ember-fade rounded-[22px] bg-surface p-5">
      <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
        {label}
      </p>
      <p
        className={`mt-1.5 font-sans text-[28px] leading-none ${
          tone === "warn" ? "text-[#ff453a]" : "text-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const finance = useFinance();
  const spending = useSpending();
  const bills = useBillsDebts();
  const school = useSchool();
  const tasks = useTasks();
  const goals = useGoals();
  const events = useEvents();

  const currency = readStorage<Currency>("currency", "CHF");
  const budgetChf = readStorage<number | null>("monthly-budget", null);

  const [showQuickSpend, setShowQuickSpend] = useState(false);

  const month = currentMonthKey();
  const spentThisMonthChf = spending.transactions
    .filter((t) => monthKey(t.date) === month)
    .reduce((sum, t) => sum + t.amountChf, 0);

  const unpaidBills = bills.items.filter((i) => !i.paid);
  const unpaidBillsChf = unpaidBills.reduce((sum, i) => sum + i.amountChf, 0);
  const hasOverdueBill = unpaidBills.some(
    (i) => i.dueDate != null && i.dueDate < todayISO(),
  );

  const financeReady = !finance.loading && !spending.loading && !bills.loading;

  const schoolSubtitle =
    school.average != null
      ? `Avg grade ${school.average.toFixed(1)}${
          school.weakest ? ` · weakest ${school.weakest.name}` : ""
        }`
      : "Grades & exams";

  const openTasks = tasks.tasks.filter((t) => !t.completed);
  const todosSubtitle = tasks.loading
    ? "Tasks & priorities"
    : openTasks.length > 0
      ? `${openTasks.length} open task${openTasks.length === 1 ? "" : "s"}`
      : "All caught up";

  const avgGoalProgress =
    goals.goals.length > 0
      ? Math.round(
          goals.goals.reduce((sum, g) => sum + g.progress, 0) / goals.goals.length,
        )
      : null;
  const goalsSubtitle = goals.loading
    ? "Progress & targets"
    : avgGoalProgress != null
      ? `${avgGoalProgress}% avg progress`
      : "No goals yet";

  const todayEventCount = events.events.filter((e) => isToday(e.start)).length;
  const calendarSubtitle = events.loading
    ? "Day, week & month"
    : todayEventCount > 0
      ? `${todayEventCount} event${todayEventCount === 1 ? "" : "s"} today`
      : "Nothing scheduled today";

  return (
    <div>
      <GreetingHero name="Luka" />

      <div className="flex flex-col gap-4 pb-24">
        {!financeReady ? (
          <div className="py-16 text-center text-sm text-text-dim">
            Loading your finances…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatTile label="Net worth" value={formatMoney(finance.netWorthChf, currency)} />
              <StatTile
                label="Spent this month"
                value={formatMoney(spentThisMonthChf, currency)}
              />
              <StatTile
                label="Unpaid bills"
                value={formatMoney(unpaidBillsChf, currency)}
                tone={hasOverdueBill ? "warn" : "default"}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <SpendingPlanCard
                className="lg:col-span-7"
                transactions={spending.transactions}
                currency={currency}
                budgetChf={budgetChf}
              />
              <TopCategoriesCard
                className="lg:col-span-5"
                categories={spending.categories}
                transactions={spending.transactions}
                currency={currency}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <RecentActivityCard
                transactions={spending.transactions}
                categories={spending.categories}
                currency={currency}
                onViewAll={() => onNavigate("finance")}
              />
              <UpcomingBillsCard
                items={bills.items}
                currency={currency}
                onViewAll={() => onNavigate("finance")}
              />
            </div>
          </>
        )}

        <div>
          <p className="mb-3 font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
            Other areas
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <LauncherCard
              index={1}
              title="Calendar"
              subtitle={calendarSubtitle}
              tint={ACCENT}
              className="min-h-[140px]"
              onOpen={() => onNavigate("calendar")}
            />
            <LauncherCard
              index={2}
              title="School"
              subtitle={schoolSubtitle}
              tint={ACCENT}
              className="min-h-[140px]"
              onOpen={() => onNavigate("school")}
            />
            <LauncherCard
              index={7}
              title="ToDos"
              subtitle={todosSubtitle}
              tint={ACCENT}
              className="min-h-[140px]"
              onOpen={() => onNavigate("todos")}
            />
            <LauncherCard
              index={9}
              title="Goals"
              subtitle={goalsSubtitle}
              tint={ACCENT}
              className="min-h-[140px]"
              onOpen={() => onNavigate("goals")}
            />
          </div>
        </div>
      </div>

      <BottomTabBar onSelect={onNavigate} />

      {/* Portaled like the tab bar: the view's enter animation transforms this
          subtree, which would re-anchor position:fixed to the view. */}
      {createPortal(
        <button
          onClick={() => setShowQuickSpend(true)}
          aria-label="Add spending"
          className="fixed right-[max(1.1rem,env(safe-area-inset-right))] bottom-[calc(max(0.9rem,env(safe-area-inset-bottom))+4.9rem)] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[0_10px_30px_rgba(251,86,7,0.45)] transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>,
        document.body,
      )}

      {showQuickSpend && (
        <AddExpenseSheet
          categories={spending.categories}
          currency={currency}
          onClose={() => setShowQuickSpend(false)}
          onSave={(entry) => {
            spending.addTransaction({ date: todayISO(), ...entry });
            setShowQuickSpend(false);
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
