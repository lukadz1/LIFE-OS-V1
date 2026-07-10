import type { FuelEntry, VitalsToday } from "../types";

// Simplified two-peak circadian alertness curve (hour 0-23, 0-1 scale):
// low overnight, rising to a late-morning peak, a post-lunch dip, a smaller
// evening peak, then decline. Real chronobiology varies by person — this is
// a reasonable default shape for a mock, not a measured baseline.
const BASE_CIRCADIAN = [
  0.15, 0.08, 0.05, 0.05, 0.08, 0.15, 0.3, 0.45, 0.62, 0.78, 0.9, 0.95, 0.88,
  0.72, 0.6, 0.68, 0.78, 0.82, 0.78, 0.7, 0.6, 0.48, 0.35, 0.22,
];

const WAKING_START = 6;
const WAKING_END = 22;
const LATE_CAFFEINE_HOUR = 14;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface PeakResult {
  curve: number[];
  focusStartHour: number;
  focusEndHour: number;
  breakHour: number;
  advice: string[];
}

export function formatHourLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  return `${h.toString().padStart(2, "0")}:00`;
}

export function computePeakCurve(
  vitals: VitalsToday,
  caffeineEntries: FuelEntry[],
  waterCount: number,
  waterGoal: number,
): PeakResult {
  const sleepFactor = clamp(0.6 + (vitals.sleepQuality / 100) * 0.5, 0.6, 1.15);
  const hrvFactor = clamp(
    0.85 + ((vitals.hrv - vitals.hrvBaseline) / vitals.hrvBaseline) * 0.5,
    0.8,
    1.15,
  );
  const stressFactor = clamp(1.15 - (vitals.stressLevel / 100) * 0.4, 0.75, 1.15);

  const currentHour = new Date().getHours();
  const expectedWater =
    waterGoal *
    clamp(
      (currentHour - WAKING_START) / (WAKING_END - WAKING_START),
      0,
      1,
    );
  const behindOnWater = waterCount + 1.5 < expectedWater;

  const caffeineHours = caffeineEntries.map((e) => new Date(e.at).getHours());
  const lateCaffeine = caffeineHours.some((h) => h >= LATE_CAFFEINE_HOUR);

  const curve = BASE_CIRCADIAN.map((base, hour) => {
    let value =
      base * sleepFactor * hrvFactor * stressFactor * vitals.bodyBatteryWake * 1.05;

    for (const h of caffeineHours) {
      const delta = hour - h;
      if (delta >= 0 && delta <= 3) value += 14 * (1 - delta / 4);
      else if (delta > 3 && delta <= 6) value -= 7 * (1 - (delta - 3) / 4);
    }

    if (lateCaffeine && hour >= 21) value -= 10;
    if (behindOnWater && hour >= currentHour) value -= 5;

    return clamp(Math.round(value), 5, 100);
  });

  const wakingHours = curve
    .map((_, h) => h)
    .filter((h) => h >= WAKING_START && h <= WAKING_END);
  const focusStartHour = wakingHours.reduce(
    (best, h) => (curve[h] > curve[best] ? h : best),
    wakingHours[0],
  );
  // Look for the dip shortly after the focus peak (the natural post-lunch
  // slump), not the global minimum for the rest of the day — otherwise this
  // just finds the evening wind-down, which isn't an actionable "take a
  // break" moment.
  const troughWindow = wakingHours.filter(
    (h) => h > focusStartHour + 1 && h <= focusStartHour + 7,
  );
  const troughCandidates =
    troughWindow.length > 0
      ? troughWindow
      : wakingHours.filter((h) => h > focusStartHour);
  const breakHour = troughCandidates.reduce(
    (worst, h) => (curve[h] < curve[worst] ? h : worst),
    troughCandidates[0] ?? wakingHours[wakingHours.length - 1],
  );

  const advice: string[] = [];
  advice.push(
    vitals.sleepQuality < 70
      ? `Sleep quality was ${vitals.sleepQuality}/100 last night — expect a flatter curve today.`
      : `Sleep quality was solid (${vitals.sleepQuality}/100) — good foundation for today.`,
  );
  advice.push(
    vitals.hrv >= vitals.hrvBaseline
      ? `HRV is at or above your baseline (${vitals.hrv} vs ${vitals.hrvBaseline}ms) — recovery looks good.`
      : `HRV is below your baseline (${vitals.hrv} vs ${vitals.hrvBaseline}ms) — take it easier if you can.`,
  );
  if (lateCaffeine) {
    advice.push(
      "Your last caffeine was after 2pm — it may cut into tonight's sleep.",
    );
  }
  if (behindOnWater) {
    advice.push(
      "You're behind on water for this time of day — that alone can cost you focus.",
    );
  }
  if (vitals.stressLevel > 60) {
    advice.push(
      "Stress is elevated — a short walk before your next deep-work block could help.",
    );
  }
  advice.push(
    `Best focus window: ${formatHourLabel(focusStartHour)}–${formatHourLabel(
      focusStartHour + 2,
    )}. Consider a break around ${formatHourLabel(breakHour)}.`,
  );

  return {
    curve,
    focusStartHour,
    focusEndHour: focusStartHour + 2,
    breakHour,
    advice,
  };
}
