import Link from "next/link";
import { DayTimelineItem } from "@/components/ui/DayTimelineItem";
import type { DayTimelineItem as DayTimelineItemModel } from "@/types";

interface DayTimelineProps {
  items: DayTimelineItemModel[];
  variant?: "vertical" | "horizontal" | "compact" | "peek";
}

function getTimelineHref(day: DayTimelineItemModel) {
  return day.href ?? (day.dayNumber === 1 ? "/dashboard" : `/lesson/${day.dayNumber}`);
}

export function DayTimeline({ items, variant = "vertical" }: DayTimelineProps) {
  if (variant === "compact") {
    return (
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((day) => (
          <Link
            key={day.id}
            href={getTimelineHref(day)}
            className={`min-w-[112px] rounded-[16px] border px-3 py-3 transition ${
              day.isActive
                ? "border-cyan-300/40 bg-cyan-300/10 text-white shadow-[0_0_18px_rgba(34,211,238,0.08)]"
                : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/18 hover:bg-white/[0.05]"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Ден {day.dayNumber}</p>
            <p className="mt-1 text-sm font-semibold text-white">{day.title}</p>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((day) => (
          <Link
            key={day.id}
            href={getTimelineHref(day)}
            className={`min-w-[180px] rounded-[20px] border px-4 py-4 transition ${
              day.isActive
                ? "border-cyan-300/40 bg-cyan-300/10 text-white shadow-[0_0_22px_rgba(34,211,238,0.1)]"
                : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/18 hover:bg-white/[0.05]"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Ден {day.dayNumber}</p>
            <p className="mt-2 text-sm font-semibold text-white">{day.title}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--mh-text-muted)]">{day.subtitle}</p>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-2">
      {items.map((day, index) => (
        <DayTimelineItem key={day.id} item={day} isLast={index === items.length - 1} />
      ))}
    </div>
  );
}
