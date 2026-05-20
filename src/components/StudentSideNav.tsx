"use client";

import Image from "next/image";
import { LayoutDashboard, Map, Trophy, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "@/components/ui/SidebarItem";

const navItems = [
  { href: "/dashboard", label: "Табло", icon: LayoutDashboard },
  { href: "/roadmap", label: "Карта", icon: Map },
  { href: "/results", label: "Резултати", icon: Trophy },
  { href: "/profile", label: "Профил", icon: User },
];

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentSideNav() {
  const pathname = usePathname();

  return (
    <aside className="h-full border-r border-white/8 px-4 py-5 lg:px-5 lg:py-6">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isNavItemActive(pathname, item.href)}
          />
        ))}
      </nav>

      <div className="mt-6 overflow-hidden rounded-[22px] border border-cyan-400/14 bg-[linear-gradient(180deg,rgba(8,12,25,0.96),rgba(11,18,34,0.96))] p-3 shadow-[0_0_28px_rgba(34,211,238,0.08)]">
        <div className="flex justify-center">
          <Image
            src="/choose.gif"
            alt="MatHero mascot animation"
            width={220}
            height={220}
            className="h-auto w-full max-w-[170px] rounded-[16px] object-contain"
            priority
            unoptimized
          />
        </div>
        <p className="mt-3 text-center text-xs font-medium text-[var(--mh-text-muted)]">
          MatHero мисли за следващата ти победа.
        </p>
      </div>
    </aside>
  );
}
