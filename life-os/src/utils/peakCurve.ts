export interface HourDose {
  hour: number; // fractional hour of day, 0-24
  mg: number;
}

function gauss(x: number, c: number, w: number, a: number): number {
  return a * Math.exp(-((x - c) * (x - c)) / (2 * w * w));
}

/** Two-hump circadian baseline (morning + late-afternoon peaks, a post-lunch
 * dip, and an overnight trough), independent of any logged doses. */
export function baseline(h: number): number {
  const v =
    32 +
    gauss(h, 9, 1.8, 42) +
    gauss(h, 17, 2.2, 30) +
    gauss(h, 20.5, 1, 13) -
    gauss(h, 13.5, 1.6, 15) -
    gauss(h, 2, 3, 10);
  return Math.max(4, Math.min(98, v));
}

/** Sum of every dose's rise/decay bump (~0.6h linear rise, ~3.2h exponential
 * decay) active at hour `h`, amplitude scaled relative to a 95mg reference. */
export function doseContribution(h: number, doses: HourDose[]): number {
  let total = 0;
  for (const d of doses) {
    let t = h - d.hour;
    if (t < 0) t += 24;
    if (t >= 0 && t <= 14) {
      const rise = 0.6;
      const decay = 3.2;
      const amp = (d.mg / 95) * 22;
      const shape = t <= rise ? t / rise : Math.exp(-(t - rise) / decay);
      total += amp * shape;
    }
  }
  return total;
}

export function curveValue(h: number, doses: HourDose[]): number {
  return Math.max(2, Math.min(99, baseline(h) + doseContribution(h, doses)));
}

export function formatHour(h: number, short = false): string {
  let hh = Math.floor(((h % 24) + 24) % 24);
  let mm = Math.round((h - Math.floor(h)) * 60);
  if (mm === 60) {
    mm = 0;
    hh = (hh + 1) % 24;
  }
  const period = hh < 12 ? "AM" : "PM";
  let h12 = hh % 12;
  if (h12 === 0) h12 = 12;
  if (short) {
    return mm === 0 ? `${h12}${period[0]}` : `${h12}:${String(mm).padStart(2, "0")}${period[0]}`;
  }
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
}

export function currentHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

/** Short clock label for a fractional hour, e.g. "6 AM" or "6:30 AM" —
 * `formatHour` without the redundant ":00" when the minute is exact. */
export function clockLabel(h: number): string {
  return formatHour(h, false).replace(":00 ", " ");
}

export function moodLabel(score: number): string {
  if (score < 25) return "Drained";
  if (score < 45) return "Low";
  if (score < 65) return "Steady";
  if (score < 85) return "Focused";
  return "Peak";
}
