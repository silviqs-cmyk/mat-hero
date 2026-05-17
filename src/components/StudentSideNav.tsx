"use client";

import { LayoutDashboard, Map, Trophy, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "@/components/ui/SidebarItem";

interface StudentSideNavProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Табло",
    icon: LayoutDashboard,
  },
  {
    href: "/roadmap",
    label: "Карта",
    icon: Map,
  },
  {
    href: "/results",
    label: "Резултати",
    icon: Trophy,
  },
  {
    href: "/profile",
    label: "Профил",
    icon: User,
  },
];

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentSideNav({ mobile = false, onNavigate }: StudentSideNavProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`min-w-0 ${
        mobile
          ? "rounded-[26px] border border-white/10 bg-[rgba(7,11,22,0.92)] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl"
          : "h-full border-r border-white/8 px-4 py-5 lg:px-5 lg:py-6"
      }`}
    >
      <nav className="space-y-2">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isNavItemActive(pathname, item.href)}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {mobile ? (
        <p className="mt-4 text-center text-xs text-[var(--mh-text-muted)]">
          Избери секция от приложението.
        </p>
      ) : null}
    </aside>
  );
}
