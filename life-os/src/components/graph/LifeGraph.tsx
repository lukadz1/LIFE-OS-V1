import type { LifeArea, LifeAreaId } from "../../types";
import { Panel } from "../layout/Panel";
import { GraphNode } from "./GraphNode";

const SIZE = 400;
const CENTER = SIZE / 2;
const ORBIT_RADIUS = 148;
const NODE_RADIUS = 34;
const CENTER_RADIUS = 44;

function positionFor(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER + ORBIT_RADIUS * Math.cos(angle),
    y: CENTER + ORBIT_RADIUS * Math.sin(angle),
  };
}

interface LifeGraphPanelProps {
  className?: string;
  areas: LifeArea[];
  loading: boolean;
  selectedAreaId: LifeAreaId | null;
  onSelectArea: (id: LifeAreaId | null) => void;
}

export function LifeGraphPanel({
  className = "",
  areas,
  loading,
  selectedAreaId,
  onSelectArea,
}: LifeGraphPanelProps) {
  const selectedArea = areas.find((area) => area.id === selectedAreaId) ?? null;

  return (
    <Panel
      title="Life Map"
      subtitle={
        selectedArea
          ? selectedArea.description
          : "Click a node to focus an area"
      }
      className={className}
      bodyClassName="flex items-center justify-center"
    >
      {loading ? (
        <div className="text-sm text-text-dim">Loading map…</div>
      ) : (
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full max-w-sm"
          role="img"
          aria-label="Life areas network graph"
        >
          {areas.map((area, i) => {
            const { x, y } = positionFor(i, areas.length);
            const isSelected = area.id === selectedAreaId;
            const isDimmed = selectedAreaId !== null && !isSelected;
            return (
              <line
                key={`edge-${area.id}`}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                stroke={area.color}
                strokeWidth={isSelected ? 1.5 : 1}
                opacity={isDimmed ? 0.1 : isSelected ? 0.6 : 0.25}
                className="transition-opacity duration-300"
              />
            );
          })}

          <GraphNode
            x={CENTER}
            y={CENTER}
            r={CENTER_RADIUS}
            color="#fb5607"
            label="ME"
            selected={selectedAreaId === null}
            onClick={() => onSelectArea(null)}
          />

          {areas.map((area, i) => {
            const { x, y } = positionFor(i, areas.length);
            const isSelected = area.id === selectedAreaId;
            const isDimmed = selectedAreaId !== null && !isSelected;
            return (
              <GraphNode
                key={area.id}
                x={x}
                y={y}
                r={NODE_RADIUS}
                color={area.color}
                label={area.label}
                selected={isSelected}
                dimmed={isDimmed}
                onClick={() => onSelectArea(isSelected ? null : area.id)}
              />
            );
          })}
        </svg>
      )}
    </Panel>
  );
}
