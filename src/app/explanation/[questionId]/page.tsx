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
      <div className="rounded-[28px] bg-white p-5 shadow-soft">
        <p className="text-sm text-slate-600">Няма обяснение за този въпрос.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
          Задача
        </p>
        <h2 className="mt-3 font-display text-3xl text-slate-900">{question.question_text}</h2>
        <p className="mt-3 text-sm text-slate-600">Тема: {question.topic}</p>
      </section>

      <ExplanationSteps steps={question.explanation_steps} />

      <Link
        href={`/quiz/${question.day_id}`}
        className="block rounded-full bg-slate-950 px-5 py-4 text-center text-sm font-semibold text-white"
      >
        Обратно към куиза
      </Link>
    </div>
  );
}
