import { ArrowUpRight, Trash2 } from "lucide-react";
import { gradeColor } from "../../hooks/useSchool";
import type { SchoolExam, SchoolSubject } from "../../types";
import { formatPastDate } from "../../utils/date";

interface ExamsListProps {
  exams: SchoolExam[];
  subjects: SchoolSubject[];
  onDelete: (id: string) => void;
}

export function ExamsList({ exams, subjects, onDelete }: ExamsListProps) {
  if (exams.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-dim">
        No exams logged for this semester yet.
      </p>
    );
  }

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "Unknown";

  const openExam = (exam: SchoolExam) => {
    if (exam.fileDataUrl) window.open(exam.fileDataUrl, "_blank", "noopener");
  };

  return (
    <div className="flex flex-col gap-2">
      {[...exams].reverse().map((exam) => (
        <div
          key={exam.id}
          className="group panel-card flex items-center gap-3.5 rounded-[16px] bg-surface px-4 py-3 transition-colors"
        >
          <span className="shrink-0 rounded-lg bg-field px-2 py-1 font-mono text-[10px] tracking-wide text-text-dim">
            PDF
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] text-text">{subjectName(exam.subjectId)}</p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-text-dim">
              {formatPastDate(exam.date)} · {exam.fileName}
            </p>
          </div>
          <span
            className="shrink-0 font-serif text-[19px] italic"
            style={{ color: gradeColor(exam.grade) }}
          >
            {exam.grade.toFixed(1)}
          </span>
          <button
            onClick={() => openExam(exam)}
            disabled={!exam.fileDataUrl}
            aria-label={
              exam.fileDataUrl ? `Open ${exam.fileName}` : "No file attached"
            }
            title={exam.fileDataUrl ? "Open PDF" : "No file attached"}
            className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-accent/10"
          >
            <ArrowUpRight size={15} />
          </button>
          <button
            onClick={() => onDelete(exam.id)}
            aria-label={`Delete ${subjectName(exam.subjectId)} exam`}
            className="shrink-0 rounded-full p-1.5 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#ff453a]/10 hover:text-[#ff453a] focus-visible:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
