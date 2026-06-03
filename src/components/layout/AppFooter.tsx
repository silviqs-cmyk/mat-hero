export function AppFooter() {
  return (
    <footer className="hidden border-t border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(32,55,112,0.16),transparent_58%),linear-gradient(180deg,rgba(4,10,24,0.94),rgba(3,8,19,0.98))] md:block">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-3 border-t border-white/8 pt-5 text-center">
          <p className="text-sm font-medium tracking-[0.08em] text-white/60">
            © 2026 Mat Hero. Всички права запазени.
          </p>
          <p className="text-sm text-white/70">Създаден с ❤️ за Вас.</p>
        </div>
      </div>
    </footer>
  );
}
