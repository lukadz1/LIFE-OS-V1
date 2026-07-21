import { useCallback, useEffect, useRef } from "react";

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

// ===== Coach =====
// A soft white blob with a black eye that idles with an organic wobble,
// leans subtly toward the cursor, and looks around on its own — alive
// without being a literal recreation of any one reference character.
// Reaction distances are in viewport pixels (independent of the blob's own
// rendered size); lean/stretch use plain translate + uniform scale only —
// deliberately not a rotate/scale(x,y)/rotate(-angle) stretch trick, which
// causes a visible spin at the angle wrap (atan2 discontinuity at ±180°).

const REACT_RADIUS_PX = 260; // blob leans/grows within this cursor distance
const EYE_RADIUS_PX = 180; // eye tracks the cursor within this distance
const WANDER_INTERVAL_MS = 2200;
const EYE_SIZE_RATIO = 22 / 88; // spec's eye is 22px on an 88px blob

function CoachAvatar({ size = 72 }: { size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const eyeRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const hoverRef = useRef(false);
  const wanderRef = useRef({ x: 0, y: 0 });

  const updateCenter = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    centerRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  // Mutate the DOM directly rather than via React state so mousemove/wander
  // ticks don't trigger a re-render per frame.
  const applyBlob = useCallback(() => {
    const blob = blobRef.current;
    if (!blob) return;
    let stretch = 0;
    let leanX = 0;
    let leanY = 0;
    const m = mouseRef.current;
    if (m) {
      const dx = m.x - centerRef.current.x;
      const dy = m.y - centerRef.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist < REACT_RADIUS_PX && dist > 0) {
        const t = 1 - dist / REACT_RADIUS_PX;
        stretch = t * 0.12;
        const lean = t * 4;
        leanX = (dx / dist) * lean;
        leanY = (dy / dist) * lean;
      }
    }
    const hoverBoost = hoverRef.current ? 0.05 : 0;
    blob.style.transform = `translate(${leanX}px, ${leanY}px) scale(${1 + stretch + hoverBoost})`;
  }, []);

  const applyEye = useCallback(() => {
    const eye = eyeRef.current;
    if (!eye) return;
    let px = 0;
    let py = 0;
    const m = mouseRef.current;
    if (m) {
      const dx = m.x - centerRef.current.x;
      const dy = m.y - centerRef.current.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < EYE_RADIUS_PX) {
        const mag = (1 - dist / EYE_RADIUS_PX) * 5;
        px = (dx / dist) * mag;
        py = (dy / dist) * mag;
      }
    }
    px += wanderRef.current.x;
    py += wanderRef.current.y;
    eye.style.transform = `translate(${px}px, ${py}px)`;
  }, []);

  useEffect(() => {
    updateCenter();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMove(e: PointerEvent) {
      updateCenter();
      mouseRef.current = { x: e.clientX, y: e.clientY };
      applyBlob();
      applyEye();
    }
    function handleResize() {
      updateCenter();
      applyBlob();
      applyEye();
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("resize", handleResize);
    const wanderTimer = window.setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const mag = 2 + Math.random() * 3.5;
      wanderRef.current = { x: Math.cos(angle) * mag, y: Math.sin(angle) * mag };
      applyEye();
    }, WANDER_INTERVAL_MS);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("resize", handleResize);
      window.clearInterval(wanderTimer);
    };
  }, [updateCenter, applyBlob, applyEye]);

  const handleEnter = () => {
    hoverRef.current = true;
    applyBlob();
  };
  const handleLeave = () => {
    hoverRef.current = false;
    applyBlob();
  };

  const eyeSize = Math.round(size * EYE_SIZE_RATIO);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative flex shrink-0 cursor-pointer items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        ref={blobRef}
        aria-hidden
        className="animate-coach-idle motion-reduce:animate-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, var(--color-coach-blob-1) 0%, var(--color-coach-blob-2) 55%, var(--color-coach-blob-3) 100%)",
          boxShadow: "var(--coach-glow)",
          transition:
            "transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.8s ease-out",
        }}
      />
      <div
        ref={eyeRef}
        aria-hidden
        className="relative"
        style={{
          width: eyeSize,
          height: eyeSize,
          transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div
          className="animate-coach-blink motion-reduce:animate-none h-full w-full rounded-full"
          style={{
            background: "var(--color-coach-eye)",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
          }}
        />
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
      <CoachAvatar />
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
