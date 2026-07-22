import { useCallback, useEffect, useMemo, useState } from "react";
import { SCHOOL_SEMESTER_LABELS } from "../data/mockData";
import {
  getSchoolExams,
  getSchoolSubjects,
  saveSchoolExams,
} from "../services/dataService";
import type { SchoolExam, SchoolSubject } from "../types";
import { createId } from "../utils/id";

export const SCHOOL_SEMESTER_COUNT = SCHOOL_SEMESTER_LABELS.length;

export const GOOD_GRADE_COLOR = "#34d399";
export const BAD_GRADE_COLOR = "#ff453a";

export function gradeColor(grade: number): string {
  return grade >= 4 ? GOOD_GRADE_COLOR : BAD_GRADE_COLOR;
}

export interface SchoolSubjectStanding {
  id: string;
  name: string;
  grade: number | null;
  color: string;
}

function hasGrade(
  s: SchoolSubjectStanding,
): s is SchoolSubjectStanding & { grade: number } {
  return s.grade != null;
}

export function useSchool() {
  const [subjects, setSubjects] = useState<SchoolSubject[]>([]);
  const [exams, setExams] = useState<SchoolExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [semesterIndex, setSemesterIndex] = useState(SCHOOL_SEMESTER_COUNT - 1);

  useEffect(() => {
    let active = true;
    Promise.all([getSchoolSubjects(), getSchoolExams()]).then(([s, e]) => {
      if (!active) return;
      setSubjects(s);
      setExams(e);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const semesterSubjects = useMemo(
    () => subjects.filter((s) => s.semesterId === semesterIndex),
    [subjects, semesterIndex],
  );

  const semesterExams = useMemo(
    () =>
      exams
        .filter((e) => e.semesterId === semesterIndex)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [exams, semesterIndex],
  );

  const standing: SchoolSubjectStanding[] = useMemo(
    () =>
      semesterSubjects.map((subj) => {
        const subjExams = semesterExams.filter((e) => e.subjectId === subj.id);
        const grade = subjExams.length
          ? subjExams.reduce((sum, e) => sum + e.grade, 0) / subjExams.length
          : null;
        return {
          id: subj.id,
          name: subj.name,
          grade,
          color: grade != null ? gradeColor(grade) : "var(--color-text-dim)",
        };
      }),
    [semesterSubjects, semesterExams],
  );

  const gradedStanding = useMemo(() => standing.filter(hasGrade), [standing]);

  const average = gradedStanding.length
    ? gradedStanding.reduce((sum, s) => sum + s.grade, 0) / gradedStanding.length
    : null;

  const weakest = gradedStanding.length
    ? gradedStanding.reduce((a, b) => (b.grade < a.grade ? b : a))
    : null;

  // Same save-inside-updater pattern as useCalories/useFuel — avoids a
  // reactive-effect race that can flush stale/empty data over a real save.
  const addExam = useCallback(
    (entry: {
      subjectId: string;
      grade: number;
      fileName: string;
      fileDataUrl: string | null;
    }) => {
      setExams((prev) => {
        const next = [
          ...prev,
          {
            id: createId(),
            semesterId: semesterIndex,
            date: new Date().toISOString(),
            ...entry,
          },
        ];
        void saveSchoolExams(next);
        return next;
      });
    },
    [semesterIndex],
  );

  const deleteExam = useCallback((id: string) => {
    setExams((prev) => {
      const next = prev.filter((e) => e.id !== id);
      void saveSchoolExams(next);
      return next;
    });
  }, []);

  return {
    loading,
    semesterIndex,
    setSemesterIndex,
    semesterLabel: SCHOOL_SEMESTER_LABELS[semesterIndex],
    subjects: semesterSubjects,
    exams: semesterExams,
    standing,
    average,
    weakest,
    addExam,
    deleteExam,
  };
}
