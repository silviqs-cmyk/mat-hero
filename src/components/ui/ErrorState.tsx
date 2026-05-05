import type { ReactNode } from "react";
import { NeonCard } from "@/components/ui/NeonCard";

interface ErrorStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <NeonCard padding="md" tone="purple">
      <p className="mh-label text-rose-300">Грешка</p>
      <h2 className="mt-3 text-2xl font-bold text-white">{title}</h2>
      <p className="mt-3 text-slate-300">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </NeonCard>
  );
}
