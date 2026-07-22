import { useEffect, useRef } from "react";

const SPACING = 26;
const BASE_RADIUS = 1.1;
const MAX_RADIUS = 3.4;
const GLOW_RADIUS = 170;
const EASE = 0.02;
const MIN_PAUSE_MS = 2200;
const MAX_PAUSE_MS = 4800;

/** Full-viewport dot grid whose dots grow and brighten near a glow that
 * wanders the screen on its own — picks a new random resting point every
 * few seconds and eases toward it, rather than following the cursor. */
export function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const focal = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let raf = 0;
    let pauseTimer = 0;

    const pickTarget = () => {
      target.x = width * (0.15 + Math.random() * 0.7);
      target.y = height * (0.15 + Math.random() * 0.7);
      window.clearTimeout(pauseTimer);
      pauseTimer = window.setTimeout(
        pickTarget,
        MIN_PAUSE_MS + Math.random() * (MAX_PAUSE_MS - MIN_PAUSE_MS),
      );
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const isDark = () => document.documentElement.dataset.theme !== "light";

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const dark = isDark();
      const dotColor = dark ? "255, 255, 255" : "20, 20, 22";
      const baseOpacity = dark ? 0.05 : 0.06;
      const glowOpacity = dark ? 0.55 : 0.4;

      const cols = Math.ceil(width / SPACING);
      const rows = Math.ceil(height / SPACING);

      for (let row = 0; row <= rows; row++) {
        const y = row * SPACING;
        for (let col = 0; col <= cols; col++) {
          const x = col * SPACING;
          const dx = x - focal.x;
          const dy = y - focal.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t = Math.max(0, 1 - dist / GLOW_RADIUS);
          const eased = t * t * (3 - 2 * t);
          const radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * eased;
          const opacity = baseOpacity + glowOpacity * eased;

          ctx.beginPath();
          ctx.fillStyle = `rgba(${dotColor}, ${opacity})`;
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const draw = () => {
      focal.x += (target.x - focal.x) * EASE;
      focal.y += (target.y - focal.y) * EASE;
      render();
      raf = requestAnimationFrame(draw);
    };

    resize();
    focal.x = target.x = width / 2;
    focal.y = target.y = height / 2;
    pickTarget();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(pauseTimer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[-1]"
      aria-hidden="true"
    />
  );
}
