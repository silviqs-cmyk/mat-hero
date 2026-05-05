import type { ReactNode } from "react";

interface SectionHeaderProps {
  label: string;
  title: ReactNode;
  action?: ReactNode;
  align?: "start" | "center";
}

export function SectionHeader({
  label,
  title,
  action,
  align = "start",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-wrap justify-between gap-4 ${
        align === "center" ? "items-center" : "items-start"
      }`}
    >
      <div>
        <p className="mh-label">{label}</p>
        <div className="mt-3">
          {typeof title === "string" ? <h2 className="mh-heading-xl">{title}</h2> : title}
        </div>
      </div>
      {action}
    </div>
  );
}
