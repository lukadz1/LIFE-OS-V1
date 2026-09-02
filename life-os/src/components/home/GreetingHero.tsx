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

// ===== Coach ("bolb") =====
// A soft, glowing orange blob with a wide rounded head that tapers to a
// short rounded chin, and two slanted white crescent eyes. Paint order is
// glow -> chin -> head -> eyes; the chin+head group shares one blur so they
// fuse into a single soft silhouette instead of reading as two shapes.
// Design box is a fixed 340x400 — per the source spec, everything is scaled
// uniformly via `transform: scale()` rather than restyled per instance, so
// the tuned offsets/radii stay exact at any rendered size.
//
// Idle motion carries over from the original blob: the head breathes via an
// asymmetric border-radius wobble and the eyes blink together on their own
// cadence, no floating. Cursor lean/hover grow is layered underneath.

const DESIGN_W = 340;
const DESIGN_H = 400;
const REACT_RADIUS_PX = 260; // blob leans/grows within this cursor distance
const LEAN_PX = 4;
const STRETCH = 0.12;
const HOVER_BOOST = 0.05;

function CoachAvatar({ size = 72 }: { size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leanRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const hoverRef = useRef(false);

  const scale = size / DESIGN_H;

  const updateCenter = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    centerRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  // Mutate the DOM directly rather than via React state so mousemove ticks
  // don't trigger a re-render per frame.
  const applyLean = useCallback(() => {
    const lean = leanRef.current;
    if (!lean) return;
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
        stretch = t * STRETCH;
        const magnitude = t * LEAN_PX;
        leanX = (dx / dist) * magnitude;
        leanY = (dy / dist) * magnitude;
      }
    }
    const hoverBoost = hoverRef.current ? HOVER_BOOST : 0;
    lean.style.transform = `translate(${leanX}px, ${leanY}px) scale(${scale * (1 + stretch + hoverBoost)})`;
  }, [scale]);

  useEffect(() => {
    updateCenter();
    applyLean();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMove(e: PointerEvent) {
      updateCenter();
      mouseRef.current = { x: e.clientX, y: e.clientY };
      applyLean();
    }
    function handleResize() {
      updateCenter();
      applyLean();
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateCenter, applyLean]);

  const handleEnter = () => {
    hoverRef.current = true;
    applyLean();
  };
  const handleLeave = () => {
    hoverRef.current = false;
    applyLean();
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative shrink-0 cursor-pointer"
      style={{ width: DESIGN_W * scale, height: DESIGN_H * scale }}
    >
      <div
        ref={leanRef}
        aria-hidden
        className="absolute top-0 left-0"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          transition: "transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Glow */}
        <div
          aria-hidden
          className="absolute rounded-full"
          style={{
            left: 20,
            top: 50,
            width: 300,
            height: 300,
            opacity: 0.7,
            background:
              "radial-gradient(circle, rgba(255,140,60,.75) 0%, rgba(255,90,40,0) 68%)",
            filter: "blur(30px)",
          }}
        />

        {/* Body group: chin drawn first, head on top hides its upper corners.
            Blurring the group (not each shape) fuses them into one silhouette.
            The head itself carries the old blob's organic border-radius
            wobble so it still breathes without floating. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ filter: "blur(6px)" }}
        >
          <div
            aria-hidden
            className="absolute"
            style={{
              left: 113,
              top: 186,
              width: 114,
              height: 114,
              transform: "rotate(45deg)",
              borderRadius: "50% 50% 30% 50%",
              background:
                "radial-gradient(85% 85% at 18% 18%, #ff9a52 0%, #f4712b 58%, #e05c1f 100%)",
            }}
          />
          <div
            aria-hidden
            className="animate-bolb-idle motion-reduce:animate-none absolute"
            style={{
              left: 26,
              top: 48,
              width: 288,
              height: 311,
              background:
                "radial-gradient(62% 58% at 42% 28%, #fff0dc 0%, #ffbe86 32%, #ff8c42 64%, #f4712b 100%)",
            }}
          />
        </div>

        {/* Eyes: slanted crescent slits, angled down toward the center, blinking
            together on the old blob's cadence. */}
        <div
          aria-hidden
          className="animate-bolb-blink motion-reduce:animate-none absolute flex justify-between"
          style={{
            left: 74,
            top: 140,
            width: 192,
            height: 60,
            filter: "blur(1.2px)",
          }}
        >
          <div
            aria-hidden
            style={{
              width: 78,
              height: 30,
              background: "#fdfaf7",
              borderRadius: "80% 24% 40% 60% / 92% 88% 14% 10%",
              transform: "rotate(17deg)",
            }}
          />
          <div
            aria-hidden
            style={{
              width: 78,
              height: 30,
              background: "#fdfaf7",
              borderRadius: "24% 80% 60% 40% / 88% 92% 10% 14%",
              transform: "rotate(-17deg)",
            }}
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
