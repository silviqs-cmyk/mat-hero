"use client";

import { motion } from "framer-motion";

type SymbolItem = {
  id: string;
  symbol: string;
  size: number;
  left: string;
  top: string;
  color: string;
  delay: number;
  duration: number;
  rotate: number;
};

const symbols: SymbolItem[] = [
  {
    id: "percent-top",
    symbol: "%",
    size: 34,
    left: "7%",
    top: "18%",
    color: "#22d3ee",
    delay: 0.1,
    duration: 12,
    rotate: -8,
  },
  {
    id: "x2-top",
    symbol: "x²",
    size: 32,
    left: "78%",
    top: "20%",
    color: "#f472b6",
    delay: 0.6,
    duration: 14,
    rotate: 5,
  },
  {
    id: "triangle-left",
    symbol: "△",
    size: 36,
    left: "6%",
    top: "54%",
    color: "#8b5cf6",
    delay: 0.4,
    duration: 16,
    rotate: -10,
  },
  {
    id: "sum-right",
    symbol: "∑",
    size: 32,
    left: "83%",
    top: "62%",
    color: "#22c55e",
    delay: 1.1,
    duration: 13,
    rotate: 9,
  },
  {
    id: "division-bottom",
    symbol: "÷",
    size: 30,
    left: "18%",
    top: "80%",
    color: "#22d3ee",
    delay: 0.8,
    duration: 15,
    rotate: -6,
  },
  {
    id: "pi-bottom",
    symbol: "π",
    size: 31,
    left: "73%",
    top: "84%",
    color: "#c084fc",
    delay: 1.4,
    duration: 18,
    rotate: -4,
  },
  {
    id: "plus-mid",
    symbol: "+",
    size: 28,
    left: "86%",
    top: "38%",
    color: "#22d3ee",
    delay: 0.5,
    duration: 11,
    rotate: 8,
  },
  {
    id: "sqrt-mid",
    symbol: "√",
    size: 30,
    left: "11%",
    top: "67%",
    color: "#f472b6",
    delay: 0.9,
    duration: 13,
    rotate: -7,
  },
];

const sparkles = [
  { left: "12%", top: "28%", color: "#f472b6", delay: 0.2 },
  { left: "29%", top: "12%", color: "#22d3ee", delay: 1.1 },
  { left: "88%", top: "32%", color: "#22c55e", delay: 0.8 },
  { left: "64%", top: "18%", color: "#c084fc", delay: 1.5 },
  { left: "82%", top: "74%", color: "#22d3ee", delay: 0.5 },
  { left: "22%", top: "72%", color: "#f472b6", delay: 1.3 },
];

const halos = [
  {
    id: "halo-left",
    left: "4%",
    top: "8%",
    size: 220,
    color: "rgba(34, 211, 238, 0.16)",
    duration: 24,
  },
  {
    id: "halo-right",
    left: "72%",
    top: "10%",
    size: 260,
    color: "rgba(244, 114, 182, 0.14)",
    duration: 28,
  },
  {
    id: "halo-bottom",
    left: "42%",
    top: "68%",
    size: 240,
    color: "rgba(139, 92, 246, 0.12)",
    duration: 32,
  },
];

export function BackgroundMathSymbols() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {halos.map((halo, index) => (
        <motion.div
          key={halo.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: halo.left,
            top: halo.top,
            width: halo.size,
            height: halo.size,
            background: halo.color,
          }}
          animate={{
            rotate: index % 2 === 0 ? [0, 360] : [360, 0],
            scale: [1, 1.08, 0.96, 1],
            x: [0, 10, -8, 0],
            y: [0, -10, 12, 0],
          }}
          transition={{
            duration: halo.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}

      {symbols.map((item, index) => (
        <motion.div
          key={item.id}
          className="absolute select-none font-display font-bold opacity-95"
          style={{
            left: item.left,
            top: item.top,
            fontSize: `${item.size}px`,
            color: item.color,
            textShadow: `0 0 12px ${item.color}, 0 0 26px ${item.color}, 0 0 48px ${item.color}`,
            filter: "saturate(1.35) brightness(1.12)",
          }}
          initial={{ opacity: 0.38, scale: 0.96 }}
          animate={{
            opacity: [0.42, 0.86, 0.5],
            scale: [0.96, 1.1, 1],
            y: [0, -10, 0, 8, 0],
            rotate: [item.rotate, item.rotate + (index % 2 === 0 ? 18 : -18), item.rotate],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {item.symbol}
        </motion.div>
      ))}

      {sparkles.map((sparkle, index) => (
        <motion.div
          key={`${sparkle.left}-${sparkle.top}`}
          className="absolute rounded-full"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            width: 8,
            height: 8,
            backgroundColor: sparkle.color,
            boxShadow: `0 0 14px ${sparkle.color}, 0 0 28px ${sparkle.color}, 0 0 40px ${sparkle.color}`,
          }}
          initial={{ opacity: 0.24, scale: 0.9 }}
          animate={{
            opacity: [0.24, 1, 0.34],
            scale: [0.9, 1.9, 1.1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4 + index * 0.4,
            delay: sparkle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
