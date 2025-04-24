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
const MAX_SPEED = 40;
const LOOP_COUNT = 3;
const MIN_SPEED = 1;

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
  const totalDistanceRef = useRef(0);
  const initialDistanceRef = useRef(0);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [highlightProgress, setHighlightProgress] = useState(0);
  const tick = useCallback(() => setRenderTrigger((i) => i + 1), []);

  const calcTarget = (idx: number) => idx * ITEM_HEIGHT;

  const animatePhase = () => {
    if (animationPhase === "first-stop") {
      const traveled = traveledRef.current;
      const totalDistance = totalDistanceRef.current;
      if (totalDistance - traveled <= speedRef.current) {
        positionRef.current = calcTarget(fakeStopIndex);
        tick();
        onFirstStop();
        return;
      }
      const progress = traveled / initialDistanceRef.current;
      const dynamicSpeed = MAX_SPEED * (1 - progress) + MIN_SPEED * progress;
      speedRef.current = dynamicSpeed;
      positionRef.current = (positionRef.current + speedRef.current) % totalHeight;
      traveledRef.current = traveled + speedRef.current;
      tick();
      rafRef.current = requestAnimationFrame(animatePhase);

    } else if (animationPhase === "second-stop") {
      const SECOND_SPEED = 30;
      const target = calcTarget(actualStopIndex!);
      const dist = (target - positionRef.current + totalHeight) % totalHeight;
      if (dist > SECOND_SPEED) {
        positionRef.current = (positionRef.current + SECOND_SPEED) % totalHeight;
        tick();
        rafRef.current = requestAnimationFrame(animatePhase);
      } else {
        // Stop at target immediately, then delay before highlighting
        positionRef.current = target;
        tick();
        setTimeout(() => {
          onFinalStop();
        }, 1000);
        return;
      }
    } else if (animationPhase === "highlight") {
      setHighlightProgress((p) => Math.min(p + 0.02, 1));
      if (highlightProgress < 1) {
        rafRef.current = requestAnimationFrame(animatePhase);
      }
      tick();
    }
  };

  useEffect(() => {
    if (animationPhase === "first-stop") {
      const targetOffset = calcTarget(fakeStopIndex);
      const distance = LOOP_COUNT * totalHeight + targetOffset;
      totalDistanceRef.current = distance;
      initialDistanceRef.current = distance;
      speedRef.current = MAX_SPEED;
      positionRef.current = 0;
      traveledRef.current = 0;
      setHighlightProgress(0);
      rafRef.current = requestAnimationFrame(animatePhase);
    }
    if (animationPhase === "second-stop" || animationPhase === "highlight") {
      rafRef.current = requestAnimationFrame(animatePhase);
    }
    return () => cancelAnimationFrame(rafRef.current!);
  }, [animationPhase]);

  const position = positionRef.current;
  const startIdx = Math.floor(position / ITEM_HEIGHT) - Math.floor(VISIBLE_COUNT / 2);
  const visible = Array.from(
    { length: VISIBLE_COUNT + 2 },
    (_, i) => (startIdx + i + items.length * 2) % items.length
  );
  const isHighlighting = animationPhase === "highlight" || animationPhase === "stopped";

  return (
    <Box sx={{ width: "100%", maxWidth: 500, height: ITEM_HEIGHT * VISIBLE_COUNT, overflow: "hidden", position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: ITEM_HEIGHT,
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.1)",
          zIndex: 1,
        }}
      />
      <Box sx={{ position: "absolute", width: "100%", transform: `translateY(-${position % ITEM_HEIGHT}px)` }}>
        {visible.map((idx, i) => {
          const item = items[idx];
          const isSel = actualStopIndex === idx && isHighlighting;
          const scale = isSel ? 1 + highlightProgress * 0.5 : 1;
          const opacity = isHighlighting && !isSel ? 1 - highlightProgress * 0.8 : 1;
          return (
            <Box
              key={i}
              sx={{ height: ITEM_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Typography
                variant="h5"
                sx={{
                  transform: `scale(${scale})`,
                  opacity,
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: "0.05em",
                  fontSize: isSel && isHighlighting ? "2em" : undefined,  // twice font size on highlight
                }}
                color={item.color}
              >
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
