import type { Gym, TrainingDay } from "../../types";

interface Option {
  id: string;
  name: string;
}

interface GymDaySelectProps {
  gyms: Gym[];
  days: TrainingDay[];
  gymId: string;
  dayId: string;
  onGymChange: (id: string) => void;
  onDayChange: (id: string) => void;
}

export function GymDaySelect({
  gyms,
  days,
  gymId,
  dayId,
  onGymChange,
  onDayChange,
}: GymDaySelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <SegRow
        label="Gym"
        value={gymId}
        onChange={onGymChange}
        options={[{ id: "all", name: "All" }, ...gyms]}
      />
      <SegRow
        label="Day"
        value={dayId}
        onChange={onDayChange}
        options={[{ id: "all", name: "All" }, ...days]}
      />
    </div>
  );
}

function SegRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: Option[];
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-9 shrink-0 font-mono text-[10px] tracking-wide text-text-dim uppercase">
        {label}
      </span>
      <div className="flex flex-1 rounded-[10px] bg-field p-[3px] text-xs">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`flex-1 truncate rounded-[7px] px-2 py-2 font-medium transition-colors ${
              value === o.id
                ? "bg-segment text-text shadow-sm"
                : "text-text-dim hover:text-text"
            }`}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}
