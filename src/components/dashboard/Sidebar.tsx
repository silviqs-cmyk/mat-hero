import { Grid2x2, Map, Trophy, User } from "lucide-react";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { DayTimeline } from "@/components/dashboard/DayTimeline";
import { NeonButton } from "@/components/ui/NeonButton";
import { SidebarItem } from "@/components/ui/SidebarItem";
import type { DayTimelineItem } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Табло", icon: Grid2x2, active: true },
  { href: "/roadmap", label: "Карта", icon: Map, active: false },
  { href: "/results", label: "Резултати", icon: Trophy, active: false },
  { href: "/report", label: "Профил", icon: User, active: false },
];

interface SidebarProps {
  timeline: DayTimelineItem[];
  layout?: "desktop" | "stacked";
}

export function Sidebar({ timeline, layout = "desktop" }: SidebarProps) {
  const isStacked = layout === "stacked";

  return (
    <aside
      className={`mh-panel-sidebar px-7 py-8 ${
        isStacked
          ? "mh-card rounded-[var(--mh-radius-card-lg)] border border-[rgba(148,163,184,0.16)]"
          : "border-r border-white/6"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="mh-card-muted flex h-14 w-14 items-center justify-center rounded-2xl p-2">
          <AnimatedHeroMascot size="sm" animated={false} />
        </div>
        <div>
          <p className="font-logo text-[2rem] font-extrabold leading-none text-white">MatHero</p>
          <p className="mt-2 text-sm text-[var(--mh-text-muted)]">Твоят герой в математиката</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2 border-y border-white/6 py-6">
        {navItems.map((item) => (
          <SidebarItem key={item.href} {...item} />
        ))}
      </nav>

      <section className="pt-8">
        <p className="mh-label">План за 10 дни</p>
        <DayTimeline items={timeline} />
        <NeonButton href="/roadmap" variant="ghost" className="mt-6 w-full justify-center text-base">
          Виж целия план
        </NeonButton>
      </section>
    </aside>
  );
}
