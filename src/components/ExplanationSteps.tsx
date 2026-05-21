"use client";

import { motion } from "framer-motion";
import { FormattedMathText } from "@/components/math/FormattedMathText";
import { NeonCard } from "@/components/ui/NeonCard";

interface ExplanationStepsProps {
  steps: string[];
}

export function ExplanationSteps({ steps }: ExplanationStepsProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
          <NeonCard as="div" padding="sm" className="rounded-[26px]">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/12 font-bold text-cyan-100">
                {index + 1}
              </div>
              <FormattedMathText text={step} className="text-[1rem] leading-7 text-slate-200" />
            </div>
          </NeonCard>
        </motion.div>
      ))}
    </div>
  );
}
