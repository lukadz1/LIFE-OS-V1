import { useState } from "react";
import { AreaFilterCard } from "../components/layout/AreaFilterCard";
import { DashboardGrid } from "../components/layout/DashboardGrid";
import { TodoPanel } from "../components/todo/TodoPanel";
import type { LifeArea, LifeAreaId } from "../types";

export function TodosView({ areas }: { areas: LifeArea[] }) {
  const [areaFilter, setAreaFilter] = useState<LifeAreaId | null>(null);

  return (
    <DashboardGrid>
      <AreaFilterCard
        className="lg:col-span-4 lg:self-start"
        areas={areas}
        selected={areaFilter}
        onSelect={setAreaFilter}
      />
      <TodoPanel
        className="lg:col-span-8"
        areas={areas}
        selectedAreaId={areaFilter}
        hideAreaChip
      />
    </DashboardGrid>
  );
}
