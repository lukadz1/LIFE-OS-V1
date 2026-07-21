import { HabitsPanel } from "../components/habits/HabitsPanel";
import { DashboardGrid } from "../components/layout/DashboardGrid";
import type { LifeArea } from "../types";

export function HabitsView({ areas }: { areas: LifeArea[] }) {
  return (
    <DashboardGrid>
      <HabitsPanel className="lg:col-span-8" areas={areas} />
    </DashboardGrid>
  );
}
