import { Target } from "lucide-react";
import { NeonCard } from "@/components/ui/NeonCard";
import type { GoalProgressModel } from "@/types";

interface GoalProgressCardProps {
  goal: GoalProgressModel;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  return (
    <NeonCard padding="md">
      <div className="flex items-start gap-3">
        <span className="mh-icon-shell mh-icon-shell--gold mt-1 flex h-11 w-11 items-center justify-center">
          <Target className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <p className="mh-label text-fuchsia-200">{goal.title}</p>
          <p className="mt-1 font-display text-[1.4rem] font-bold text-white">{goal.target}</p>
          <div className="mh-progress-track mh-progress-track--default mt-4">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--mh-accent-gold),var(--mh-accent-amber))] shadow-[0_0_14px_rgba(245,158,11,0.26)]"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[1rem] text-[var(--mh-text-muted)]">
            <span>Изминат път</span>
            <span className="text-white">{goal.progress}%</span>
          </div>
        </div>
      </div>
    </NeonCard>
  );
}
