import type { SchoolSubjectStanding } from "../../hooks/useSchool";

export function SubjectsGrid({ subjects }: { subjects: SchoolSubjectStanding[] }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
      {subjects.map((subj) => {
        const pct = subj.grade != null ? ((subj.grade - 1) / 5) * 100 : null;
        return (
          <div
            key={subj.id}
            className="panel-card min-w-0 rounded-[18px] bg-surface p-4 transition-transform hover:-translate-y-0.5"
          >
            <p className="truncate text-[13px] text-text-dim">{subj.name}</p>
            <p
              className="mt-2 font-serif text-[27px] italic"
              style={{ color: subj.color }}
            >
              {subj.grade != null ? subj.grade.toFixed(1) : "—"}
            </p>
            <div className="relative mt-3 h-[5px] rounded-full bg-field">
              {pct != null && (
                <span
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${pct}%`,
                    backgroundColor: subj.color,
                    boxShadow: "0 0 0 3px var(--color-surface)",
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
