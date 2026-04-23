interface WeakTopicCardProps {
  topic: string;
  score: number;
}

export function WeakTopicCard({ topic, score }: WeakTopicCardProps) {
  return (
    <article className="rounded-[24px] border border-fuchsia-400/20 bg-[linear-gradient(180deg,rgba(40,18,56,0.86),rgba(25,21,39,0.94))] p-4 text-white shadow-[0_0_24px_rgba(248,78,200,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-300/80">
        Нужда от повторение
      </p>
      <h3 className="mt-2 font-display text-xl">{topic}</h3>
      <p className="mt-2 text-sm text-slate-300">Среден резултат: {score}%</p>
    </article>
  );
}
