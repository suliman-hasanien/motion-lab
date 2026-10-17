import React from "react";
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {SceneTrack} from "../shared/transitions";
import {DrawIcon, ICONS} from "../shared/icons";
import {clamp, leave, pop, prog, progIO, Words} from "../shared/kit";
import {BAR, BEAT, BODY, buildScenes, HEAD, useFonts} from "../shared/theme";
import TL from "./timeline.json";

// Jard brand (from the app's website CSS + icon): navy, blue, gold.
const NAVY = "#0F2240";
const BRAND = "#17325A";
const BLUE = "#2C5C9C";
const GOLD = "#D2A445";
const SOFT = "#E8EEF7";
const OK = "#1F7A4D";
const BAD = "#C2413F";

Object.assign(ICONS, {
  notebook: ["M12 6h22a4 4 0 0 1 4 4v30H16a4 4 0 0 1-4-4z", "M12 36a4 4 0 0 1 4-4h22", "M18 14h14", "M18 20h14", "M18 26h8"],
  wifiOff: ["M6 18a26 26 0 0 1 36 0", "M12 25a17 17 0 0 1 24 0", "M18 32a8 8 0 0 1 12 0", "M24 39h0.01", "M8 8l32 32"],
  backup: ["M24 6c9 0 16 3 16 7s-7 7-16 7-16-3-16-7 7-7 16-7z", "M8 13v10c0 4 7 7 16 7", "M8 23v10c0 4 7 7 16 7", "M40 13v8", "M34 34a7 7 0 1 0 2-5", "M36 24v5h-5"],
  sheet: ["M8 8h32v32H8z", "M8 18h32", "M8 28h32", "M20 8v32", "M30 8v32"],
  printer: ["M14 18V6h20v12", "M8 18h32v16h-6", "M14 34H8", "M14 28h20v14H14z", "M34 23h0.01"],
  users: ["M18 18a6 6 0 1 0 0.01 0z", "M6 40c0-7 5-12 12-12s12 5 12 12", "M32 14a5 5 0 1 1 0 10", "M34 28c5 1 8 5 8 12"],
  barcode: ["M8 10v28", "M13 10v28", "M17 10v28", "M23 10v28", "M27 10v28", "M33 10v28", "M36 10v28", "M40 10v28"],
  chat: ["M8 10h32v22H20l-8 7v-7H8z", "M16 19h16", "M16 25h10"],
  cross: ["M12 12l24 24", "M36 12L12 36"],
});

const SC = buildScenes(TL.scenes);
export const JARD_TOTAL = SC.reduce((a, s) => a + s.dur, 0);

/** Persistent background: navy gradient, slow blueprint grid, soft gold glow. */
const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const sh = (f * 0.6) % 80;
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, ${BRAND} 0%, ${NAVY} 60%, #0A1830 100%)`}}>
      <AbsoluteFill style={{backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.045) 1.5px, transparent 1.5px)", backgroundSize: "80px 80px", backgroundPosition: `0 ${sh}px`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 40% at 50% ${42 + 6 * Math.sin(f / 60)}%, rgba(210,164,69,0.16), transparent 70%)`}} />
      <AbsoluteFill style={{background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)"}} />
    </AbsoluteFill>
  );
};

const At: React.FC<{y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, children, style}) => (
  <div style={{position: "absolute", top: y, left: 0, right: 0, ...style}}>{children}</div>
);

const Kicker: React.FC<{text: string; at: number; color?: string}> = ({text, at, color = GOLD}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 14);
  return (
    <div style={{display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{direction: "rtl", fontFamily: HEAD, fontWeight: 700, fontSize: 30, color, border: `2px solid ${color}`, borderRadius: 99, padding: "8px 24px", letterSpacing: 1}}>{text}</div>
    </div>
  );
};

