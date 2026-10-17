import {useEffect, useState} from "react";
import {continueRender, delayRender, staticFile} from "remotion";

// Neutral defaults used by the shared motion kit; each film passes its own colours where it matters.
export const RED = "#DF0006";
export const GREEN = "#008041";
export const INK = "#0B0B0C";
export const PAPER = "#F5F2EB";
export const PAPER_2 = "#ECE7DC";
export const MUTED = "#5E5A52";

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const BEAT = 18; // 100 BPM at 30 fps
export const BAR = BEAT * 4;

export const HEAD = "Alexandria";
export const BODY = "Readex Pro";

const FONTS: [string, string, string][] = [
  ...["400", "500", "600", "700", "800"].map((w) => [HEAD, `fonts/alexandria-arabic-${w}-normal.woff2`, w] as [string, string, string]),
  ...["400", "500", "600", "700", "800"].map((w) => [HEAD, `fonts/alexandria-latin-${w}-normal.woff2`, w] as [string, string, string]),
  [BODY, "fonts/readex-pro-arabic-500-normal.woff2", "500"],
  [BODY, "fonts/readex-pro-arabic-600-normal.woff2", "600"],
  [BODY, "fonts/readex-pro-latin-500-normal.woff2", "500"],
  [BODY, "fonts/readex-pro-latin-600-normal.woff2", "600"],
];

export const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(FONTS.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile(file)})`, {weight: w}).load().then((f) => document.fonts.add(f))))
      .catch((e) => console.error(e))
      .finally(() => continueRender(h));
  }, [h]);
};

export type SceneDef = {id: string; bars: number; mood: string; transition: string; from: number; dur: number};
export const buildScenes = (list: {id: string; bars: number; mood: string; transition: string}[]): SceneDef[] => {
  let from = 0;
  return list.map((s) => {
    const d = {...s, from, dur: s.bars * BAR};
    from += d.dur;
    return d;
  });
};
