"use client";

import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect } from "react";

interface ScoreCircleProps {
  score: number;
  label: string;
  color: string;
  size?: number;
  delay?: number;
}

export function ScoreCircle({ score, label, color, size = 90, delay = 0 }: ScoreCircleProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useMotionValue(0);
  const strokeDashoffset = useTransform(progress, (v) => circumference - (v / 100) * circumference);
  const displayScore = useTransform(progress, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(progress, score, {
      duration: 1.5,
      delay,
      ease: [0.25, 0.1, 0.25, 1],
    });
    return controls.stop;
  }, [score, delay, progress]);

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} style={{ strokeDashoffset }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span className="font-bold" style={{ color, fontSize: size > 80 ? "1.5rem" : "1.15rem" }}>
            {displayScore}
          </motion.span>
        </div>
      </div>
      <span className="text-[13px] font-medium text-muted">{label}</span>
    </div>
  );
}
