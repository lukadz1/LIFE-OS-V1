interface CoachCardProps {
  weakest: { name: string; grade: number; color: string } | null;
}

export function CoachCard({ weakest }: CoachCardProps) {
  return (
    <div className="panel-card flex flex-col justify-between rounded-[22px] bg-surface p-5 sm:p-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">
          Coach
        </p>
        {weakest ? (
          <>
            <p className="mt-3 font-serif text-[24px] leading-snug italic sm:text-[27px]">
              Focus on <span style={{ color: weakest.color }}>{weakest.name}</span>
            </p>
            <p className="mt-2 text-[13.5px] leading-snug text-text-dim">
              Your weakest subject this semester, sitting at
            </p>
          </>
        ) : (
          <p className="mt-3 text-[13.5px] leading-snug text-text-dim italic">
            Log an exam to get a coaching tip on your weakest subject.
          </p>
        )}
      </div>
      {weakest && (
        <div className="mt-5 flex items-baseline gap-2 border-t border-border pt-4">
          <span
            className="font-serif text-[32px] italic sm:text-[36px]"
            style={{ color: weakest.color }}
          >
            {weakest.grade.toFixed(1)}
          </span>
          <span className="text-[12px] text-text-dim">/ 6.0</span>
        </div>
      )}
    </div>
  );
}
