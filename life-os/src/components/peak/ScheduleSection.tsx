import type { CalendarEvent } from "../../types";

interface ScheduleSectionProps {
  events: CalendarEvent[];
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ScheduleSection({ events }: ScheduleSectionProps) {
  const now = new Date();
  const current = events.find(
    (e) => new Date(e.start) <= now && now <= new Date(e.end),
  );
  const next = events.find((e) => new Date(e.start) > now);

  return (
    <>
      <div className="mt-9 mb-3.5 flex items-center">
        <p className="font-mono text-[11px] tracking-[0.1em] text-accent">
          · 02 YOUR SCHEDULE
        </p>
      </div>
      <div className="panel-card grid grid-cols-1 gap-7 rounded-[18px] bg-surface p-[26px_30px] sm:grid-cols-[1fr_1px_1fr]">
        <div>
          {current ? (
            <>
              <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/12 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.08em] text-accent">
                ● NOW · {fmtTime(current.start)}–{fmtTime(current.end)}
              </span>
              <div className="font-serif text-[26px] font-semibold text-text">
                {current.title}
              </div>
            </>
          ) : (
            <div className="font-serif text-[22px] font-semibold text-text-dim italic">
              Nothing scheduled right now
            </div>
          )}
          {next && (
            <>
              <div className="mt-3.5 font-mono text-[11px] text-text-dim">UP NEXT</div>
              <div className="mt-1 text-[12.5px] text-text/90">
                {next.title} · {fmtTime(next.start)}
              </div>
            </>
          )}
        </div>
        <div className="hidden bg-white/7 sm:block" />
        <div>
          <div className="mb-3.5 font-serif text-[16px] font-semibold text-text">
            Today
          </div>
          {events.length > 0 ? (
            <div className="flex flex-col gap-3 text-[12px]">
              {events.map((e) => (
                <div key={e.id} className="flex justify-between gap-3 text-text-dim/70">
                  <span className="shrink-0">
                    {fmtTime(e.start)}
                    {e.end !== e.start ? `–${fmtTime(e.end)}` : ""}
                  </span>
                  <span className="text-right text-text/90">{e.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-text-dim italic">No events today.</p>
          )}
        </div>
      </div>
    </>
  );
}
