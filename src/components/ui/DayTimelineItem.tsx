import Link from "next/link";
import { Lock } from "lucide-react";
import type { DayTimelineItem as TimelineItemModel } from "@/types";

interface DayTimelineItemProps {
  item: TimelineItemModel;
  isLast?: boolean;
}

export function DayTimelineItem({ item, isLast = false }: DayTimelineItemProps) {
  const isLocked = item.isUnlocked === false && !item.isCompleted;
  const href = item.href ?? (isLocked ? "/dashboard" : item.dayNumber === 1 ? "/dashboard" : `/day/${item.dayNumber}`);

  return (
    <div className="relative pl-9">
      {!isLast ? <span className="absolute left-[17px] top-10 h-18 w-px bg-white/10" /> : null}
      <span
        className={`absolute left-0 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border ${
          item.isActive
            ? "border-cyan-300/80 bg-cyan-300/15 shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
            : isLocked
              ? "border-white/12 bg-slate-900/90"
            : "border-slate-500/50 bg-slate-800/60"
        }`}
      >
        {isLocked ? (
          <Lock className="h-4 w-4 text-slate-400" />
        ) : (
          <span className={`h-3.5 w-3.5 rounded-full ${item.isActive ? "bg-white" : "bg-transparent"}`} />
        )}
      </span>

      <Link
        href={href}
        aria-disabled={isLocked}
        tabIndex={isLocked ? -1 : undefined}
        className={[
          "mh-timeline-item",
          item.isActive ? "mh-timeline-item--active" : "",
          isLocked ? "pointer-events-none opacity-65" : "",
        ].join(" ")}
      >
        <p className="text-[1.05rem] font-semibold text-white">{item.title}</p>
        <p className="mt-1 max-w-[220px] text-lg leading-7 text-slate-300">{item.subtitle}</p>
      </Link>
    </div>
  );
}
