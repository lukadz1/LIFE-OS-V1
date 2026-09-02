export type CalendarRange = "day" | "week" | "month" | "year";

const RANGES: readonly [CalendarRange, string][] = [
  ["day", "Day"],
  ["week", "Week"],
  ["month", "Month"],
  ["year", "Year"],
];

interface RangeSwitchProps {
  value: CalendarRange;
  onChange: (range: CalendarRange) => void;
}

/** Day/Week/Month/Year toggle, top-right of the calendar panel. */
export function RangeSwitch({ value, onChange }: RangeSwitchProps) {
  return (
    <div className="flex rounded-[10px] bg-field p-[2px]">
      {RANGES.map(([range, label]) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          aria-current={value === range ? "page" : undefined}
          className={`rounded-[8px] px-2.5 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors ${
            value === range
              ? "bg-segment text-text shadow-sm"
              : "text-text-dim hover:text-text"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
