"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { NeonCard } from "@/components/ui/NeonCard";

interface MascotCharacterProps {
  mood?: "idle" | "happy" | "cheering" | "celebrating";
  message: string;
  xpText?: string;
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function MascotCharacter({
  mood = "idle",
  message,
  xpText,
  title,
  imageSrc,
  imageAlt = "MatHero mascot",
}: MascotCharacterProps) {
  const isHappy = mood === "happy" || mood === "cheering" || mood === "celebrating";
  const isCheering = mood === "cheering" || mood === "celebrating";

  return (
    <NeonCard padding="md">
      <div className="flex items-center gap-4">
        <motion.div
          animate={
            isCheering
              ? { y: [0, -10, 0], scale: [1, 1.06, 1] }
              : isHappy
                ? { y: [0, -5, 0] }
                : { rotate: [0, -2, 2, 0] }
          }
          transition={{
            duration: isCheering ? 1 : 2.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative flex h-28 w-24 shrink-0 items-center justify-center"
        >
          {isCheering ? (
            <>
              <motion.span
                className="absolute left-1 top-2 text-lg text-lime-200"
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -4, 0] }}
                transition={{ duration: 0.7, repeat: Number.POSITIVE_INFINITY }}
              >
                *
              </motion.span>
              <motion.span
                className="absolute right-1 top-3 text-lg text-pink-200"
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -4, 0] }}
                transition={{ duration: 0.7, repeat: Number.POSITIVE_INFINITY, delay: 0.15 }}
              >
                *
              </motion.span>
            </>
          ) : null}

          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={96}
              height={96}
              unoptimized
              className="h-auto w-full max-w-[96px] rounded-[18px]"
            />
          ) : (
            <AnimatedHeroMascot size="sm" animated />
          )}
        </motion.div>

        <div>
          <p className="mh-label text-indigo-300">Hero Buddy</p>
          <h3 className="mt-2 font-display text-[2rem] text-white">
            {title ?? (isHappy ? "Супер ход!" : "Хайде, герой!")}
          </h3>
          <p className="mt-3 text-[1rem] leading-7 text-slate-300">{message}</p>
          {xpText ? (
            <motion.div
              animate={{ opacity: [0.72, 1, 0.72], scale: [1, 1.04, 1] }}
              transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
              className="mt-4 inline-flex rounded-full border border-lime-400/28 bg-lime-400/8 px-4 py-2 text-xs font-bold text-lime-100"
            >
              {xpText}
            </motion.div>
          ) : null}
        </div>
      </div>
    </NeonCard>
  );
}
