import { Check } from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";

interface GreetingHeroProps {
  name?: string;
}

function shortGreeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Europe/Berlin",
    }).format(new Date()),
  );
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Afternoon";
  return "Evening";
}

const SIDES = 6;
const FACE_W = 36; // width of each vertical side facet (px)
const APOTHEM = 31; // axis → face distance, ≈ FACE_W * √3/2 so facets meet
const BODY_H = 52; // straight middle height of the crystal (px)
const CAP_H = 22; // height of the tapered top / bottom crown (px)

// Green facet shades, alternating around the ring for a cut-emerald look.
const SHADES = ["#a8f8cb", "#30d158", "#1c9c46", "#0f5c29", "#22b752", "#30d158"];

// How far the orb drifts toward the cursor, in px/deg at the edge of the
// tracking radius. Kept small so it reads as "alive", not distracting.
const MAX_SHIFT_PX = 10;
const MAX_TILT_DEG = 6;
const TRACK_RADIUS_PX = 480;

/** A 3D faceted crystal built from CSS faces, spinning around its axis. */
function GemAvatar({ size = 132 }: { size?: number }) {
  const H = BODY_H + CAP_H * 2;
  const capApex = APOTHEM * 0.16; // how far in the tips pull toward the axis
  const trackRef = useRef<HTMLDivElement>(null);

  // Cursor-follow parallax: drives the wrapper's transform directly via the
  // DOM (not React state) so mousemove doesn't trigger a re-render per pixel.
  // Lives on its own wrapper div, separate from the float/spin animations
  // below, so the two transforms never fight over the same element.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / TRACK_RADIUS_PX));
      const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / TRACK_RADIUS_PX));
      el!.style.transform = `translate(${nx * MAX_SHIFT_PX}px, ${ny * MAX_SHIFT_PX}px) rotate(${nx * MAX_TILT_DEG}deg)`;
    }

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div
      ref={trackRef}
      className="transition-transform duration-300 ease-out motion-reduce:transition-none"
      style={{ willChange: "transform" }}
    >
      <div
        aria-hidden
        className="shrink-0 animate-gem-float"
        style={{
          width: size,
          height: size,
          perspective: 520,
          filter: "drop-shadow(0 12px 22px rgba(48,209,88,0.4))",
        }}
      >
        <div
          className="animate-spin-orb"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
          }}
        >
          {Array.from({ length: SIDES }).map((_, i) => {
            const angle = (360 / SIDES) * i;
            const common: CSSProperties = {
              position: "absolute",
              left: "50%",
              top: "50%",
              width: FACE_W,
              marginLeft: -FACE_W / 2,
              transform: `rotateY(${angle}deg) translateZ(${APOTHEM}px)`,
              backfaceVisibility: "hidden",
            };
            return (
              <div key={`face-${i}`}>
                {/* Top crown facet — trapezoid tapering up to the tip */}
                <div
                  style={{
                    ...common,
                    height: CAP_H,
                    marginTop: -H / 2,
                    clipPath: `polygon(${capApex}px 100%, ${FACE_W - capApex}px 100%, 100% 0, 0 0)`,
                    background: `linear-gradient(180deg, #08331a, ${SHADES[i]})`,
                  }}
                />
                {/* Straight middle facet */}
                <div
                  style={{
                    ...common,
                    height: BODY_H,
                    marginTop: -BODY_H / 2,
                    background: `linear-gradient(105deg, ${SHADES[i]}, ${SHADES[(i + 3) % SIDES]})`,
                    boxShadow: "inset 0 0 12px rgba(0,0,0,0.15)",
                  }}
                />
                {/* Bottom crown facet — trapezoid tapering down to the tip */}
                <div
                  style={{
                    ...common,
                    height: CAP_H,
                    marginTop: H / 2 - CAP_H,
                    clipPath: `polygon(0 100%, 100% 100%, ${FACE_W - capApex}px 0, ${capApex}px 0)`,
                    background: `linear-gradient(0deg, #062615, ${SHADES[i]})`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Checkmark badge — stays facing the viewer while the crystal spins */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Check
            size={size * 0.32}
            strokeWidth={3.5}
            color="#f0fff7"
            style={{ filter: "drop-shadow(0 1px 3px rgba(6,38,21,0.9))" }}
          />
        </div>
      </div>
    </div>
  );
}

export function GreetingHero({ name = "Luka" }: GreetingHeroProps) {
  const date = new Date()
    .toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <div className="flex items-center gap-6 py-4 sm:gap-8 sm:py-6">
      <GemAvatar />
      <div>
        <h2 className="font-serif text-[34px] leading-tight font-normal tracking-tight italic sm:text-[48px]">
          {shortGreeting()}, <span className="text-accent">{name}</span>
        </h2>
        <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-text-dim uppercase sm:text-xs">
          {date}
        </p>
      </div>
    </div>
  );
}
