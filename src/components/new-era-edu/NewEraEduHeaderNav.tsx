"use client";

import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

type NewEraEduHeaderNavProps = {
  items: readonly NavItem[];
};

export function NewEraEduHeaderNav({ items }: NewEraEduHeaderNavProps) {
  const [activeHref, setActiveHref] = useState(items[0]?.href ?? "#nachalo");

  useEffect(() => {
    const updateActiveHref = () => {
      const nextHash = window.location.hash || items[0]?.href || "#nachalo";
      setActiveHref(nextHash);
    };

    updateActiveHref();
    window.addEventListener("hashchange", updateActiveHref);

    return () => {
      window.removeEventListener("hashchange", updateActiveHref);
    };
  }, [items]);

  return (
    <nav className="hidden min-w-0 items-center justify-center lg:flex">
      <div className="flex w-full max-w-[36rem] items-center justify-between gap-4 xl:max-w-[38rem] xl:gap-6">
        {items.map((item) => {
          const isActive = activeHref === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setActiveHref(item.href)}
              className={[
                "new-era-nav-link relative whitespace-nowrap text-[0.95rem] font-normal tracking-[0.01em] xl:text-base",
                isActive ? "text-white" : "text-white/82 hover:text-white",
              ].join(" ")}
            >
              {item.label}
              {isActive ? (
                <span className="absolute -bottom-3 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-white via-cyan-100 to-cyan-300" />
              ) : null}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
