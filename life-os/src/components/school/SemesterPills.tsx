import { SCHOOL_SEMESTER_LABELS } from "../../data/mockData";

interface SemesterPillsProps {
  active: number;
  onChange: (index: number) => void;
}

export function SemesterPills({ active, onChange }: SemesterPillsProps) {
  return (
    <div className="flex w-fit max-w-full gap-[2px] overflow-x-auto rounded-[10px] bg-field p-[3px] font-mono text-[12px]">
      {SCHOOL_SEMESTER_LABELS.map((label, i) => (
        <button
          key={label}
          onClick={() => onChange(i)}
          aria-current={active === i ? "true" : undefined}
          className={`rounded-[7px] px-3 py-1.5 font-medium whitespace-nowrap transition-colors ${
            active === i
              ? "bg-accent text-accent-contrast"
              : "text-text-dim hover:text-text"
          }`}
        >
          {label.replace("Semester ", "S")}
        </button>
      ))}
    </div>
  );
}
