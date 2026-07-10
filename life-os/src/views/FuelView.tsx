import { CaffeineCard } from "../components/fuel/CaffeineCard";
import { MealsCard } from "../components/fuel/MealsCard";
import { SupplementsCard } from "../components/fuel/SupplementsCard";
import { WaterCard } from "../components/fuel/WaterCard";
import { DashboardGrid } from "../components/layout/DashboardGrid";
import { useFuel } from "../hooks/useFuel";

export function FuelView() {
  const {
    loading,
    waterCount,
    waterGoal,
    setWaterGoal,
    logWater,
    caffeineCount,
    lastCaffeineAt,
    logCaffeine,
    mealsToday,
    totalKcalToday,
    logMeal,
    deleteEntry,
    supplementList,
    supplementsCheckedToday,
    toggleSupplement,
    addSupplementToList,
    removeSupplementFromList,
  } = useFuel();

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-text-dim">
        Loading today's fuel…
      </div>
    );
  }

  return (
    <DashboardGrid>
      <WaterCard
        className="lg:col-span-4"
        count={waterCount}
        goal={waterGoal}
        onLog={logWater}
        onGoalChange={setWaterGoal}
      />
      <CaffeineCard
        className="lg:col-span-4"
        count={caffeineCount}
        lastAt={lastCaffeineAt}
        onLog={logCaffeine}
      />
      <SupplementsCard
        className="lg:col-span-4"
        list={supplementList}
        checkedToday={supplementsCheckedToday}
        onToggle={toggleSupplement}
        onAdd={addSupplementToList}
        onRemove={removeSupplementFromList}
      />
      <MealsCard
        className="lg:col-span-12"
        meals={mealsToday}
        totalKcal={totalKcalToday}
        onAdd={logMeal}
        onDelete={deleteEntry}
      />
    </DashboardGrid>
  );
}
