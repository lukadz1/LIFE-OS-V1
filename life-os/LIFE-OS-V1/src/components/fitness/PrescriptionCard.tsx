import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { Prescription } from "../../utils/fitnessEngine";

const TAG_STYLE = {
  up: {
    bg: "bg-[#30d158]/14",
    text: "text-[#30d158]",
    Icon: TrendingUp,
    label: "Add weight",
  },
  hold: {
    bg: "bg-[#ff9f0a]/14",
    text: "text-[#ff9f0a]",
    Icon: Minus,
    label: "Hold",
  },
  down: {
    bg: "bg-[#ff453a]/14",
    text: "text-[#ff453a]",
    Icon: TrendingDown,
    label: "Ease back",
  },
} as const;

interface PrescriptionCardProps {
  prescription: Prescription | null;
  bodyweight: boolean;
}

export function PrescriptionCard({
  prescription,
  bodyweight,
}: PrescriptionCardProps) {
  if (!prescription) {
    return (
      <div className="rounded-[14px] border border-dashed border-border p-4 text-center text-sm text-text-dim">
        Log your first set to get a recommendation.
      </div>
    );
  }

  const style = TAG_STYLE[prescription.tag];
  const Icon = style.Icon;
  const headline = bodyweight
    ? `${prescription.reps} reps`
    : `${prescription.weight}kg × ${prescription.reps}`;

  return (
    <div className="rounded-[14px] border border-border bg-hover p-4">
      <span
        className={`mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide uppercase ${style.bg} ${style.text}`}
      >
        <Icon size={11} />
        {style.label}
      </span>
      <p className="font-serif text-2xl text-text italic">{headline}</p>
      <p className="mt-1.5 text-sm text-text-dim">{prescription.reason}</p>
    </div>
  );
}
