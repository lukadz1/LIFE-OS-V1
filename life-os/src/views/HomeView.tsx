import { BottomTabBar } from "../components/home/BottomTabBar";
import { GreetingHero } from "../components/home/GreetingHero";
import { LauncherCard } from "../components/home/LauncherCard";
import type { ViewId } from "../components/layout/NavBar";
import { useCalories } from "../hooks/useCalories";
import { useExercises } from "../hooks/useExercises";
import { useFinance } from "../hooks/useFinance";
import { useFuel } from "../hooks/useFuel";
import { useGoals } from "../hooks/useGoals";
import { useHabits } from "../hooks/useHabits";
import { usePeakTracker } from "../hooks/usePeakTracker";
import { useSchool } from "../hooks/useSchool";
import { useTasks } from "../hooks/useTasks";
import { formatMoney } from "../utils/currency";
import { isToday } from "../utils/date";

interface HomeViewProps {
  onNavigate: (view: ViewId) => void;
}

const ACCENT = "var(--color-accent)";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const exercisesData = useExercises();
  const school = useSchool();
  const finance = useFinance();
  const calories = useCalories();
  const fuel = useFuel();
  const peak = usePeakTracker();
  const tasks = useTasks();
  const habits = useHabits();
  const goals = useGoals();

  // ---- live stat lines, one per area ----

  const setsToday = exercisesData.setLogs.filter((s) => isToday(s.at)).length;
  const fitnessSubtitle =
    setsToday > 0
      ? `${setsToday} set${setsToday === 1 ? "" : "s"} logged today`
      : exercisesData.exercises.length > 0
        ? `${exercisesData.exercises.length} exercises tracked`
        : "Lifts & progression";

  const schoolSubtitle =
    school.average != null
      ? `Avg grade ${school.average.toFixed(1)}${
          school.weakest ? ` · weakest ${school.weakest.name}` : ""
        }`
      : "Grades & exams";

  const financeSubtitle = finance.loading
    ? "Net worth & spending"
    : `${formatMoney(finance.netWorthChf, "CHF")} net worth${
        finance.stats.oneDayChangePct != null
          ? ` · ${finance.stats.oneDayChangePct >= 0 ? "+" : ""}${finance.stats.oneDayChangePct.toFixed(1)}%`
          : ""
      }`;

  const caloriesSubtitle =
    !calories.loading && calories.goals
      ? `${Math.round(calories.totals.kcal)} / ${calories.goals.kcalGoal} kcal today`
      : "KCAL, macros & weight";

  const fuelSubtitle = fuel.loading
    ? "Water, caffeine & meals"
    : `${fuel.waterCount}/${fuel.waterGoal} water · ${fuel.caffeineCount} caffeine`;

  const peakSubtitle = peak.loading
    ? "Today's energy curve"
    : peak.doseLogsToday.length > 0
      ? `${peak.doseLogsToday.length} dose${peak.doseLogsToday.length === 1 ? "" : "s"} logged today`
      : "No doses logged yet";

  const openTasks = tasks.tasks.filter((t) => !t.completed);
  const todosSubtitle = tasks.loading
    ? "Tasks & priorities"
    : openTasks.length > 0
      ? `${openTasks.length} open task${openTasks.length === 1 ? "" : "s"}`
      : "All caught up";

  const today = todayKey();
  const habitsDoneToday = habits.habits.filter((h) =>
    h.completedDates.includes(today),
  ).length;
  const habitsSubtitle = habits.loading
    ? "Streaks & routines"
    : habits.habits.length > 0
      ? `${habitsDoneToday}/${habits.habits.length} done today`
      : "No habits yet";

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

  return (
    <div>
      <GreetingHero name="Luka" />
      <div className="home-bento pb-24">
        <LauncherCard
          index={1}
          title="Fitness"
          subtitle={fitnessSubtitle}
          tint={ACCENT}
          className="area-fitness min-h-[180px]"
          onOpen={() => onNavigate("fitness")}
        />
        <LauncherCard
          index={2}
          title="School"
          subtitle={schoolSubtitle}
          tint={ACCENT}
          className="area-school min-h-[180px]"
          onOpen={() => onNavigate("school")}
        />
        <LauncherCard
          index={3}
          title="Finance"
          subtitle={financeSubtitle}
          tint={ACCENT}
          className="area-finance min-h-[180px]"
          onOpen={() => onNavigate("finance")}
        />
        <LauncherCard
          index={4}
          title="KCAL Tracker"
          subtitle={caloriesSubtitle}
          tint={ACCENT}
          className="area-calories min-h-[180px]"
          onOpen={() => onNavigate("calories")}
        />
        <LauncherCard
          index={5}
          title="Todays fuel"
          subtitle={fuelSubtitle}
          tint={ACCENT}
          className="area-fuel min-h-[200px]"
          onOpen={() => onNavigate("fuel")}
        />
        <LauncherCard
          index={6}
          title="Peak Tracker"
          subtitle={peakSubtitle}
          tint={ACCENT}
          className="area-peak min-h-[180px]"
          onOpen={() => onNavigate("peak")}
        />
        <LauncherCard
          index={7}
          title="ToDos"
          subtitle={todosSubtitle}
          tint={ACCENT}
          className="area-todos min-h-[180px]"
          onOpen={() => onNavigate("todos")}
        />
        <LauncherCard
          index={8}
          title="Habits"
          subtitle={habitsSubtitle}
          tint={ACCENT}
          className="area-habits min-h-[180px]"
          onOpen={() => onNavigate("habits")}
        />
        <LauncherCard
          index={9}
          title="Goals"
          subtitle={goalsSubtitle}
          tint={ACCENT}
          className="area-goals min-h-[200px]"
          onOpen={() => onNavigate("goals")}
        />
      </div>

      <BottomTabBar onSelect={onNavigate} />
    </div>
  );
}
