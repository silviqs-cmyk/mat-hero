import Link from "next/link";

interface SupplementaryMaterialsCardProps {
  title: string;
  description: string;
}

export function SupplementaryMaterialsCard({
  title,
  description,
}: SupplementaryMaterialsCardProps) {
  return (
    <article className="panel rounded-[24px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime-300">
        Допълнителни материали
      </p>
      <h3 className="mt-2 font-display text-xl text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
      <Link
        href="/roadmap"
        className="btn-neon-outline mt-4 inline-flex rounded-2xl px-4 py-2 text-sm font-semibold"
      >
        Прегледай още мисии
      </Link>
    </article>
  );
}
