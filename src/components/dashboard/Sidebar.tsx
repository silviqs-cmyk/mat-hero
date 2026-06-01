import { Grid2x2, Map, Trophy, User } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
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
      <BrandMark
        titleClassName="text-[2rem]"
        subtitle="Твоят герой в математиката"
        iconShellClassName="h-14 w-14"
      />

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
