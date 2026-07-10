import { useScores } from "../../hooks/useScores";
import { Panel } from "../layout/Panel";
import { ScoreCard } from "./ScoreCard";

export function ScoresPanel({ className = "" }: { className?: string }) {
  const { scores, loading } = useScores();

  return (
    <Panel title="Scores" subtitle="Last 30 days" className={className}>
      {loading ? (
        <div className="py-8 text-center text-sm text-text-dim">
          Loading scores…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {scores.map((score) => (
            <ScoreCard key={score.id} score={score} />
          ))}
        </div>
      )}
    </Panel>
  );
}
