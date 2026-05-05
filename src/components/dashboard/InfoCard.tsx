import type { ReactNode } from "react";
import { NeonCard } from "@/components/ui/NeonCard";

interface InfoCardProps {
  label: string;
  children: ReactNode;
  tone?: "cyan" | "purple";
  icon?: ReactNode;
}

export function InfoCard({ label, children, tone = "cyan", icon }: InfoCardProps) {
  return (
    <NeonCard as="article" tone={tone} padding="md">
      <div className="flex items-center gap-3">
        {icon ? <span className="text-[var(--mh-accent-cyan-soft)]">{icon}</span> : null}
        <p className="mh-label">{label}</p>
      </div>
      <div className="mt-5 space-y-3 text-[1.05rem] leading-8 text-[var(--mh-text)]">{children}</div>
    </NeonCard>
  );
}
