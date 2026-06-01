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
      className={[
        "mh-sidebar-item group relative overflow-hidden rounded-[18px] border transition-all duration-200",
        active
          ? "mh-sidebar-item--active border-cyan-400/24 bg-[linear-gradient(90deg,rgba(34,211,238,0.12),rgba(168,85,247,0.08))] shadow-[0_0_24px_rgba(34,211,238,0.12)]"
          : "border-white/8 bg-white/[0.02] hover:border-cyan-400/18 hover:bg-[linear-gradient(90deg,rgba(34,211,238,0.08),rgba(168,85,247,0.05))] hover:shadow-[0_0_20px_rgba(34,211,238,0.08)]",
      ].join(" ")}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 ${
          active
            ? "border-cyan-300/34 bg-[linear-gradient(180deg,rgba(37,99,235,0.22),rgba(34,211,238,0.12))] text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.18)]"
            : "border-white/10 bg-white/[0.03] text-[var(--mh-text-muted)] group-hover:border-cyan-300/20 group-hover:text-cyan-100 group-hover:shadow-[0_0_18px_rgba(34,211,238,0.1)]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span
        className={`text-base font-medium transition-all duration-200 ${
          active
            ? "text-white [text-shadow:0_0_14px_rgba(34,211,238,0.22)]"
            : "text-white/86 group-hover:text-white group-hover:[text-shadow:0_0_12px_rgba(34,211,238,0.18)]"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
