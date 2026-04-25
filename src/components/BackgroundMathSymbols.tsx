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
    size: 30,
    left: "7%",
    top: "18%",
    color: "#25ddff",
    delay: 0.1,
    duration: 7.2,
    rotate: -8,
  },
  {
    id: "x2-top",
    symbol: "x²",
    size: 28,
    left: "78%",
    top: "20%",
    color: "#ff4ed1",
    delay: 0.6,
    duration: 8.4,
    rotate: 5,
  },
  {
    id: "triangle-left",
    symbol: "△",
    size: 34,
    left: "6%",
    top: "54%",
    color: "#8f7cff",
    delay: 0.4,
    duration: 9.1,
    rotate: -10,
  },
  {
    id: "sum-right",
    symbol: "∑",
    size: 28,
    left: "83%",
    top: "62%",
    color: "#c9ff00",
    delay: 1.1,
    duration: 7.8,
    rotate: 9,
  },
  {
    id: "division-bottom",
    symbol: "÷",
    size: 26,
    left: "18%",
    top: "80%",
    color: "#25ddff",
    delay: 0.8,
    duration: 8.8,
    rotate: -6,
  },
  {
    id: "pi-bottom",
    symbol: "π",
    size: 27,
    left: "73%",
    top: "84%",
    color: "#b65cff",
    delay: 1.4,
    duration: 10.2,
    rotate: -4,
  },
  {
    id: "plus-mid",
    symbol: "+",
    size: 24,
    left: "86%",
    top: "38%",
    color: "#25ddff",
    delay: 0.5,
    duration: 6.9,
    rotate: 8,
  },
  {
    id: "sqrt-mid",
    symbol: "√",
    size: 24,
    left: "11%",
    top: "67%",
    color: "#ff4ed1",
    delay: 0.9,
    duration: 7.4,
    rotate: -7,
  },
];

const sparkles = [
  { left: "12%", top: "28%", color: "#ff4ed1", delay: 0.2 },
  { left: "29%", top: "12%", color: "#25ddff", delay: 1.1 },
  { left: "88%", top: "32%", color: "#c9ff00", delay: 0.8 },
  { left: "64%", top: "18%", color: "#b65cff", delay: 1.5 },
  { left: "82%", top: "74%", color: "#25ddff", delay: 0.5 },
  { left: "22%", top: "72%", color: "#ff4ed1", delay: 1.3 },
];

export function BackgroundMathSymbols() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {symbols.map((item) => (
        <motion.div
          key={item.id}
          className="absolute select-none font-display font-bold opacity-90"
          style={{
            left: item.left,
            top: item.top,
            fontSize: `${item.size}px`,
            color: item.color,
            textShadow: `0 0 8px ${item.color}, 0 0 18px ${item.color}, 0 0 30px ${item.color}`,
            rotate: `${item.rotate}deg`,
            filter: "saturate(1.2)",
          }}
          initial={{ opacity: 0.32, scale: 0.94, y: 0 }}
          animate={{
            opacity: [0.34, 0.72, 0.42],
            scale: [0.96, 1.08, 1],
            y: [0, -8, 0, 6, 0],
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
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            backgroundColor: sparkle.color,
            boxShadow: `0 0 10px ${sparkle.color}, 0 0 22px ${sparkle.color}`,
          }}
          initial={{ opacity: 0.2, scale: 0.9 }}
          animate={{
            opacity: [0.2, 1, 0.3],
            scale: [0.9, 1.7, 1],
          }}
          transition={{
            duration: 3.4 + index * 0.35,
            delay: sparkle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
