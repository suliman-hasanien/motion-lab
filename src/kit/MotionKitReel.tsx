import React from "react";
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from "remotion";
import {prog, Words} from "../shared/kit";
import {BEAT, buildScenes, HEAD, useFonts} from "../shared/theme";
import {SceneTrack} from "../shared/transitions";
import {KitBackdrop, KitTheme, LowerThird, OfferBadge, QuoteCard, SocialCTA, StatCounter, THEMES, TitleCard} from "./templates";
import TL from "./timeline.json";

const SC = buildScenes(TL.scenes);
export const KIT_TOTAL = SC.reduce((a, s) => a + s.dur, 0);

/** Corner tag naming the template + its JSX, so the reel doubles as documentation. */
const Tag: React.FC<{n: string; name: string; t: KitTheme}> = ({n, name, t}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 12);
  return (
    <div style={{position: "absolute", top: 150, left: 70, right: 70, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: p, transform: `translateY(${(1 - p) * -20}px)`}}>
      <div style={{fontFamily: "Consolas, 'Courier New', monospace", fontSize: 34, color: t.fg, background: `${t.bg2}`, border: `2px solid ${t.accent}55`, borderRadius: 14, padding: "10px 20px"}}>
        <span style={{color: t.accent}}>&lt;{name}</span><span style={{color: t.muted}}> … /&gt;</span>
      </div>
      <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: t.accent}}>{n}</div>
    </div>
  );
};

const Frame: React.FC<{t: KitTheme; n?: string; name?: string; children: React.ReactNode}> = ({t, n, name, children}) => (
  <AbsoluteFill>
    <KitBackdrop t={t} />
    {n && name && <Tag n={n} name={name} t={t} />}
    {children}
  </AbsoluteFill>
);

const Intro: React.FC<{dur: number}> = () => {
  const t = THEMES.coral;
  const f = useCurrentFrame();
  return (
    <Frame t={t}>
      <div style={{position: "absolute", top: 560, left: 0, right: 0}}>
        <div style={{textAlign: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 120, color: t.fg, letterSpacing: -2, opacity: prog(f, 2, 12), transform: `translateY(${(1 - prog(f, 2, 18)) * 40}px)`}}>Arabic</div>
        <div style={{textAlign: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 120, color: t.accent, letterSpacing: -2, opacity: prog(f, 8, 12), transform: `translateY(${(1 - prog(f, 8, 18)) * 40}px)`}}>Motion Kit</div>
        <Words text="عُدّة موشن عربية" at={20} size={84} weight={800} color={t.fg} style={{marginTop: 40}} />
        <Words text="6 قوالب جاهزة · كل قالب مكوّن React واحد" at={32} size={42} weight={500} color={t.muted} stagger={3} style={{marginTop: 20, padding: "0 60px"}} />
      </div>
    </Frame>
  );
};

const Title: React.FC<{dur: number}> = () => (
  <Frame t={THEMES.coral} n="01" name="TitleCard"><TitleCard t={THEMES.coral} kicker="الحلقة الأولى" title="ابدأ من الصفر" sub="عنوان رئيسي بكشف قناعي وخط لوني" at={6} /></Frame>
);
const Lower: React.FC<{dur: number}> = () => (
  <Frame t={THEMES.ocean} n="02" name="LowerThird">
    <div style={{position: "absolute", top: 520, left: 0, right: 0, textAlign: "center"}}>
      <Words text="اسم ومسمى" at={2} size={80} weight={800} color={THEMES.ocean.fg} />
      <Words text="لمقابلات وبودكاست ومحاضرات" at={10} size={42} weight={500} color={THEMES.ocean.muted} />
    </div>
    <LowerThird t={THEMES.ocean} name="سليمان حسنين" role="مطوّر وموشن ديزاينر" at={20} />
  </Frame>
);
const Stat: React.FC<{dur: number}> = () => (
  <Frame t={THEMES.sand} n="03" name="StatCounter"><StatCounter t={THEMES.sand} value={250} prefix="+" label="متدرب أنهى الدورة" at={6} /></Frame>
);
const Quote: React.FC<{dur: number}> = () => (
  <Frame t={THEMES.ocean} n="04" name="QuoteCard"><QuoteCard t={THEMES.ocean} quote="اللي بيتعلّم كل يوم شوي، بيوصل" by="مثل يومي" at={4} /></Frame>
);
const Social: React.FC<{dur: number}> = () => (
  <Frame t={THEMES.coral} n="05" name="SocialCTA"><SocialCTA t={THEMES.coral} handle="@your.brand" at={4} /></Frame>
);
const Offer: React.FC<{dur: number}> = () => (
  <Frame t={THEMES.sand} n="06" name="OfferBadge"><OfferBadge t={THEMES.sand} pct={30} title="عرض نهاية الأسبوع" oldPrice="150 ₪" newPrice="105 ₪" at={4} /></Frame>
);

