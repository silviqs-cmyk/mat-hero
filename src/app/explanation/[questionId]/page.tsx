import Link from "next/link";
import { ExplanationSteps } from "@/components/ExplanationSteps";
import { demoQuestions } from "@/lib/demoData";

interface ExplanationPageProps {
  params: Promise<{ questionId: string }>;
}

export default async function ExplanationPage({ params }: ExplanationPageProps) {
  const { questionId } = await params;
  const question = demoQuestions.find((item) => item.id === Number(questionId));

  if (!question) {
    return (
      <div className="panel rounded-[28px] p-5">
        <p className="text-sm text-[var(--muted)]">Няма обяснение за този въпрос.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="panel-glow rounded-[28px] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          Задача
        </p>
        <h2 className="mt-3 font-display text-3xl text-white">{question.question_text}</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">Тема: {question.topic}</p>
      </section>

      <ExplanationSteps steps={question.explanation_steps} />

      <Link
        href={`/quiz/${question.day_id}`}
        className="btn-neon-outline block rounded-2xl px-5 py-4 text-center text-sm font-semibold"
      >
        Обратно към теста
      </Link>
    </div>
  );
}
