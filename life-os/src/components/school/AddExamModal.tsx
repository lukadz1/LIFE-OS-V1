import { X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import type { SchoolSubject } from "../../types";

interface AddExamModalProps {
  subjects: SchoolSubject[];
  onClose: () => void;
  onSave: (entry: {
    subjectId: string;
    grade: number;
    fileName: string;
    fileDataUrl: string | null;
  }) => void;
}

const GRADE_OPTIONS: number[] = [];
for (let g = 1; g <= 6; g += 0.5) GRADE_OPTIONS.push(g);

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block font-mono text-[11px] tracking-wide text-text-dim uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

const selectClass =
  "w-full rounded-[10px] bg-field px-3 py-2.5 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none";

export function AddExamModal({ subjects, onClose, onSave }: AddExamModalProps) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [grade, setGrade] = useState("4");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!subjectId) return;
    onSave({
      subjectId,
      grade: Number(grade),
      fileName: fileName ?? "no file attached",
      fileDataUrl,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="Add exam"
        className="w-full max-w-[380px] rounded-[18px] border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[21px] text-text italic">Add exam</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-text-dim transition-colors hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        <Field label="Subject">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className={selectClass}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Grade (1 worst – 6 best)">
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className={selectClass}
          >
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g.toFixed(1)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Exam PDF">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full truncate rounded-[10px] border border-dashed border-white/25 bg-field px-3.5 py-3 text-left text-[13px] text-text-dim transition-colors hover:text-text"
          >
            {fileName ?? "Choose PDF file…"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </Field>

        <div className="mt-2 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!subjectId}
            className="flex-1 rounded-full bg-accent py-2.5 text-[13px] font-semibold text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
