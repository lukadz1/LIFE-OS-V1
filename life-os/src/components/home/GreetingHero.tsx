import { useEffect, useRef } from "react";

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

// ===== Icosahedron gem =====
// A low-poly d20 gem built from 20 triangular CSS faces. The solid is
// oriented so one face looks straight at the viewer (hexagonal silhouette),
// then the spin-orb animation slowly tumbles the whole thing.
// Coordinates follow CSS 3D conventions: x → right, y → down, z → viewer.

type Vec3 = [number, number, number];

const GEM_R = 50; // circumradius: center → vertex (px)
const PHI = (1 + Math.sqrt(5)) / 2;

// The 12 vertices of an icosahedron: three orthogonal golden rectangles.
const RAW_VERTS: Vec3[] = [
  [-1, PHI, 0],
  [1, PHI, 0],
  [-1, -PHI, 0],
  [1, -PHI, 0],
  [0, -1, PHI],
  [0, 1, PHI],
  [0, -1, -PHI],
  [0, 1, -PHI],
  [PHI, 0, -1],
  [PHI, 0, 1],
  [-PHI, 0, -1],
  [-PHI, 0, 1],
];

const RAW_FACES: [number, number, number][] = [
  [0, 11, 5],
  [0, 5, 1],
  [0, 1, 7],
  [0, 7, 10],
  [0, 10, 11],
  [1, 5, 9],
  [5, 11, 4],
  [11, 10, 2],
  [10, 7, 6],
  [7, 1, 8],
  [3, 9, 4],
  [3, 4, 2],
  [3, 2, 6],
  [3, 6, 8],
  [3, 8, 9],
  [4, 9, 5],
  [2, 4, 11],
  [6, 2, 10],
  [8, 6, 7],
  [9, 8, 1],
];

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Rotate point p around unit axis u by angle th (Rodrigues' formula). */
function rot(p: Vec3, u: Vec3, th: number): Vec3 {
  const c = Math.cos(th);
  const s = Math.sin(th);
  const d = dot(u, p) * (1 - c);
  const cr = cross(u, p);
  return [
    p[0] * c + cr[0] * s + u[0] * d,
    p[1] * c + cr[1] * s + u[1] * d,
    p[2] * c + cr[2] * s + u[2] * d,
  ];
}

// Canonical face: flat top edge, apex pointing down, in an edge × height box.
const TRI_CLIP = "polygon(0% 0%, 100% 0%, 50% 100%)";

// Soft studio light from the upper right, in front of the gem.
const LIGHT = norm([0.45, -0.55, 0.7]);
const FACE_DARK = [240, 120, 24]; // #f07818 — facets turned away
const FACE_LIGHT = [255, 240, 226]; // #fff0e2 — facets catching the light
const EDGE_TINT = "rgba(255, 245, 236, 0.9)"; // frosted edge lines

function buildFacets() {
  let verts = RAW_VERTS.map((v) => {
    const u = norm(v);
    return [u[0] * GEM_R, u[1] * GEM_R, u[2] * GEM_R] as Vec3;
  });

  const faceCentroid = (f: readonly [number, number, number]): Vec3 => [
    (verts[f[0]][0] + verts[f[1]][0] + verts[f[2]][0]) / 3,
    (verts[f[0]][1] + verts[f[1]][1] + verts[f[2]][1]) / 3,
    (verts[f[0]][2] + verts[f[1]][2] + verts[f[2]][2]) / 3,
  ];

  // 1) Rotate the whole solid so face 0 points straight at the viewer
  //    (for a regular solid the face normal is the centroid direction).
  const front = RAW_FACES[0];
  const n0 = norm(faceCentroid(front));
  const axis = cross(n0, [0, 0, 1]);
  const axisLen = Math.hypot(axis[0], axis[1], axis[2]);
  if (axisLen > 1e-6) {
    const u: Vec3 = [axis[0] / axisLen, axis[1] / axisLen, axis[2] / axisLen];
    const th = Math.acos(Math.min(1, Math.max(-1, dot(n0, [0, 0, 1]))));
    verts = verts.map((p) => rot(p, u, th));
  }

  // 2) Spin in-plane so one vertex of the front face points screen-down,
  //    giving the apex-down central triangle from the reference clip.
  const c = faceCentroid(front);
  const apex = verts[front[2]];
  const delta = Math.PI / 2 - Math.atan2(apex[1] - c[1], apex[0] - c[0]);
  verts = verts.map((p) => rot(p, [0, 0, 1], delta));

  const e0 = sub(verts[front[1]], verts[front[0]]);
  const edgePx = Math.hypot(e0[0], e0[1], e0[2]);
  const triH = (edgePx * Math.sqrt(3)) / 2;

  const facets = RAW_FACES.map((f) => {
    let A = verts[f[0]];
    let B = verts[f[1]];
    let C = verts[f[2]];
    const centroid: Vec3 = [
      (A[0] + B[0] + C[0]) / 3,
      (A[1] + B[1] + C[1]) / 3,
      (A[2] + B[2] + C[2]) / 3,
    ];
    // Outward winding so CSS backface culling hides the gem's far side.
    if (dot(cross(sub(B, A), sub(C, A)), centroid) < 0) [B, C] = [C, B];

    const U = sub(B, A);
    const V = sub(C, A);
    const n = norm(cross(U, V));
    // Affine map: canonical triangle (0,0) → A, (e,0) → B, (e/2,h) → C.
    const X: Vec3 = [U[0] / edgePx, U[1] / edgePx, U[2] / edgePx];
    const Y: Vec3 = [
      (V[0] - U[0] / 2) / triH,
      (V[1] - U[1] / 2) / triH,
      (V[2] - U[2] / 2) / triH,
    ];

    // Baked Lambert shading toward the pastel highlight.
    const t = Math.max(0, dot(n, LIGHT)) ** 0.7;
    const ch = (i: number) =>
      Math.round(FACE_DARK[i] + (FACE_LIGHT[i] - FACE_DARK[i]) * t);
    const fill = `rgba(${ch(0)}, ${ch(1)}, ${ch(2)}, 0.94)`;

    const transform = `matrix3d(${X[0]},${X[1]},${X[2]},0,${Y[0]},${Y[1]},${Y[2]},0,${n[0]},${n[1]},${n[2]},0,${A[0]},${A[1]},${A[2]},1)`;

    return { transform, fill };
  });

  return { facets, edgePx, triH };
}

const { facets: FACETS, edgePx: EDGE_PX, triH: TRI_H } = buildFacets();

// How far the orb drifts toward the cursor, in px/deg at the edge of the
// tracking radius. Kept small so it reads as "alive", not distracting.
const MAX_SHIFT_PX = 10;
const MAX_TILT_DEG = 6;
const TRACK_RADIUS_PX = 480;

/** A 3D icosahedron gem built from CSS faces, slowly tumbling in place. */
function GemAvatar({ size = 132 }: { size?: number }) {
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
          perspective: 700,
          filter: "drop-shadow(0 12px 22px rgba(251,86,7,0.4))",
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
          {FACETS.map((facet, i) => (
            <div
              key={`facet-${i}`}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: EDGE_PX,
                height: TRI_H,
                transformOrigin: "0 0",
                transform: facet.transform,
                clipPath: TRI_CLIP,
                background: EDGE_TINT,
                backfaceVisibility: "hidden",
              }}
            >
              {/* Inset copy of the triangle so the outer tint reads as a
                  thin frosted edge line, like the reference gem. */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: TRI_CLIP,
                  transform: "scale(0.94)",
                  transformOrigin: "50% 33.34%",
                  background: facet.fill,
                }}
              />
            </div>
          ))}
        </div>

        {/* "L" badge — stays facing the viewer while the gem tumbles */}
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
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: size * 0.34,
              lineHeight: 1,
              color: "#fff7f0",
              textShadow: "0 0 12px rgba(255, 214, 178, 0.9)",
              filter: "drop-shadow(0 1px 3px rgba(38,21,10,0.55))",
            }}
          >
            L
          </span>
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
