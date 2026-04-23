"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const mascotSrc = "/images/hero-mascot-reference.png";

interface AnimatedHeroMascotProps {
  size?: "sm" | "md" | "lg";
}

export function AnimatedHeroMascot({
  size = "lg",
}: AnimatedHeroMascotProps) {
  const sizeClass = {
    sm: "h-36 w-36",
    md: "h-44 w-44",
    lg: "h-60 w-60",
  };

  return (
    <motion.div
      className={`relative mx-auto overflow-visible ${sizeClass[size]}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
      transition={{
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
        y: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
      }}
    >
      <svg
        viewBox="0 0 240 240"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible"
      >
        <defs>
          <filter id="capeGlowOnly" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="capeStroke" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#b65cff" />
            <stop offset="100%" stopColor="#ff4ed1" />
          </linearGradient>
        </defs>

        <motion.path
          d="M52 136 C33 143 25 151 18 157 C38 166 60 163 85 146 C84 160 98 172 118 154 C101 145 76 139 52 136"
          animate={{
            d: [
              "M52 136 C33 143 25 151 18 157 C38 166 60 163 85 146 C84 160 98 172 118 154 C101 145 76 139 52 136",
              "M55 132 C30 136 18 147 13 151 C35 164 61 166 88 145 C85 164 102 176 124 154 C104 141 79 135 55 132",
              "M52 136 C33 143 25 151 18 157 C38 166 60 163 85 146 C84 160 98 172 118 154 C101 145 76 139 52 136",
            ],
          }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          fill="rgba(182,92,255,0.06)"
          stroke="url(#capeStroke)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#capeGlowOnly)"
        />
      </svg>

      <motion.div
        className="absolute inset-0"
        animate={{
          filter: [
            "drop-shadow(0 0 10px rgba(37,221,255,0.52))",
            "drop-shadow(0 0 18px rgba(37,221,255,0.78))",
            "drop-shadow(0 0 10px rgba(37,221,255,0.52))",
          ],
        }}
        transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <Image
          src={mascotSrc}
          alt="Усмихнатият герой на MatHero"
          fill
          priority
          sizes="240px"
          className="object-contain"
        />
      </motion.div>

      <svg viewBox="0 0 240 240" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <filter id="referenceFaceGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d="M104 98 Q120 112 138 98"
          animate={{
            d: [
              "M106 99 Q121 110 137 99",
              "M102 96 Q121 116 141 96",
              "M106 99 Q121 110 137 99",
            ],
            opacity: [0.18, 0.92, 0.18],
          }}
          transition={{ duration: 2.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          fill="none"
          stroke="#8ff4ff"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#referenceFaceGlow)"
        />

        <motion.path
          d="M103 79 Q103 70 109 79"
          animate={{
            opacity: [0.2, 0.85, 0.2],
            d: [
              "M103 79 Q103 70 109 79",
              "M102 79 Q106 76 110 79",
              "M103 79 Q103 70 109 79",
            ],
          }}
          transition={{ duration: 0.3, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2.5 }}
          fill="none"
          stroke="#8ff4ff"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#referenceFaceGlow)"
        />
        <motion.path
          d="M132 79 Q132 70 138 79"
          animate={{
            opacity: [0.2, 0.85, 0.2],
            d: [
              "M132 79 Q132 70 138 79",
              "M131 79 Q135 76 139 79",
              "M132 79 Q132 70 138 79",
            ],
          }}
          transition={{ duration: 0.3, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2.5, delay: 0.04 }}
          fill="none"
          stroke="#8ff4ff"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#referenceFaceGlow)"
        />
      </svg>
    </motion.div>
  );
}
