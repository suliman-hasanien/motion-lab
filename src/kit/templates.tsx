/**
 * Arabic Motion Kit — reusable Remotion templates. Every template is one React component
 * driven by props + a small colour theme, so a client's brand is a single object swap.
 */
import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {DrawIcon} from "../shared/icons";
import {clamp, pop, prog, progIO, Words} from "../shared/kit";
import {BODY, HEAD} from "../shared/theme";

export type KitTheme = {bg: string; bg2: string; fg: string; muted: string; accent: string; accent2: string};
export const THEMES: Record<string, KitTheme> = {
  coral: {bg: "#111014", bg2: "#1D1B22", fg: "#F5F1EA", muted: "#A9A39A", accent: "#FF5A36", accent2: "#2FBF71"},
  sand: {bg: "#F4EEE3", bg2: "#E7DDCB", fg: "#1D1A16", muted: "#6E665A", accent: "#B5532C", accent2: "#2E6E5A"},
  ocean: {bg: "#0B1F33", bg2: "#12304D", fg: "#EEF5FB", muted: "#93A9BE", accent: "#36C2FF", accent2: "#FFC94A"},
};

/** Abstract animated backdrop so templates read as "over footage" without needing footage. */
export const KitBackdrop: React.FC<{t: KitTheme}> = ({t}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: t.bg, overflow: "hidden"}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: "absolute", width: 900, height: 900, borderRadius: 900, left: -200 + i * 380 + 60 * Math.sin(f / (50 + i * 13)), top: 200 + i * 420 + 50 * Math.cos(f / (60 + i * 7)), background: [t.accent, t.accent2, t.bg2][i], opacity: i === 2 ? 0.9 : 0.16, filter: "blur(120px)"}} />
      ))}
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${t.fg}14 1.6px, transparent 2px)`, backgroundSize: "44px 44px"}} />
    </AbsoluteFill>
  );
};

/** 01 — Title card: masked line reveal + accent bar. */
export const TitleCard: React.FC<{t: KitTheme; kicker: string; title: string; sub?: string; at?: number}> = ({t, kicker, title, sub, at = 0}) => {
  const f = useCurrentFrame();
  const bar = progIO(f, at, 18);
  const rev = prog(f, at + 8, 24);
  return (
    <div style={{position: "absolute", top: 700, left: 90, right: 90, direction: "rtl"}}>
      <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 26}}>
        <div style={{height: 10, width: 120 * bar, background: t.accent, borderRadius: 10}} />
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: t.accent, opacity: prog(f, at + 6, 12)}}>{kicker}</div>
      </div>
      <div style={{overflow: "hidden"}}>
        <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 130, lineHeight: 1.15, color: t.fg, transform: `translateY(${(1 - rev) * 105}%)`}}>{title}</div>
      </div>
      {sub && <div style={{fontFamily: BODY, fontWeight: 500, fontSize: 44, color: t.muted, marginTop: 20, opacity: prog(f, at + 26, 14), transform: `translateY(${(1 - prog(f, at + 26, 16)) * 20}px)`}}>{sub}</div>}
    </div>
  );
};

/** 02 — Lower third: name + role on a two-layer bar that wipes in from the right (RTL). */
export const LowerThird: React.FC<{t: KitTheme; name: string; role: string; at?: number; y?: number; out?: number}> = ({t, name, role, at = 0, y = 1380, out}) => {
  const f = useCurrentFrame();
  const a = progIO(f, at, 16);
  const b = progIO(f, at + 6, 16);
  const o = out === undefined ? 1 : 1 - progIO(f, out, 12);
  return (
    <div style={{position: "absolute", right: 70, top: y, direction: "rtl", opacity: o, transform: `translateX(${(1 - o) * 60}px)`}}>
      <div style={{display: "inline-block", background: t.accent, clipPath: `inset(0 0 0 ${(1 - a) * 100}%)`, borderRadius: "18px 18px 18px 0", padding: "18px 36px"}}>
        <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 62, color: "#fff", whiteSpace: "nowrap", opacity: prog(f, at + 8, 10)}}>{name}</div>
      </div>
      <div />
      <div style={{display: "inline-block", background: t.fg, clipPath: `inset(0 0 0 ${(1 - b) * 100}%)`, borderRadius: "0 0 16px 16px", padding: "12px 30px", marginRight: 0}}>
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 38, color: t.bg, whiteSpace: "nowrap", opacity: prog(f, at + 14, 10)}}>{role}</div>
      </div>
    </div>
  );
};

/** 03 — Stat counter: number counts up inside a progress ring. */
export const StatCounter: React.FC<{t: KitTheme; value: number; prefix?: string; suffix?: string; label: string; at?: number}> = ({t, value, prefix = "", suffix = "", label, at = 0}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 45], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const R = 300;
  return (
    <div style={{position: "absolute", left: 0, right: 0, top: 500, display: "flex", flexDirection: "column", alignItems: "center"}}>
      <div style={{position: "relative", width: 2 * R + 40, height: 2 * R + 40}}>
        <svg width={2 * R + 40} height={2 * R + 40} style={{position: "absolute", inset: 0}}>
          <circle cx={R + 20} cy={R + 20} r={R} fill="none" stroke={t.bg2} strokeWidth={22} />
          <circle cx={R + 20} cy={R + 20} r={R} fill="none" stroke={t.accent} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p * 0.86} transform={`rotate(-90 ${R + 20} ${R + 20})`} />
        </svg>
        <div style={{position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 190, color: t.fg, direction: "ltr"}}>
          {prefix}{Math.round(value * p)}{suffix}
        </div>
      </div>
      <Words text={label} at={at + 30} size={64} weight={700} color={t.muted} style={{marginTop: 40}} />
    </div>
  );
};

/** 04 — Quote card. */
export const QuoteCard: React.FC<{t: KitTheme; quote: string; by: string; at?: number}> = ({t, quote, by, at = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: "absolute", top: 560, left: 90, right: 90, direction: "rtl"}}>
      <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 300, lineHeight: 0.6, color: t.accent, transform: `scale(${pop(f, at, 18)})`, transformOrigin: "right top", height: 150}}>”</div>
      <Words text={quote} at={at + 8} size={92} weight={800} color={t.fg} stagger={4} lineHeight={1.35} style={{textAlign: "right"}} />
      <div style={{display: "flex", alignItems: "center", gap: 18, marginTop: 40, opacity: prog(f, at + 40, 14)}}>
        <div style={{width: 60 * progIO(f, at + 38, 16), height: 6, background: t.accent2, borderRadius: 6}} />
        <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 42, color: t.muted}}>{by}</div>
      </div>
    </div>
  );
};

/** 05 — Social CTA: follow button gets "pressed" by a cursor tap. */
export const SocialCTA: React.FC<{t: KitTheme; handle: string; at?: number}> = ({t, handle, at = 0}) => {
  const f = useCurrentFrame();
  const tap = at + 34;
  const pressed = f >= tap + 4;
  const press = 1 - 0.08 * Math.max(0, 1 - Math.abs(f - tap - 3) / 4);
  const cx = interpolate(f, [at + 10, tap], [860, 600], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const cy = interpolate(f, [at + 10, tap], [1500, 1150], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  return (
    <>
      <div style={{position: "absolute", top: 640, left: 0, right: 0, textAlign: "center"}}>
        <div style={{width: 230, height: 230, borderRadius: 230, margin: "0 auto", background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, padding: 8, transform: `scale(${pop(f, at, 18)})`}}>
          <div style={{width: "100%", height: "100%", borderRadius: 230, background: t.bg2, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <DrawIcon name="people" at={at + 6} size={120} color={t.fg} />
          </div>
        </div>
        <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: t.fg, marginTop: 30, direction: "ltr", opacity: prog(f, at + 8, 12)}}>{handle}</div>
        <div style={{display: "inline-block", marginTop: 46, transform: `scale(${press * pop(f, at + 14, 16)})`, background: pressed ? t.bg2 : t.accent, border: `3px solid ${t.accent}`, borderRadius: 99, padding: "22px 80px", fontFamily: HEAD, fontWeight: 800, fontSize: 54, color: pressed ? t.accent : "#fff", direction: "rtl"}}>
          {pressed ? "✓ متابَع" : "تابعنا"}
        </div>
        {pressed && (
          <svg width={1080} height={400} style={{position: "absolute", left: 0, top: 380}}>
            {Array.from({length: 12}, (_, i) => {
              const a = (i / 12) * Math.PI * 2, r = 80 + 160 * prog(f, tap + 4, 20);
              return <circle key={i} cx={540 + Math.cos(a) * r * 1.6} cy={200 + Math.sin(a) * r * 0.7} r={9 * (1 - prog(f, tap + 10, 16))} fill={i % 2 ? t.accent : t.accent2} />;
            })}
          </svg>
        )}
      </div>
      <svg width={80} height={80} viewBox="0 0 24 24" style={{position: "absolute", left: cx, top: cy, opacity: prog(f, at + 10, 8) * (1 - prog(f, tap + 16, 10)), filter: "drop-shadow(0 4px 8px rgba(0,0,0,.4))"}}>
        <path d="M5 3l13 7-6 2-2 6z" fill="#fff" stroke="#000" strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** 06 — Offer badge: starburst with percentage + struck old price. */
export const OfferBadge: React.FC<{t: KitTheme; pct: number; title: string; oldPrice: string; newPrice: string; at?: number}> = ({t, pct, title, oldPrice, newPrice, at = 0}) => {
  const f = useCurrentFrame();
  const N = 18, R1 = 300, R2 = 250;
  const pts = Array.from({length: N * 2}, (_, i) => {
    const r = i % 2 ? R2 : R1, a = (i / (N * 2)) * Math.PI * 2 + f / 90;
    return `${340 + Math.cos(a) * r},${340 + Math.sin(a) * r}`;
  }).join(" ");
  const strike = progIO(f, at + 34, 12);
  return (
    <div style={{position: "absolute", top: 380, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center"}}>
      <div style={{position: "relative", width: 680, height: 680, transform: `scale(${pop(f, at, 22)}) rotate(${(1 - prog(f, at, 24)) * -40}deg)`}}>
        <svg width={680} height={680} style={{position: "absolute", inset: 0}}><polygon points={pts} fill={t.accent} /></svg>
        <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", direction: "rtl"}}>
          <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 64}}>خصم</div>
          <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 190, lineHeight: 1, direction: "ltr"}}>{Math.round(pct * prog(f, at + 6, 24))}%</div>
        </div>
      </div>
      <Words text={title} at={at + 22} size={70} weight={800} color={t.fg} style={{marginTop: 30}} />
      <div style={{display: "flex", gap: 40, alignItems: "center", marginTop: 26, direction: "rtl"}}>
        <div style={{position: "relative", fontFamily: HEAD, fontWeight: 700, fontSize: 60, color: t.muted, opacity: prog(f, at + 28, 10)}}>
          {oldPrice}
          <div style={{position: "absolute", left: -10, right: -10, top: "50%", height: 8, background: t.accent, transform: `scaleX(${strike}) rotate(-8deg)`, borderRadius: 8}} />
        </div>
        <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 96, color: t.accent2, transform: `scale(${pop(f, at + 44, 16)})`}}>{newPrice}</div>
      </div>
    </div>
  );
};
