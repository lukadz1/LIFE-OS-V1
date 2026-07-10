import { useEffect, useState } from "react";
import { getScores } from "../services/dataService";
import type { ScoreMetric } from "../types";

export function useScores() {
  const [scores, setScores] = useState<ScoreMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getScores().then((data) => {
      if (!active) return;
      setScores(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { scores, loading };
}
