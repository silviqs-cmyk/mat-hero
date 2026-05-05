import { CheckCircle2 } from "lucide-react";
import { NeonCard } from "@/components/ui/NeonCard";

interface LearningOutcomesProps {
  items: string[];
}

export function LearningOutcomes({ items }: LearningOutcomesProps) {
  return (
    <NeonCard padding="md" className="rounded-[26px]">
      <p className="mh-label">ДНЕС ЩЕ НАУЧИШ</p>
      <div className="mt-4 grid gap-4 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 text-cyan-300">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <p className="text-[1.05rem] leading-7 text-slate-200">{item}</p>
          </div>
        ))}
      </div>
    </NeonCard>
  );
}
