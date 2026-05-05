import type { ReactNode } from "react";
import { NeonCard } from "@/components/ui/NeonCard";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <NeonCard padding="md" className="text-center">
      <h2 className="mh-heading-lg">{title}</h2>
      <p className="mh-copy-muted mt-3">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </NeonCard>
  );
}
