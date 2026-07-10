import type { LifeArea, LifeAreaId } from "../../types";
import { Panel } from "./Panel";

interface AreaFilterCardProps {
  areas: LifeArea[];
  selected: LifeAreaId | null;
  onSelect: (id: LifeAreaId | null) => void;
  className?: string;
}

export function AreaFilterCard({
  areas,
  selected,
  onSelect,
  className = "",
}: AreaFilterCardProps) {
  const itemClass = (isActive: boolean) =>
    `flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-sm transition-colors ${
      isActive
        ? "bg-field font-medium text-text"
        : "text-text-dim hover:bg-hover hover:text-text"
    }`;

  return (
    <Panel title="Areas" subtitle="Filter by life area" className={className}>
      <div className="flex flex-col gap-0.5">
        <button className={itemClass(selected === null)} onClick={() => onSelect(null)}>
          <span className="h-2 w-2 rounded-full bg-text-dim" />
          All areas
        </button>
        {areas.map((area) => (
          <button
            key={area.id}
            className={itemClass(selected === area.id)}
            onClick={() => onSelect(area.id)}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: area.color }}
            />
            {area.label}
          </button>
        ))}
      </div>
    </Panel>
  );
}
