interface SectionLabelProps {
  children: string;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return <p className={["mh-label", className].filter(Boolean).join(" ")}>{children}</p>;
}
