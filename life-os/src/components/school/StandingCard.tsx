import {
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BAD_GRADE_COLOR, GOOD_GRADE_COLOR, gradeColor } from "../../hooks/useSchool";

interface StandingPoint {
  date: string;
  grade: number;
  subjectName: string;
}

interface StandingCardProps {
  semesterLabel: string;
  average: number | null;
  points: StandingPoint[];
}

export function StandingCard({ semesterLabel, average, points }: StandingCardProps) {
  const avgColor = average != null ? gradeColor(average) : "var(--color-text-dim)";

  return (
    <div className="panel-card rounded-[22px] bg-surface p-5 sm:p-6">
      <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
        Standing · {semesterLabel}
      </p>
      <div className="mt-2 mb-1 flex items-baseline gap-2.5">
        <span
          className="font-sans text-[46px] leading-none sm:text-[54px]"
          style={{ color: avgColor, textShadow: average != null ? `0 0 32px ${avgColor}33` : "none" }}
        >
          {average != null ? average.toFixed(1) : "—"}
        </span>
        <span className="text-[13px] text-text-dim">average grade</span>
      </div>

      <div className="chart-dots-bg mt-3 h-[190px] rounded-[14px]">
        {points.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, bottom: 40, left: 8 }}>
              <ReferenceArea y1={4} y2={6} fill={GOOD_GRADE_COLOR} fillOpacity={0.07} />
              <ReferenceArea y1={1} y2={4} fill={BAD_GRADE_COLOR} fillOpacity={0.06} />
              <ReferenceLine
                y={4}
                stroke="var(--color-text-dim)"
                strokeOpacity={0.5}
                strokeDasharray="4 5"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-text-dim)", fontSize: 11 }}
                tickFormatter={(label) =>
                  new Date(String(label)).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis domain={[1, 6]} hide />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  fontSize: 12,
                  padding: "6px 10px",
                }}
                labelStyle={{ color: "var(--color-text-dim)" }}
                itemStyle={{ color: "var(--color-text)" }}
                formatter={(value, _name, item) => [
                  Number(value).toFixed(1),
                  (item.payload as StandingPoint).subjectName,
                ]}
                labelFormatter={(label) =>
                  new Date(String(label)).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <Line
                type="monotone"
                dataKey="grade"
                stroke="color-mix(in srgb, var(--color-accent) 65%, black)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "var(--color-accent)",
                  stroke: "var(--color-accent)",
                  filter: "drop-shadow(0 0 6px var(--color-accent))",
                }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="max-w-[220px] text-center text-[13px] text-text-dim">
              Log a couple of exams to see your standing chart here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
