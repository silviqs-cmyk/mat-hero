import Image from "next/image";
import { Heart } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="hidden border-t border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(32,55,112,0.16),transparent_58%),linear-gradient(180deg,rgba(4,10,24,0.94),rgba(3,8,19,0.98))] md:block">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 border-t border-white/8 pt-5 text-center">
          <p className="text-sm font-medium tracking-[0.08em] text-white/60">
            © 2026 MatHero. Всички права запазени.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <p className="inline-flex items-center gap-2 text-sm text-white/70">
              Създаден за вас с{" "}
              <Heart className="h-4 w-4 fill-fuchsia-400 text-fuchsia-300 drop-shadow-[0_0_10px_rgba(232,121,249,0.95)]" />{" "}
              от
            </p>

            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/brands/new-era-edu-footer-logo.png"
                  alt="NEW ERA EDU bird mark"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>

              <div className="text-left text-lg font-semibold tracking-[0.22em]">
                <span className="text-white">NEW ERA </span>
                <span className="text-cyan-300">EDU™</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
