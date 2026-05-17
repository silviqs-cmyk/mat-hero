import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarItem({ href, label, icon: Icon, active = false, onClick }: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={["mh-sidebar-item", active ? "mh-sidebar-item--active" : ""].join(" ")}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
          active
            ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.14)]"
            : "border-white/10 bg-white/[0.02] text-[var(--mh-text-muted)]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-base font-medium">{label}</span>
    </Link>
  );
}
