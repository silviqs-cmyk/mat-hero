"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const mascotSrc = "/images/extracted/mascot-neon.png";

interface AnimatedHeroMascotProps {
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "h-32 w-32",
  md: "h-40 w-40",
  lg: "h-56 w-56",
};

export function AnimatedHeroMascot({
  size = "lg",
}: AnimatedHeroMascotProps) {
  return (
    <motion.div
      className={`relative mx-auto overflow-visible ${sizeClass[size]}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
      transition={{
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
        y: {
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        },
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          rotate: [0, 0.8, 0, -0.8, 0],
          scale: [1, 1.015, 1],
          filter: [
            "drop-shadow(0 0 10px rgba(37,221,255,0.5)) drop-shadow(0 0 18px rgba(182,92,255,0.16))",
            "drop-shadow(0 0 16px rgba(37,221,255,0.72)) drop-shadow(0 0 24px rgba(255,78,209,0.24))",
            "drop-shadow(0 0 10px rgba(37,221,255,0.5)) drop-shadow(0 0 18px rgba(182,92,255,0.16))",
          ],
        }}
        transition={{
          duration: 2.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <Image
          src={mascotSrc}
          alt="Неоновият герой на MatHero"
          fill
          priority
          sizes="240px"
          className="object-contain"
        />
      </motion.div>
    </motion.div>
  );
}
