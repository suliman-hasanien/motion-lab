import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {clamp} from "./kit";

// Line icons on a 48x48 grid; each path is "drawn" with a stroke-dash animation.
export const ICONS: Record<string, string[]> = {
  crane: ["M8 42h32", "M14 42V10", "M14 10h24", "M14 16l8-6", "M34 10v10", "M31 20h6v6h-6z", "M22 42V30h12v12", "M26 34h4"],
  link: ["M10 24a6 6 0 0 1 6-6h6", "M38 24a6 6 0 0 1-6 6h-6", "M18 24h12", "M26 18h6a6 6 0 0 1 6 6", "M22 30h-6a6 6 0 0 1-6-6"],
  drop: ["M24 6c6 9 12 16 12 23a12 12 0 0 1-24 0c0-7 6-14 12-23z", "M18 30a6 6 0 0 0 6 6"],
  growth: ["M8 40h32", "M8 40V8", "M12 34l9-10 7 6 12-14", "M33 16h7v7"],
  globe: ["M24 6a18 18 0 1 0 0.01 0z", "M6 24h36", "M24 6c6 6 6 30 0 36", "M24 6c-6 6-6 30 0 36"],
  scales: ["M24 8v32", "M14 40h20", "M10 14h28", "M10 14l-5 12h10z", "M38 14l-5 12h10z", "M5 26a5 3 0 0 0 10 0", "M33 26a5 3 0 0 0 10 0"],
  ballot: ["M8 22h32v20H8z", "M18 30h12", "M16 22l8-14 10 6-5 8", "M8 22l6-6", "M40 22l-6-6"],
  mic: ["M18 8h12v18a6 6 0 0 1-12 0z", "M12 24a12 12 0 0 0 24 0", "M24 36v6", "M17 42h14"],
  people: ["M17 16a5 5 0 1 0 0.01 0z", "M31 16a5 5 0 1 0 0.01 0z", "M8 38c0-7 4-11 9-11s9 4 9 11", "M22 38c0-7 4-11 9-11s9 4 9 11"],
  book: ["M24 12c-5-3-11-4-17-3v29c6-1 12 0 17 3", "M24 12c5-3 11-4 17-3v29c-6-1-12 0-17 3", "M24 12v29"],
  bulb: ["M24 6a12 12 0 0 0-7 22v6h14v-6a12 12 0 0 0-7-22z", "M19 38h10", "M21 42h6", "M24 20v8"],
  briefcase: ["M7 16h34v24H7z", "M18 16v-5h12v5", "M7 26h34", "M22 26v4h4v-4"],
  shield: ["M24 6l15 5v12c0 9-6 16-15 19-9-3-15-10-15-19V11z", "M17 24l5 5 9-10"],
  dove: ["M8 28c6 0 10-3 13-8 2-4 6-8 12-8 3 0 5 2 7 4l-5 1c0 10-8 18-19 18-4 0-7-1-9-3", "M21 20c-3-4-8-6-13-6 1 6 5 10 11 11", "M38 14h0.01"],
  chip: ["M14 14h20v20H14z", "M20 20h8v8h-8z", "M18 8v6", "M24 8v6", "M30 8v6", "M18 34v6", "M24 34v6", "M30 34v6", "M8 18h6", "M8 24h6", "M8 30h6", "M34 18h6", "M34 24h6", "M34 30h6"],
  handshake: ["M4 20l8-6 8 3 6-3 8 2 10 4", "M4 20l6 12", "M44 20l-6 12", "M20 17l-5 7c2 2 5 2 7 0l4-4 10 10", "M30 34l-3-3", "M26 36l-3-3", "M22 37l-3-3"],
  network: ["M24 10a4 4 0 1 0 0.01 0z", "M10 34a4 4 0 1 0 0.01 0z", "M38 34a4 4 0 1 0 0.01 0z", "M22 17l-9 13", "M26 17l9 13", "M14 37h20"],
  eye: ["M4 24c6-10 13-14 20-14s14 4 20 14c-6 10-13 14-20 14S10 34 4 24z", "M24 18a6 6 0 1 0 0.01 0z"],
  check: ["M24 6a18 18 0 1 0 0.01 0z", "M15 24l6 6 12-13"],
  gavel: ["M22 12l12 12", "M28 6l12 12", "M25 9l-7 7 12 12 7-7", "M21 19L6 34l6 6 15-15", "M26 42h16"],
  heart: ["M24 40S8 30 8 18a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 12-16 22-16 22z"],
  key: ["M16 16a8 8 0 1 0 0.01 0z", "M22 22l18 18", "M34 34l4-4", "M38 38l4-4"],
  ai: ["M10 10h28v28H10z", "M17 32l5-16 5 16", "M19 27h6", "M32 16v16"],
};

export const DrawIcon: React.FC<{name: string; at: number; size?: number; color?: string; dur?: number; stroke?: number; style?: React.CSSProperties}> = ({name, at, size = 120, color = "#000", dur = 26, stroke = 2.6, style}) => {
  const f = useCurrentFrame();
  const paths = ICONS[name] ?? [];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{overflow: "visible", ...style}}>
      {paths.map((d, i) => {
        const p = interpolate(f, [at + i * 3, at + i * 3 + dur], [0, 1], clamp);
        return <path key={i} d={d} pathLength={1} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0 ? 1 : 0} />;
      })}
    </svg>
  );
};
