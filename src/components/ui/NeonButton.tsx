import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type NeonButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";

interface SharedProps {
  children: ReactNode;
  variant?: NeonButtonVariant;
  className?: string;
}

type LinkProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

const variantClassNames: Record<NeonButtonVariant, string> = {
  primary: "mh-btn-primary",
  secondary: "mh-btn-secondary",
  ghost: "mh-btn-ghost",
  success: "mh-btn-success",
  danger: "mh-btn-danger",
};

function getClassName(variant: NeonButtonVariant, className?: string) {
  return ["mh-btn", variantClassNames[variant], className].filter(Boolean).join(" ");
}

export function NeonButton(props: LinkProps | ButtonProps) {
  if ("href" in props && props.href) {
    const { children, variant = "primary", className, href, ...rest } = props;
    const resolvedClassName = getClassName(variant, className);

    return (
      <Link href={href} className={resolvedClassName} {...rest}>
        {children}
      </Link>
    );
  }

  const { children, variant = "primary", className, ...rest } = props as ButtonProps;
  const resolvedClassName = getClassName(variant, className);

  return (
    <button {...rest} className={resolvedClassName}>
      {children}
    </button>
  );
}
