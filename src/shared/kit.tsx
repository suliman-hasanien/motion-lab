import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {BODY, GREEN, HEAD, INK, MUTED, PAPER, PAPER_2, RED} from "./theme";

export const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INOUT = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 eased progress of an animation that starts at `at` and lasts `dur` frames. */
export const prog = (f: number, at: number, dur: number, ease = OUT) => interpolate(f, [at, at + dur], [0, 1], {...clamp, easing: ease});
export const progIO = (f: number, at: number, dur: number) => prog(f, at, dur, INOUT);
/** Overshoot pop (back-out) for scale-ins. */
export const pop = (f: number, at: number, dur = 16) => prog(f, at, dur, Easing.bezier(0.34, 1.56, 0.64, 1));
/** Fade-out multiplier: 1 until `at`, then to 0 over `dur`. */
export const leave = (f: number, at: number, dur = 10) => 1 - prog(f, at, dur, INOUT);

type WordsProps = {
  text: string;
  at: number;
  stagger?: number;
  size?: number;
  weight?: number;
  color?: string;
  font?: string;
  hi?: Record<string, string>;
  out?: number;
  lineHeight?: number;
  style?: React.CSSProperties;
  mode?: "rise" | "drop" | "scale";
};

/** Arabic per-word motion type: each word rises in with a blur, optionally coloured. */
export const Words: React.FC<WordsProps> = ({text, at, stagger = 3, size = 72, weight = 700, color = INK, font = HEAD, hi = {}, out, lineHeight = 1.35, style, mode = "rise"}) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const o = out === undefined ? 1 : leave(f, out, 10);
  return (
    <div style={{direction: "rtl", textAlign: "center", fontFamily: font, fontWeight: weight, fontSize: size, lineHeight, color, opacity: o, ...style}}>
      {words.map((w, i) => {
        const p = prog(f, at + i * stagger, 16);
        const key = w.replace(/[،.:]/g, "");
        const t = mode === "rise" ? `translateY(${(1 - p) * size * 0.6}px)` : mode === "drop" ? `translateY(${-(1 - p) * size * 0.6}px)` : `scale(${0.6 + 0.4 * pop(f, at + i * stagger, 16)})`;
        return (
          <span key={i} style={{display: "inline-block", opacity: p, transform: t, filter: `blur(${(1 - p) * 10}px)`, color: hi[key] ?? undefined, marginInline: size * 0.13}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Tapered brush stroke (like the logo swooshes) drawn from start to end with progress p. */
export const Swoosh: React.FC<{x1: number; y1: number; x2: number; y2: number; bend?: number; width?: number; color: string; p: number; tail?: number; style?: React.CSSProperties}> = ({x1, y1, x2, y2, bend = -60, width = 18, color, p, tail = 0, style}) => {
  const N = 48;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const cx = mx + nx * bend, cy = my + ny * bend;
  const pt = (t: number) => [(1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2];
  const t0 = Math.max(0, tail), t1 = Math.max(t0, p);
  if (t1 - t0 < 0.002) return null;
  const left: number[][] = [], right: number[][] = [];
  for (let i = 0; i <= N; i++) {
    const t = t0 + ((t1 - t0) * i) / N;
    const [x, y] = pt(t);
    const [xa, ya] = pt(Math.min(1, t + 0.01));
    const [xb, yb] = pt(Math.max(0, t - 0.01));
    const tl = Math.hypot(xa - xb, ya - yb) || 1;
    const ux = -(ya - yb) / tl, uy = (xa - xb) / tl;
    const wv = (width / 2) * Math.pow(Math.sin(Math.PI * t), 0.6);
    left.push([x + ux * wv, y + uy * wv]);
    right.push([x - ux * wv, y - uy * wv]);
  }
  const d = "M" + [...left, ...right.reverse()].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L") + "Z";
  return (
    <svg width={1080} height={1920} style={{position: "absolute", left: 0, top: 0, overflow: "visible", ...style}}>
      <path d={d} fill={color} />
    </svg>
  );
};

/** The brand mark: red + green swoosh pair under a centre point. */
export const SwooshPair: React.FC<{cx: number; cy: number; w: number; p: number; tail?: number}> = ({cx, cy, w, p, tail = 0}) => (
  <>
    <Swoosh x1={cx + w / 2} y1={cy - w * 0.07} x2={cx - w / 2} y2={cy + w * 0.06} bend={-w * 0.03} width={w * 0.028} color={RED} p={p} tail={tail} />
    <Swoosh x1={cx + w / 2 + w * 0.04} y1={cy + w * 0.0} x2={cx - w * 0.35} y2={cy + w * 0.1} bend={-w * 0.02} width={w * 0.018} color={GREEN} p={Math.max(0, p * 1.12 - 0.12)} tail={tail} />
  </>
);

/** Background: warm paper (or ink) + drifting tatreez-like cross-stitch grid + vignette. */
export const Bg: React.FC<{dark?: boolean; tint?: string; children?: React.ReactNode}> = ({dark, tint, children}) => {
  const f = useCurrentFrame();
  const base = dark ? INK : PAPER;
  const dot = dark ? "rgba(255,255,255,0.07)" : "rgba(11,11,12,0.07)";
  const shift = (f * 0.4) % 60;
  return (
    <AbsoluteFill style={{background: base, overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${dot} 2.2px, transparent 2.6px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `${shift}px ${shift * 0.5}px`,
        }}
      />
      {tint && <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% 45%, ${tint} 0%, transparent 70%)`}} />}
      <AbsoluteFill style={{background: dark ? "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)" : `radial-gradient(ellipse at center, transparent 55%, ${PAPER_2} 100%)`}} />
      {children}
    </AbsoluteFill>
  );
};

/** Slow push-in camera for a whole scene. */
export const Drift: React.FC<{dur: number; from?: number; to?: number; children: React.ReactNode}> = ({dur, from = 1, to = 1.045, children}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [from, to], clamp);
  return <AbsoluteFill style={{transform: `scale(${s})`}}>{children}</AbsoluteFill>;
};

/** Section heading: small kicker number + title + animated red/green underline. */
export const Heading: React.FC<{num?: string; title: string; at?: number; y?: number; dark?: boolean; size?: number; out?: number}> = ({num, title, at = 0, y = 300, dark, size = 76, out}) => {
  const f = useCurrentFrame();
  const o = out === undefined ? 1 : leave(f, out, 10);
  const lp = progIO(f, at + 8, 22);
  return (
    <div style={{position: "absolute", top: y, left: 0, right: 0, opacity: o}}>
      {num && (
        <div style={{textAlign: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: RED, opacity: prog(f, at, 12), transform: `translateY(${(1 - prog(f, at, 12)) * 20}px)`}}>
          {num}
        </div>
      )}
      <Words text={title} at={at + 3} size={size} weight={800} color={dark ? "#fff" : INK} stagger={4} lineHeight={1.3} style={{padding: "10px 70px 0"}} />
      <div style={{display: "flex", justifyContent: "center", gap: 14, marginTop: 22}}>
        <div style={{height: 9, width: 170 * lp, background: GREEN, borderRadius: 9}} />
        <div style={{height: 9, width: 110 * lp, background: RED, borderRadius: 9}} />
      </div>
    </div>
  );
};

/** Rounded content card that slides/pops in. */
export const Card: React.FC<{at: number; x: number; y: number; w: number; h: number; dark?: boolean; accent?: string; from?: "right" | "left" | "up"; children: React.ReactNode; style?: React.CSSProperties}> = ({at, x, y, w, h, dark, accent = RED, from = "right", children, style}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 20);
  const dx = from === "right" ? 140 : from === "left" ? -140 : 0;
  const dy = from === "up" ? 120 : 0;
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 30,
        background: dark ? "rgba(255,255,255,0.06)" : "#fff",
        border: dark ? "1.5px solid rgba(255,255,255,0.12)" : "1.5px solid rgba(11,11,12,0.06)",
        boxShadow: dark ? "none" : "0 18px 50px rgba(40,30,10,0.10)",
        opacity: p, transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px) scale(${0.94 + 0.06 * p})`,
        overflow: "hidden", ...style,
      }}
    >
      <div style={{position: "absolute", right: 0, top: 0, bottom: 0, width: 10, background: accent, transform: `scaleY(${prog(f, at + 8, 18)})`, transformOrigin: "top"}} />
      {children}
    </div>
  );
};

export const Body: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 40, color = MUTED, style}) => (
  <div style={{direction: "rtl", fontFamily: BODY, fontWeight: 500, fontSize: size, lineHeight: 1.5, color, ...style}}>{children}</div>
);

/** Masked line reveal (text slides up from behind a mask). */
export const Reveal: React.FC<{at: number; children: React.ReactNode; dur?: number; style?: React.CSSProperties}> = ({at, children, dur = 18, style}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur);
  return (
    <div style={{overflow: "hidden", ...style}}>
      <div style={{transform: `translateY(${(1 - p) * 110}%)`}}>{children}</div>
    </div>
  );
};

/** Glow sweep across an element (light pass). */
export const Sheen: React.FC<{at: number; dur?: number; color?: string}> = ({at, dur = 26, color = "rgba(255,255,255,0.55)"}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [-0.4, 1.4], clamp);
  if (p <= -0.4 || p >= 1.4) return null;
  return <AbsoluteFill style={{background: `linear-gradient(105deg, transparent ${(p - 0.15) * 100}%, ${color} ${p * 100}%, transparent ${(p + 0.15) * 100}%)`, mixBlendMode: "overlay", pointerEvents: "none"}} />;
};

export {RED, GREEN, INK, PAPER, MUTED};
