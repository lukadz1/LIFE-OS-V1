import { Sparkles } from "lucide-react";
import { Panel } from "../layout/Panel";

export function PeakAdviceCard({
  advice,
  className = "",
}: {
  advice: string[];
  className?: string;
}) {
  return (
    <Panel title="Peak advice" subtitle="Based on today's data" className={className}>
      <div className="flex flex-col gap-2.5">
        {advice.map((line, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm text-text">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-accent" />
            <span>{line}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
