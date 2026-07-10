import { useState } from "react";
import { CalendarPanel } from "../components/calendar/CalendarPanel";
import { AreaFilterCard } from "../components/layout/AreaFilterCard";
import { DashboardGrid } from "../components/layout/DashboardGrid";
import type { LifeArea, LifeAreaId } from "../types";

export function CalendarView({ areas }: { areas: LifeArea[] }) {
  const [areaFilter, setAreaFilter] = useState<LifeAreaId | null>(null);

  return (
    <DashboardGrid>
      <AreaFilterCard
        className="lg:col-span-4 lg:self-start"
        areas={areas}
        selected={areaFilter}
        onSelect={setAreaFilter}
      />
      <CalendarPanel
        className="lg:col-span-8"
        areas={areas}
        selectedAreaId={areaFilter}
      />
    </DashboardGrid>
  );
}
