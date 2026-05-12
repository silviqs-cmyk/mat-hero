import type { ReactNode } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface PageHeroHeaderProps {
  label: string;
  title: ReactNode;
  action?: ReactNode;
  description?: ReactNode;
}

export function PageHeroHeader({
  label,
  title,
  action,
  description,
}: PageHeroHeaderProps) {
  return (
    <>
      <SectionHeader label={label} title={title} action={action} />
      {description ? <p className="mh-copy-muted mt-3 max-w-3xl text-[1rem]">{description}</p> : null}
    </>
  );
}
