import { Plus } from "lucide-react";
import { useState } from "react";
import { AddExamModal } from "../components/school/AddExamModal";
import { CoachCard } from "../components/school/CoachCard";
import { ExamsList } from "../components/school/ExamsList";
import { SemesterPills } from "../components/school/SemesterPills";
import { StandingCard } from "../components/school/StandingCard";
import { SubjectsGrid } from "../components/school/SubjectsGrid";
import { useSchool } from "../hooks/useSchool";

export function SchoolView() {
  const school = useSchool();
  const [addExamOpen, setAddExamOpen] = useState(false);

  if (school.loading) {
    return (
      <div className="py-16 text-center text-sm text-text-dim">
        Loading your grades…
      </div>
    );
  }

  const chartPoints = school.exams.map((e) => ({
    date: e.date,
    grade: e.grade,
    subjectName: school.subjects.find((s) => s.id === e.subjectId)?.name ?? "",
  }));

  return (
    <div className="animate-view-in-right motion-reduce:animate-none">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
          {school.semesterLabel} overview
        </p>
        <SemesterPills active={school.semesterIndex} onChange={school.setSemesterIndex} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <StandingCard
          semesterLabel={school.semesterLabel}
          average={school.average}
          points={chartPoints}
        />
        <CoachCard weakest={school.weakest} />
      </div>

      <p className="mt-8 mb-3 font-mono text-[11px] tracking-[0.16em] text-text-dim uppercase">
        Subjects
      </p>
      <SubjectsGrid subjects={school.standing} />

      <div className="mt-8 mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.16em] text-text-dim uppercase">
          Exams · PDF review
        </p>
        <button
          onClick={() => setAddExamOpen(true)}
          className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-3.5 py-2 text-[13px] font-semibold text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add exam
        </button>
      </div>
      <ExamsList exams={school.exams} subjects={school.subjects} onDelete={school.deleteExam} />

      {addExamOpen && (
        <AddExamModal
          subjects={school.subjects}
          onClose={() => setAddExamOpen(false)}
          onSave={(entry) => {
            school.addExam(entry);
            setAddExamOpen(false);
          }}
        />
      )}
    </div>
  );
}
