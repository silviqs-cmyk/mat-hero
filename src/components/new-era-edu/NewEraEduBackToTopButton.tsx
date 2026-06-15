"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function NewEraEduBackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 280);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <a
      href="#nachalo"
      aria-label="Нагоре"
      className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-500 px-6 py-4 text-base font-medium text-white shadow-[0_16px_34px_rgba(59,130,246,0.22)] transition hover:-translate-y-[1px] md:bottom-8 md:right-8"
    >
      <ArrowUp className="h-4 w-4" />
      Нагоре
    </a>
  );
}