/** App screenshot inside a desktop-monitor frame, with a slow push toward a focus point and an optional highlight box. */
const Screen: React.FC<{src: string; at: number; y?: number; focus?: [number, number]; zoom?: number; hi?: [number, number, number, number]; hiAt?: number; label?: string; dur: number}> = ({src, at, y = 700, focus = [0.5, 0.5], zoom = 1.5, hi, hiAt = 40, label, dur}) => {
  const f = useCurrentFrame();
  const W = 1000, Hh = (W * 720) / 1280;
  const inP = prog(f, at, 24);
  const z = interpolate(f, [at + 24, dur], [1, zoom], {...clamp, easing: (t) => t * t * (3 - 2 * t)});
  const tilt = (1 - inP) * 18;
  const hp = progIO(f, hiAt, 16);
  return (
    <div style={{position: "absolute", left: (1080 - W - 28) / 2, top: y, perspective: 1600, opacity: inP}}>
      <div style={{width: W + 28, padding: 14, borderRadius: 26, background: "linear-gradient(160deg,#2a3a55,#0c1424)", boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 0 0 1.5px rgba(255,255,255,0.12)", transform: `rotateX(${tilt}deg) translateY(${(1 - inP) * 80}px) scale(${0.92 + 0.08 * inP})`}}>
        <div style={{position: "relative", width: W, height: Hh, borderRadius: 12, overflow: "hidden", background: "#fff"}}>
          <Img src={staticFile(src)} style={{width: W, height: Hh, transform: `scale(${z})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`}} />
          {hi && (
            <div style={{position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`}}>
              <div style={{position: "absolute", left: `${hi[0] * 100}%`, top: `${hi[1] * 100}%`, width: `${(hi[2] - hi[0]) * 100}%`, height: `${(hi[3] - hi[1]) * 100}%`, border: `${4 / z}px solid ${GOLD}`, borderRadius: 10 / z, boxShadow: `0 0 0 ${2000 * hp}px rgba(8,16,32,${0.45 * hp}), 0 0 ${24 / z}px ${GOLD}`, opacity: hp, transform: `scale(${1.15 - 0.15 * hp})`}} />
            </div>
          )}
        </div>
        <div style={{position: "absolute", left: "50%", bottom: -70, width: 220, height: 60, transform: "translateX(-50%)", background: "linear-gradient(#1a2840,#0c1424)", clipPath: "polygon(20% 0,80% 0,100% 100%,0 100%)"}} />
      </div>
      {label && (
        <div style={{position: "absolute", top: Hh + 110, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: prog(f, hiAt + 6, 12), transform: `scale(${pop(f, hiAt + 6, 16)})`}}>
          <div style={{direction: "rtl", fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: NAVY, background: GOLD, borderRadius: 18, padding: "12px 30px"}}>{label}</div>
        </div>
      )}
    </div>
  );
};

/* 1 — hook: the paper notebook problem */
const Hook: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const pains = ["ديون ضايعة", "مخزون مش معروف", "فواتير بخط اليد"];
  return (
    <AbsoluteFill>
      <At y={430}>
        <Words text="لسّا بتحسب" at={2} size={110} weight={800} color="#fff" stagger={5} />
        <Words text="على الدفتر؟" at={10} size={130} weight={800} color={GOLD} stagger={5} mode="scale" />
      </At>
      <div style={{position: "absolute", left: 440, top: 800, opacity: prog(f, 22, 10), transform: `rotate(${-6 + 3 * Math.sin(f / 8)}deg)`}}>
        <DrawIcon name="notebook" at={22} size={200} color="#fff" stroke={2.4} />
        <div style={{position: "absolute", inset: 0}}><DrawIcon name="cross" at={2 * BEAT + 8} size={200} color={BAD} stroke={4} dur={12} /></div>
      </div>
      <At y={1120}>
        {pains.map((p, i) => {
          const at = 2 * BEAT + 14 + i * 12;
          return (
            <div key={p} style={{display: "flex", justifyContent: "center", marginBottom: 22, opacity: prog(f, at, 10), transform: `translateX(${(1 - prog(f, at, 14)) * -80}px)`}}>
              <div style={{direction: "rtl", display: "flex", alignItems: "center", gap: 16, fontFamily: HEAD, fontWeight: 700, fontSize: 54, color: "#fff", background: "rgba(194,65,63,0.18)", border: `2px solid ${BAD}`, borderRadius: 20, padding: "12px 34px"}}>
                <span style={{color: BAD, fontSize: 46}}>✕</span>{p}
              </div>
            </div>
          );
        })}
      </At>
    </AbsoluteFill>
  );
};

/* 2 — logo */
const Logo: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const s = pop(f, 6, 22);
  const ring = progIO(f, 4, 30);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: "absolute", inset: 0}}>
        <circle cx={540} cy={760} r={250} fill="none" stroke={GOLD} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90 540 760)" opacity={0.9} />
        <circle cx={540} cy={760} r={280 + 120 * prog(f, 10, 30)} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.5 * (1 - prog(f, 10, 30))} />
      </svg>
      <Img src={staticFile("jard/icon.png")} style={{position: "absolute", left: 540 - 170, top: 760 - 170, width: 340, height: 340, transform: `scale(${s})`, filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.45))"}} />
      <At y={1060}>
        <Words text="جَرْد" at={18} size={210} weight={800} color="#fff" mode="scale" />
        <div style={{textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 34, letterSpacing: `${4 + 8 * (1 - prog(f, 30, 30))}px`, color: GOLD, opacity: prog(f, 30, 14), marginTop: -10}}>SMT TECHNOLOGIES</div>
        <Words text="نظام إدارة المخزون والمبيعات والحسابات" at={44} size={44} weight={500} font={BODY} color={SOFT} stagger={3} style={{marginTop: 30, padding: "0 80px"}} />
      </At>
    </AbsoluteFill>
  );
};

/* 3–6 — feature scenes over real screenshots */
const Feature: React.FC<{dur: number; kicker: string; title: string; sub: string; children: React.ReactNode; hiWord?: Record<string, string>}> = ({kicker, title, sub, children, hiWord}) => (
  <AbsoluteFill>
    <At y={240}><Kicker text={kicker} at={0} /></At>
    <At y={330}>
      <Words text={title} at={4} size={80} weight={800} color="#fff" stagger={4} hi={hiWord} style={{padding: "0 50px"}} />
      <Words text={sub} at={16} size={42} weight={500} font={BODY} color={SOFT} stagger={2} style={{marginTop: 16, padding: "0 70px"}} />
    </At>
    {children}
  </AbsoluteFill>
);

const Pos: React.FC<{dur: number}> = ({dur}) => (
  <Feature dur={dur} kicker="01 · نقطة البيع" title="بيع سريع بالباركود" sub="امسح الصنف، والحساب بيطلع لحاله" hiWord={{"بالباركود": GOLD}}>
    <Screen src="jard/pos.jpg" at={8} dur={dur} focus={[0.86, 0.78]} zoom={1.3} hi={[0.695, 0.805, 0.985, 0.895]} hiAt={46} label="الإجمالي جاهز بثانية" />
  </Feature>
);

const Invoice: React.FC<{dur: number}> = ({dur}) => (
  <Feature dur={dur} kicker="02 · الفواتير" title="فواتير بيع وشراء ومرتجعات" sub="طباعة A4 أو حرارية، وإرسال بالواتساب">
    <Screen src="jard/invoice.jpg" at={8} dur={dur} focus={[0.2, 0.5]} zoom={1.2} />
  </Feature>
);

const Debts: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  return (
    <Feature dur={dur} kicker="03 · الديون" title="ديون الزباين بكل العملات" sub="أعمار الديون، كشف حساب، وتذكير بالواتساب">
      <Screen src="jard/debtors.jpg" at={8} dur={dur} focus={[0.5, 0.4]} zoom={1.3} hi={[0.01, 0.31, 0.99, 0.5]} hiAt={40} />
      <At y={1330}>
        <div style={{display: "flex", justifyContent: "center", gap: 26}}>
          {["₪", "$", "JD"].map((c, i) => (
            <div key={c} style={{width: 130, height: 130, borderRadius: 130, background: i === 0 ? GOLD : "rgba(255,255,255,0.1)", border: `3px solid ${GOLD}`, color: i === 0 ? NAVY : "#fff", fontFamily: HEAD, fontWeight: 800, fontSize: 54, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, 3 * BEAT + i * 6, 16)})`}}>{c}</div>
          ))}
        </div>
        <div style={{display: "flex", justifyContent: "center", marginTop: 34, opacity: prog(f, 5 * BEAT, 12), transform: `translateY(${(1 - prog(f, 5 * BEAT, 14)) * 30}px)`}}>
          <div style={{direction: "rtl", display: "flex", alignItems: "center", gap: 14, background: OK, color: "#fff", borderRadius: 99, padding: "12px 30px", fontFamily: HEAD, fontWeight: 700, fontSize: 38}}>
            <DrawIcon name="chat" at={5 * BEAT} size={48} color="#fff" stroke={3} /> تذكير بالواتساب بكبسة
          </div>
        </div>
      </At>
    </Feature>
  );
};

const Stock: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const swap = progIO(f, 4 * BEAT, 16);
  return (
    <Feature dur={dur} kicker="04 · المخزون" title="جرد المخزون والباركود" sub="الفرق بين الموجود والمسجّل، وملصق لكل صنف" hiWord={{"الباركود": GOLD}}>
      <div style={{opacity: 1 - swap}}><Screen src="jard/stock-count.jpg" at={8} dur={dur} focus={[0.5, 0.5]} zoom={1.25} /></div>
      <div style={{opacity: swap}}><Screen src="jard/barcode-labels.jpg" at={4 * BEAT - 20} dur={dur} focus={[0.5, 0.5]} zoom={1.2} /></div>
    </Feature>
  );
};

