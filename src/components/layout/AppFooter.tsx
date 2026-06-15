import Image from "next/image";
import { Heart } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="hidden border-t border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(32,55,112,0.16),transparent_58%),linear-gradient(180deg,rgba(4,10,24,0.94),rgba(3,8,19,0.98))] md:block">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 border-t border-white/8 pt-5 text-center">
          <p className="text-sm font-medium tracking-[0.08em] text-white/60">© 2026 MatHero. Всички права запазени.</p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <p className="inline-flex items-center gap-2 text-sm text-white/70">
              Създаден за вас с <Heart className="h-4 w-4 fill-pink-400 text-pink-400" /> от
            </p>

            <div className="relative h-10 w-[13.5rem] shrink-0">
              <Image
                src="/brands/new-era-edu-mathhero-footer.png"
                alt="NEW ERA EDU"
                fill
                sizes="216px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
