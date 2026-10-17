import React from "react";
import {Composition} from "remotion";
import {JARD_TOTAL, JardPromo} from "./jard/JardPromo";
import {KIT_TOTAL, MotionKitReel} from "./kit/MotionKitReel";
import {FPS, H, W} from "./shared/theme";

export const Root: React.FC = () => (
  <>
    <Composition id="JardPromo" component={JardPromo} width={W} height={H} fps={FPS} durationInFrames={JARD_TOTAL} />
    <Composition id="MotionKitReel" component={MotionKitReel} width={W} height={H} fps={FPS} durationInFrames={KIT_TOTAL} />
  </>
);
