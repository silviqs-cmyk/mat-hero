import type { HTMLAttributes, ReactNode } from "react";

type NeonCardTone = "default" | "cyan" | "purple" | "green" | "gold" | "muted";

interface NeonCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "section" | "article" | "aside" | "div";
  tone?: NeonCardTone;
  padding?: "sm" | "md" | "lg";
  hoverable?: boolean;
}

const toneClasses: Record<NeonCardTone, string> = {
  default: "mh-card",
  cyan: "mh-card mh-card-cyan",
  purple: "mh-card mh-card-purple",
  green: "mh-card mh-card-green",
  gold: "mh-card mh-card-gold",
  muted: "mh-card-muted",
};

const paddingClasses = {
  sm: "p-4 md:p-5",
  md: "p-4 md:p-5",
  lg: "p-4 md:p-6",
};

export function NeonCard({
  children,
  as = "section",
  tone = "default",
  padding = "md",
  hoverable = false,
  className,
  ...rest
}: NeonCardProps) {
  const Component = as;
  const resolvedClassName = [
    toneClasses[tone],
    paddingClasses[padding],
    hoverable ? "mh-hover-lift" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component {...rest} className={resolvedClassName}>
      {children}
    </Component>
  );
}
