import React, { useRef, useEffect, useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";

export interface ThemeItem { id: number; text: string; color: string; }
export type AnimationPhase =
  | "stopped"
  | "first-stop"
  | "pause"
  | "second-stop"
  | "highlight";

export interface RouletteWheelProps {
  items: ThemeItem[];
  animationPhase: AnimationPhase;
  fakeStopIndex: number;
  actualStopIndex: number | null;
  onFirstStop: () => void;
  onFinalStop: () => void;
}

const ITEM_HEIGHT = 80;
const VISIBLE_COUNT = 5;
const MAX_SPEED = 40;           // 開始速度
const LOOP_COUNT = 5;           // 最低ループ数
const DECAY_FACTOR = 0.99;      // フレームごとの減衰比率
const MIN_SPEED = 1;            // 最低速度

const RouletteWheel: React.FC<RouletteWheelProps> = ({
  items,
  animationPhase,
  fakeStopIndex,
  actualStopIndex,
  onFirstStop,
  onFinalStop,
}) => {
  const totalHeight = items.length * ITEM_HEIGHT;
  const positionRef = useRef(0);
  const speedRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const traveledRef = useRef(0);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [highlightProgress, setHighlightProgress] = useState(0);
  const tick = useCallback(() => setRenderTrigger((i) => i + 1), []);

  const calcTarget = (idx: number) => idx * ITEM_HEIGHT;

  const animatePhase = () => {
    if (animationPhase === "first-stop") {
      const targetOffset = calcTarget(fakeStopIndex);
      const totalDistance = LOOP_COUNT * totalHeight + targetOffset;
      const traveled = traveledRef.current;

      if (traveled + speedRef.current >= totalDistance) {
        positionRef.current = targetOffset;
        tick();
        onFirstStop();
      } else {
        // 徐々に減衰
        speedRef.current = Math.max(speedRef.current * DECAY_FACTOR, MIN_SPEED);
        // 移動
        positionRef.current = (positionRef.current + speedRef.current) % totalHeight;
        traveledRef.current = traveled + speedRef.current;
        tick();
        rafRef.current = requestAnimationFrame(animatePhase);
      }

    } else if (animationPhase === "second-stop") {
      const SECOND_SPEED = 10;
      const target = calcTarget(actualStopIndex!);
      const dist = (target - positionRef.current + totalHeight) % totalHeight;
      if (dist > SECOND_SPEED) {
        positionRef.current = (positionRef.current + SECOND_SPEED) % totalHeight;
        tick();
        rafRef.current = requestAnimationFrame(animatePhase);
      } else {
        positionRef.current = target;
        tick();
        onFinalStop();
      }

    } else if (animationPhase === "highlight") {
      setHighlightProgress((p) => Math.min(p + 0.02, 1));
    }
  };

  useEffect(() => {
    if (animationPhase === "first-stop") {
      speedRef.current = MAX_SPEED;
      positionRef.current = 0;
      traveledRef.current = 0;
      setHighlightProgress(0);
      rafRef.current = requestAnimationFrame(animatePhase);
    }
    if (animationPhase === "second-stop") {
      rafRef.current = requestAnimationFrame(animatePhase);
    }
    return () => cancelAnimationFrame(rafRef.current!);
  }, [animationPhase]);

  const position = positionRef.current;
  const startIdx = Math.floor(position / ITEM_HEIGHT) - Math.floor(VISIBLE_COUNT / 2);
  const visible = Array.from({ length: VISIBLE_COUNT + 2 }, (_, i) =>
    (startIdx + i + items.length * 2) % items.length
  );
  const isHighlighting = animationPhase === "highlight";

  return (
    <Box sx={{ width: "100%", maxWidth: 500, height: ITEM_HEIGHT * VISIBLE_COUNT, overflow: "hidden", position: "relative" }}>
      <Box sx={{ position: "absolute", left: 0, right: 0, top: "50%", height: ITEM_HEIGHT, transform: "translateY(-50%)", bgcolor: "rgba(255,255,255,0.1)", zIndex: 1 }} />
      <Box sx={{ position: "absolute", width: "100%", transform: `translateY(-${position % ITEM_HEIGHT}px)` }}>
        {visible.map((idx, i) => {
          const item = items[idx];
          const isSel = actualStopIndex === idx && isHighlighting;
          const scale = isSel ? 1 + highlightProgress * 0.5 : 1;
          const opacity = !isSel && isHighlighting ? 1 - highlightProgress * 0.8 : 1;
          return (
            <Box key={i} sx={{ height: ITEM_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="h5" sx={{ transform: `scale(${scale})`, opacity }} color={item.color}>
                {item.text}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default RouletteWheel;