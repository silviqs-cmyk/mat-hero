"use client";

import { motion } from "framer-motion";

interface ExplanationStepsProps {
  steps: string[];
}

export function ExplanationSteps({ steps }: ExplanationStepsProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="panel rounded-[24px] p-4"
        >
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 font-bold text-cyan-200">
              {index + 1}
            </div>
            <p className="panel-copy text-slate-200">{step}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
