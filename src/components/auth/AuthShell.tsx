import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  hideIntro?: boolean;
  hideHeader?: boolean;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  hideIntro = false,
  hideHeader = false,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(34,211,238,0.1),transparent_18%)]" />

      <div className="relative z-10 w-full max-w-md">
        {!hideHeader ? (
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex flex-col items-center gap-3 text-white transition">
              <BrandMark
                layout="stacked"
                size="md"
                subtitle="Учи уверено. Решавай смело."
                titleClassName="font-black tracking-tight"
              />
            </Link>
          </div>
        ) : null}

        {!hideIntro ? (
          <div className="mb-6 text-center">
            <SectionLabel>{eyebrow}</SectionLabel>
            <h1 className="mh-heading-lg mt-3">{title}</h1>
            <p className="mh-copy mt-3">{description}</p>
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
