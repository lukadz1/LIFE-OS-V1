import { GoalsPanel } from "../components/goals/GoalsPanel";
import { DashboardGrid } from "../components/layout/DashboardGrid";
import type { LifeArea } from "../types";

export function GoalsView({ areas }: { areas: LifeArea[] }) {
  return (
    <DashboardGrid>
      <GoalsPanel className="lg:col-span-8" areas={areas} />
    </DashboardGrid>
  );
}
