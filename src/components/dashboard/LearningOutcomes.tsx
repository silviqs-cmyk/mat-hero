import { CheckCircle2 } from "lucide-react";
import { NeonCard } from "@/components/ui/NeonCard";

interface LearningOutcomesProps {
  items: string[];
  compact?: boolean;
}

export function LearningOutcomes({ items, compact = false }: LearningOutcomesProps) {
  const visibleItems = items.filter((item) => item.trim().length > 0);

  return (
    <NeonCard
      padding={compact ? "sm" : "md"}
      className={compact ? "rounded-[20px] border-white/6 bg-white/[0.02]" : "rounded-[26px]"}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`mh-label ${compact ? "text-cyan-200/90" : ""}`}>ДНЕС ЩЕ НАУЧИШ</p>
      </div>

      {!compact ? (
        <p className="mt-3 text-sm text-[var(--mh-text-muted)]">
          Най-важните неща за днешния урок, събрани на едно място.
        </p>
      ) : null}

      <div className={compact ? "mt-3 grid gap-2" : "mt-4 grid gap-4 xl:grid-cols-4"}>
        {visibleItems.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full border border-cyan-400/30 text-cyan-300 ${
                compact ? "h-5 w-5" : "h-7 w-7"
              }`}
            >
              <CheckCircle2 className={compact ? "h-3 w-3" : "h-4 w-4"} />
            </span>
            <p className={compact ? "text-sm leading-5 text-slate-200" : "text-[1.05rem] leading-7 text-slate-200"}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </NeonCard>
  );
}
