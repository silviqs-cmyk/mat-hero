import { Bell, ChevronDown, Flame, Star } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";

interface TopHeaderProps {
  dayNumber: number;
  totalDays: number;
  progress: number;
  streak: number;
  xp: number;
  notificationCount: number;
  studentName: string;
  studentGrade: string;
}

export function TopHeader({
  dayNumber,
  totalDays,
  progress,
  streak,
  xp,
  notificationCount,
  studentName,
  studentGrade,
}: TopHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-white/6 pb-8 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-8 xl:gap-10">
        <div className="min-w-[180px]">
          <p className="font-display text-[2.05rem] font-bold text-white">Ден {dayNumber} от {totalDays}</p>
          <p className="mh-copy-muted text-base">Напредък в плана</p>
        </div>

        <div className="min-w-[340px] max-w-[420px] flex-1">
          <ProgressBar value={progress} max={100} label="Напредък в плана" accent="cyan" compact />
        </div>

        <div className="flex items-center gap-8">
          <StatCard icon={Flame} value={streak} label="поредни дни" tone="amber" />
          <div className="hidden h-14 w-px bg-white/8 md:block" />
          <StatCard icon={Star} value={xp} label="XP точки" tone="gold" />
        </div>
      </div>

      <div className="flex items-center gap-4 self-end xl:self-auto">
        <button type="button" className="mh-icon-button relative h-16 w-16" aria-label="Известия">
          <Bell className="h-7 w-7" />
          <span className="absolute right-1 top-0 flex h-7 min-w-7 items-center justify-center rounded-full bg-orange-400 px-1 text-sm font-bold text-white">
            {notificationCount}
          </span>
        </button>

        <button type="button" className="mh-btn mh-btn-ghost min-h-0 gap-4 rounded-full px-2 py-2" aria-label="Профил">
          <div className="mh-avatar flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white">
            {studentName.charAt(0)}
          </div>
          <div className="text-left">
            <p className="text-[1.55rem] font-semibold text-white">{studentName}</p>
            <p className="mh-copy-muted text-base">{studentGrade}</p>
          </div>
          <ChevronDown className="mr-2 h-6 w-6 text-white/80" />
        </button>
      </div>
    </header>
  );
}
