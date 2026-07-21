import type { VitalsToday } from "../types";

// Mock stand-in for a real Garmin Connect -> Supabase pipeline. A Garmin watch
// doesn't expose a live public API, so the real version of this function
// would read the latest row a scheduled sync script (e.g. garminconnect-ha)
// pushed into a Supabase `vitals` table for today's date. Swapping this in
// later means rewriting the body of this one function only.

const LATENCY_MS = 150;

const MOCK_VITALS_TODAY: VitalsToday = {
  hrv: 48,
  hrvBaseline: 45,
  sleepHours: 7.1,
  sleepQuality: 72,
  restingHr: 58,
  stressLevel: 34,
  bodyBatteryWake: 78,
};

export async function getVitalsToday(): Promise<VitalsToday> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_VITALS_TODAY), LATENCY_MS),
  );
}
