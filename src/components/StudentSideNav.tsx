"use client";

import Image from "next/image";
import { LayoutDashboard, Map, Trophy } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "@/components/ui/SidebarItem";

const navItems = [
  { href: "/dashboard", label: "Табло", icon: LayoutDashboard },
  { href: "/roadmap", label: "Карта", icon: Map },
  { href: "/results", label: "Резултати", icon: Trophy },
];

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentSideNav() {
  const pathname = usePathname();
  const shouldShowActiveMascot =
    pathname === "/roadmap" ||
    pathname.startsWith("/day/") ||
    pathname.startsWith("/course/") ||
    pathname.startsWith("/lesson/") ||
    pathname.startsWith("/quiz/") ||
    pathname.startsWith("/explanation/");
  const mascotSrc = shouldShowActiveMascot ? "/images/thinking-active.gif" : "/images/thinking.gif";

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
        <div className="-mx-3 -mt-3 flex justify-center">
          <Image
            src={mascotSrc}
            alt="MatHero mascot animation"
            width={220}
            height={220}
            className="mx-auto h-auto w-[82%] max-w-[180px] object-contain"
            priority
            unoptimized
          />
        </div>
        <p className="mt-3 text-center text-base font-medium text-[var(--mh-text-muted)]">
          MatHero мисли за следващата ти победа.
        </p>
      </div>
    </aside>
  );
}
