import React from "react";
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from "remotion";
import {clamp} from "./kit";
import {SceneDef} from "./theme";

export const T = 10; // scene overlap (frames) used by the transitions

/** Slide-in / slide-out with motion blur ("slide"), or zoom-fade ("fade"), so neighbouring scenes overlap by T frames. */
export const SlideWrap: React.FC<{dur: number; first: boolean; last: boolean; kind: string; children: React.ReactNode}> = ({dur, first, last, kind, children}) => {
  const f = useCurrentFrame();
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const pin = first ? 1 : ease(Math.min(1, f / T));
  const pout = last ? 0 : Math.max(0, (f - dur) / T);
  const slide = kind === "slide";
  const x = slide ? (1 - pin) * -1080 + pout * 1080 : 0;
  const sc = slide ? 1 : (1 - pin) * 0.15 + 1 - pout * 0.1;
  const op = slide ? 1 : Math.min(pin, 1 - pout);
  const blur = Math.max(1 - pin, pout) * 18;
  return <AbsoluteFill style={{transform: `translateX(${x}px) scale(${sc})`, opacity: op, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};

export const Flash: React.FC<{color: string}> = ({color}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, T, 2 * T], [0, 0.85, 0], clamp);
  return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${color}, transparent 70%)`, opacity: o, mixBlendMode: "screen"}} />;
};

/** Lays scenes out on the timeline with the overlap + flash transitions from timeline.json. */
export const SceneTrack: React.FC<{scenes: SceneDef[]; comps: Record<string, React.FC<{dur: number}>>; flash: string}> = ({scenes, comps, flash}) => (
  <>
    {scenes.map((s, i) => {
      const C = comps[s.id];
      const next = scenes[i + 1];
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur + (next ? T : 0)} name={s.id}>
          <SlideWrap dur={s.dur} first={i === 0} last={!next} kind={next?.transition === "slide" || s.transition === "slide" ? "slide" : "fade"}>
            <C dur={s.dur} />
          </SlideWrap>
        </Sequence>
      );
    })}
    {scenes.filter((s) => s.transition === "flash").map((s) => (
      <Sequence key={`fl-${s.id}`} from={s.from - T} durationInFrames={2 * T}><Flash color={flash} /></Sequence>
    ))}
  </>
);
