import { NeonCard } from "@/components/ui/NeonCard";

export function ResultsLoadingState() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <NeonCard padding="md">
          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="h-[240px] w-full max-w-[220px] animate-pulse rounded-[28px] border border-cyan-300/18 bg-cyan-400/10 motion-reduce:animate-none" />
            </div>

            <div className="space-y-4">
              <div className="h-5 w-36 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
              <div className="h-12 w-full max-w-[360px] animate-pulse rounded-[24px] bg-white/10 motion-reduce:animate-none" />
              <p className="text-lg font-semibold text-white">MatHero пресмята резултата ти...</p>
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                Проверяваме отговорите и обновяваме напредъка.
              </p>
              <div className="h-10 w-full max-w-[260px] animate-pulse rounded-full border border-cyan-300/18 bg-cyan-400/10 motion-reduce:animate-none" />
            </div>
          </div>
        </NeonCard>

        <NeonCard padding="md">
          <div className="space-y-4">
            <div className="h-5 w-40 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
            <div className="h-10 w-48 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
            <div className="h-12 w-24 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
            <div className="h-4 w-20 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
          </div>
        </NeonCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <NeonCard key={index} padding="sm">
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
              <div className="h-8 w-20 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
              <div className="h-4 w-32 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
            </div>
          </NeonCard>
        ))}
      </section>

      <NeonCard padding="md">
        <div className="space-y-4">
          <div className="h-5 w-56 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
          <div className="h-3 overflow-hidden rounded-full bg-white/8">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-cyan-300/40 motion-reduce:animate-none" />
          </div>
          <div className="h-4 w-40 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
        </div>
      </NeonCard>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <NeonCard padding="md">
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
            <div className="h-24 animate-pulse rounded-[24px] bg-white/8 motion-reduce:animate-none" />
            <div className="h-24 animate-pulse rounded-[24px] bg-white/8 motion-reduce:animate-none" />
          </div>
        </NeonCard>

        <NeonCard padding="sm">
          <div className="space-y-3">
            <div className="h-4 w-28 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
            <div className="h-12 animate-pulse rounded-[18px] bg-white/8 motion-reduce:animate-none" />
            <div className="h-12 animate-pulse rounded-[18px] bg-white/8 motion-reduce:animate-none" />
            <div className="h-12 animate-pulse rounded-[18px] bg-white/8 motion-reduce:animate-none" />
          </div>
        </NeonCard>
      </section>
    </div>
  );
}
