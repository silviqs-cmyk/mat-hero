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
        <p className="mh-label leading-none tracking-[0.06em]">{label}</p>
      </div>
      <div className="mt-3 max-w-3xl space-y-4 text-base leading-[1.68] font-normal text-[var(--mh-text)]">
        {children}
      </div>
    </NeonCard>
  );
}