/** Closing: the same LowerThird in three themes + the one-line usage. */
const Themes: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const code = `<LowerThird theme={brand} … />`;
  const typed = Math.round(code.length * prog(f, 2 * BEAT, 40));
  const keys = ["coral", "sand", "ocean"];
  return (
    <Frame t={THEMES.coral}>
      <div style={{position: "absolute", top: 230, left: 0, right: 0}}>
        <Words text="براندك = سطر واحد" at={0} size={84} weight={800} color={THEMES.coral.fg} stagger={4} />
      </div>
      {keys.map((k, i) => {
        const t = THEMES[k];
        const p = prog(f, 6 + i * 8, 18);
        return (
          <div key={k} style={{position: "absolute", left: 70, right: 70, top: 420 + i * 330, height: 300, borderRadius: 28, overflow: "hidden", border: "2px solid rgba(255,255,255,0.12)", opacity: p, transform: `translateX(${(1 - p) * 120}px)`}}>
            <div style={{position: "absolute", transform: "scale(0.5)", transformOrigin: "top left", left: 0, top: 0, width: 1880, height: 600}}>
              <AbsoluteFill><KitBackdrop t={t} /></AbsoluteFill>
              <LowerThird t={t} name="سليمان حسنين" role="مطوّر وموشن ديزاينر" at={10 + i * 8} y={170} />
            </div>
            <div style={{position: "absolute", left: 24, bottom: 18, fontFamily: "Consolas, monospace", fontSize: 30, color: t.fg, opacity: 0.8}}>theme: {k}</div>
          </div>
        );
      })}
      <div style={{position: "absolute", left: 70, right: 70, top: 1440, background: "#0A0A0C", borderRadius: 20, padding: "26px 30px", fontFamily: "Consolas, 'Courier New', monospace", fontSize: 34, color: "#E6E1D8", direction: "ltr", border: "2px solid rgba(255,90,54,0.4)", opacity: prog(f, 2 * BEAT - 6, 10)}}>
        {code.slice(0, typed)}<span style={{opacity: f % 16 < 8 ? 1 : 0, color: THEMES.coral.accent}}>▍</span>
      </div>
      <div style={{position: "absolute", top: 1620, left: 0, right: 0, textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 36, color: THEMES.coral.muted, opacity: prog(f, 5 * BEAT, 14)}}>Remotion · React · TypeScript</div>
    </Frame>
  );
};

const COMP: Record<string, React.FC<{dur: number}>> = {intro: Intro, title: Title, lower: Lower, stat: Stat, quote: Quote, social: Social, offer: Offer, themes: Themes};

export const MotionKitReel: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: THEMES.coral.bg}}>
      <SceneTrack scenes={SC} comps={COMP} flash={THEMES.coral.accent} />
      <Audio src={staticFile("kit_music.wav")} />
    </AbsoluteFill>
  );
};
