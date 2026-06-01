"use client";

import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";

interface BrandMarkProps {
  layout?: "row" | "stacked";
  title?: string;
  subtitle?: string;
  size?: "sm" | "md";
  animated?: boolean;
  iconShellClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  className?: string;
}

const sizeStyles = {
  sm: {
    shell: "h-12 w-12 rounded-2xl p-2",
    title: "text-[1.9rem]",
  },
  md: {
    shell: "h-16 w-16 rounded-3xl p-2",
    title: "text-4xl",
  },
};

export function BrandMark({
  layout = "row",
  title = "MatHero",
  subtitle = "Математика с ритъм",
  size = "sm",
  animated = false,
  iconShellClassName = "",
  titleClassName = "",
  subtitleClassName = "",
  className = "",
}: BrandMarkProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={[
        "text-white",
        layout === "stacked" ? "inline-flex flex-col items-center gap-3 text-center" : "flex items-center gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "mh-card-muted flex shrink-0 items-center justify-center",
          styles.shell,
          iconShellClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <AnimatedHeroMascot size="sm" animated={animated} />
      </div>

      <div className={layout === "stacked" ? "space-y-2" : "min-w-0"}>
        <p
          className={[
            "font-logo font-extrabold leading-none text-white",
            styles.title,
            titleClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {title}
        </p>
        {subtitle ? (
          <p
            className={[
              layout === "stacked"
                ? "mh-copy-sm font-medium"
                : "mt-1 truncate text-sm leading-6 text-[var(--mh-text-muted)]",
              subtitleClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