/* 7 — feature grid */
const FEATS: [string, string][] = [
  ["wifiOff", "يشتغل بدون إنترنت"], ["network", "شبكة لعدة أجهزة"], ["backup", "نسخ احتياطي تلقائي"],
  ["sheet", "استيراد من Excel"], ["users", "صلاحيات المستخدمين"], ["printer", "تقارير وطباعة"],
];
const Features: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <At y={260}>
        <Words text="وكمان" at={0} size={60} weight={600} color={SOFT} />
        <Words text="كل اللي بيحتاجه محلك" at={6} size={84} weight={800} color="#fff" stagger={4} hi={{"محلك": GOLD}} />
      </At>
      {FEATS.map(([ic, t], i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const at = 14 + i * 7;
        const p = pop(f, at, 18);
        return (
          <div key={t} style={{position: "absolute", left: col === 0 ? 560 : 100, top: 560 + row * 330, width: 420, height: 290, borderRadius: 30, background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.14)", transform: `scale(${p})`, opacity: prog(f, at, 8), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22}}>
            <div style={{width: 110, height: 110, borderRadius: 30, background: i % 3 === 0 ? GOLD : BLUE, display: "flex", alignItems: "center", justifyContent: "center"}}>
              <DrawIcon name={ic} at={at + 4} size={70} color={i % 3 === 0 ? NAVY : "#fff"} stroke={3} />
            </div>
            <div style={{direction: "rtl", fontFamily: HEAD, fontWeight: 700, fontSize: 36, color: "#fff"}}>{t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* 8 — outro */
const Outro: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const end = leave(f, dur - 16, 16);
  return (
    <AbsoluteFill style={{opacity: end}}>
      <Img src={staticFile("jard/icon.png")} style={{position: "absolute", left: 540 - 130, top: 470, width: 260, height: 260, transform: `scale(${pop(f, 4, 20)})`}} />
      <At y={770}>
        <Words text="جَرْد" at={10} size={170} weight={800} color="#fff" mode="scale" />
        <div style={{textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: GOLD, opacity: prog(f, 20, 12)}}>SMT TECHNOLOGIES</div>
      </At>
      <At y={1120}>
        <Words text="حساباتك مرتّبة" at={BEAT + 10} size={76} weight={800} color="#fff" stagger={4} />
        <Words text="ومخزونك معروف" at={2 * BEAT + 4} size={76} weight={800} color={GOLD} stagger={4} />
      </At>
      <At y={1440}>
        <div style={{display: "flex", justifyContent: "center", opacity: prog(f, 4 * BEAT, 14), transform: `translateY(${(1 - prog(f, 4 * BEAT, 16)) * 30}px)`}}>
          <div style={{direction: "rtl", fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: NAVY, background: "#fff", borderRadius: 99, padding: "16px 40px"}}>تواصل معنا وجهّز محلك</div>
        </div>
      </At>
    </AbsoluteFill>
  );
};

const COMP: Record<string, React.FC<{dur: number}>> = {hook: Hook, logo: Logo, pos: Pos, invoice: Invoice, debts: Debts, stock: Stock, features: Features, outro: Outro};

export const JardPromo: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <Backdrop />
      <SceneTrack scenes={SC} comps={COMP} flash={GOLD} />
      <Audio src={staticFile("jard_music.wav")} />
    </AbsoluteFill>
  );
};
export const JARD_BAR = BAR;
