import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  baseline,
  clockLabel,
  curveValue,
  doseContribution,
  formatHour,
  moodLabel,
  type HourDose,
} from "../../utils/peakCurve";

const W = 900;
const H = 220;
const PT = 8;
const PB = 8;
const UH = H - PT - PB;
const GRID_VALUES = [20, 40, 60, 80];

function xFor(h: number): number {
  return (h / 24) * W;
}
function yFor(v: number): number {
  return PT + (1 - v / 100) * UH;
}

export interface StackGroup {
  color: string;
  doses: HourDose[];
}

export interface ScrubInfo {
  hour: number;
  value: number;
}

interface EnergyChartProps {
  doses: HourDose[];
  stackGroups: StackGroup[];
  feelPoints: { hour: number; value: number }[];
  view: "line" | "bars" | "stack";
  onLogFeel: (hour: number, value: number) => void;
  onScrub?: (info: ScrubInfo | null) => void;
  onDragStateChange?: (dragging: boolean) => void;
}

export function EnergyChart({
  doses,
  stackGroups,
  feelPoints,
  view,
  onLogFeel,
  onScrub,
  onDragStateChange,
}: EnergyChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  function eventToHourValue(e: ReactMouseEvent): { hour: number; value: number } {
    const el = wrapRef.current;
    if (!el) return { hour: 0, value: 50 };
    const rect = el.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { hour: relX * 24, value: Math.max(0, Math.min(100, 100 - relY * 100)) };
  }

  function handleMouseMove(e: ReactMouseEvent) {
    const { hour, value } = eventToHourValue(e);
    const predicted = curveValue(hour, doses);
    setHoverX(hour);
    onScrub?.({ hour, value: predicted });
    if (dragging) {
      onLogFeel(hour, value);
      setDragValue(value);
    }
  }
  function handleMouseDown(e: ReactMouseEvent) {
    const { hour, value } = eventToHourValue(e);
    setDragging(true);
    onDragStateChange?.(true);
    onLogFeel(hour, value);
    setDragValue(value);
  }
  function handleMouseUp() {
    setDragging(false);
    onDragStateChange?.(false);
  }
  function handleMouseLeave() {
    setDragging(false);
    onDragStateChange?.(false);
    setHoverX(null);
    onScrub?.(null);
  }

  const pts: { h: number; v: number }[] = [];
  for (let h = 0; h <= 24; h += 0.25) pts.push({ h, v: curveValue(h, doses) });
  const pathD =
    "M" + pts.map((p) => `${xFor(p.h).toFixed(1)},${yFor(p.v).toFixed(1)}`).join(" L");
  const areaD = `${pathD} L${W},${H} L0,${H} Z`;

  const bars: { x: number; y: number; width: number; height: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const v = curveValue(h + 0.5, doses);
    const bw = (W / 24) * 0.62;
    const x = h * (W / 24) + (W / 24 - bw) / 2;
    bars.push({ x, y: yFor(v), width: bw, height: H - PB - yFor(v) });
  }

  const stackBars: {
    x: number;
    width: number;
    segments: { color: string; y: number; height: number }[];
  }[] = [];
  for (let h = 0; h < 24; h++) {
    const hc = h + 0.5;
    const base = baseline(hc);
    let cum = base;
    const segs: { color: string; y: number; height: number }[] = [
      { color: "rgba(255,255,255,0.14)", y: yFor(base), height: H - PB - yFor(base) },
    ];
    for (const group of stackGroups) {
      if (group.doses.length === 0) continue;
      const contrib = doseContribution(hc, group.doses);
      if (contrib < 0.3) continue;
      const prevCum = cum;
      cum += contrib;
      segs.push({ color: group.color, y: yFor(cum), height: yFor(prevCum) - yFor(cum) });
    }
    const bw = (W / 24) * 0.62;
    const x = h * (W / 24) + (W / 24 - bw) / 2;
    stackBars.push({ x, width: bw, segments: segs });
  }

  const hourLabels = [0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => formatHour(h, true));

  const feelPts = feelPoints.map((f) => ({ hour: f.hour, cx: xFor(f.hour), cy: yFor(f.value) }));
  const feelPathD =
    feelPts.length > 1
      ? "M" + feelPts.map((p) => `${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(" L")
      : null;

  const hoverDot =
    hoverX != null ? { cx: xFor(hoverX), cy: yFor(curveValue(hoverX, doses)) } : null;
  const hoverValue = hoverX != null ? Math.round(curveValue(hoverX, doses)) : null;

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative mt-6"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <span className="animate-pill-in pointer-events-none absolute top-2 left-2 z-10 rounded-full border border-dashed border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[9px] tracking-[0.06em] text-text-dim backdrop-blur-sm">
          DRAG TO LOG FEEL
        </span>

        {hoverX != null && (
          <>
            <div
              className="pointer-events-none absolute top-0 bottom-[26px] w-px border-l border-dashed border-accent/35"
              style={{ left: `${(hoverX / 24) * 100}%` }}
            />
            <div
              className="animate-pill-in pointer-events-none absolute top-[-14px] -translate-x-1/2 rounded-[10px] border border-accent/50 bg-[#0c0c0e] px-3 py-2 text-center shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              style={{ left: `${(hoverX / 24) * 100}%` }}
            >
              <div className="font-serif text-[20px] leading-none font-semibold text-accent italic">
                {hoverValue}
              </div>
              <div className="mt-0.5 whitespace-nowrap font-mono text-[9.5px] tracking-wide text-text-dim">
                {moodLabel(hoverValue ?? 0)} · {clockLabel(hoverX)}
              </div>
            </div>
          </>
        )}

        {dragging && dragValue != null && (
          <div className="animate-pill-in pointer-events-none absolute top-1.5 right-0 flex items-center gap-1 rounded-full bg-accent px-2.5 py-[5px] font-mono text-[9.5px] font-bold tracking-[0.05em] text-accent-contrast shadow-[0_0_16px_color-mix(in_srgb,var(--color-accent)_60%,transparent)]">
            LOG FEEL · {Math.round(dragValue)} ↓
          </div>
        )}

        <svg width="100%" height={220} viewBox={`0 0 ${W} ${H}`} className="block cursor-crosshair">
          <defs>
            <linearGradient id="peak-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
            <filter id="peak-glow" x="-40%" y="-100%" width="180%" height="300%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <filter id="peak-glow-sm" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
          </defs>

          {GRID_VALUES.map((v) => (
            <line
              key={v}
              x1={0}
              x2={W}
              y1={yFor(v)}
              y2={yFor(v)}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 6"
            />
          ))}

          {view === "line" && (
            <>
              <path d={areaD} fill="url(#peak-area-fill)" stroke="none" />
              <path
                d={pathD}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={7}
                opacity={0.4}
                filter="url(#peak-glow)"
              />
              <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
            </>
          )}

          {view === "bars" &&
            bars.map((b, i) => (
              <rect
                key={i}
                x={b.x}
                y={b.y}
                width={b.width}
                height={b.height}
                rx={3}
                fill="var(--color-accent)"
                opacity={0.7}
              />
            ))}

          {view === "stack" &&
            stackBars.map((sb, i) => (
              <g key={i}>
                {sb.segments.map((seg, j) => (
                  <rect key={j} x={sb.x} y={seg.y} width={sb.width} height={seg.height} fill={seg.color} />
                ))}
              </g>
            ))}

          {feelPathD && (
            <path d={feelPathD} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="4 4" />
          )}
          {feelPts.map((p, i) => (
            <g key={i}>
              <circle cx={p.cx} cy={p.cy} r={9} fill="#fff" opacity={0.25} filter="url(#peak-glow-sm)" />
              <circle cx={p.cx} cy={p.cy} r={3.5} fill="#fff" />
            </g>
          ))}

          {hoverDot && (
            <g className="pointer-events-none">
              <circle
                cx={hoverDot.cx}
                cy={hoverDot.cy}
                r={9}
                fill="var(--color-accent)"
                className="animate-scrub-pulse origin-center"
              />
              <circle cx={hoverDot.cx} cy={hoverDot.cy} r={4} fill="var(--color-accent)" stroke="#0c0c0e" strokeWidth={1.5} />
            </g>
          )}
        </svg>

        <div className="mt-1.5 flex justify-between px-0.5 font-mono text-[9.5px] text-text-dim">
          {hourLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
