import { useEffect, useMemo, useState } from "react";
import { getVitalsToday } from "../services/vitalsService";
import type { VitalsToday } from "../types";
import { computePeakCurve, type PeakResult } from "../utils/peakEngine";
import { useFuel } from "./useFuel";

export function usePeakTracker() {
  const [vitals, setVitals] = useState<VitalsToday | null>(null);
  const [vitalsLoading, setVitalsLoading] = useState(true);
  const {
    loading: fuelLoading,
    caffeineToday,
    waterCount,
    waterGoal,
  } = useFuel();

  useEffect(() => {
    let active = true;
    getVitalsToday().then((data) => {
      if (!active) return;
      setVitals(data);
      setVitalsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const result = useMemo<PeakResult | null>(() => {
    if (!vitals) return null;
    return computePeakCurve(vitals, caffeineToday, waterCount, waterGoal);
  }, [vitals, caffeineToday, waterCount, waterGoal]);

  return { loading: vitalsLoading || fuelLoading, vitals, result };
}
