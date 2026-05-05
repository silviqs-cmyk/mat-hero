import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  tone?: "amber" | "gold" | "cyan";
}

const toneClassNames = {
  amber: "mh-icon-shell mh-icon-shell--gold",
  gold: "mh-icon-shell mh-icon-shell--purple",
  cyan: "mh-icon-shell mh-icon-shell--cyan",
};

export function StatCard({ icon: Icon, value, label, tone = "cyan" }: StatCardProps) {
  return (
    <div className="mh-stat-card">
      <span className={`flex h-12 w-12 items-center justify-center rounded-full ${toneClassNames[tone]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="mh-stat-value">{value}</p>
        <p className="mh-stat-label">{label}</p>
      </div>
    </div>
  );
}
