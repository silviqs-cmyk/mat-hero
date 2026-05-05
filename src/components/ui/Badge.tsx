import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "cyan" | "purple" | "green" | "gold" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

export function Badge({ children, tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={["mh-badge", `mh-badge--${tone}`, className].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}
