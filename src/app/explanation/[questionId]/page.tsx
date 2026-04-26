import Link from "next/link";
import { ExplanationSteps } from "@/components/ExplanationSteps";
import { demoQuestions } from "@/lib/demoData";
import { getPracticeQuestionById } from "@/lib/practiceQuestions";

interface ExplanationPageProps {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ fromDay?: string; mode?: string }>;
}

export default async function ExplanationPage({
  params,
  searchParams,
}: ExplanationPageProps) {
  const { questionId } = await params;
  const resolvedSearchParams = await searchParams;
  const numericQuestionId = Number(questionId);
  const question =
    getPracticeQuestionById(numericQuestionId) ??
    demoQuestions.find((item) => item.id === numericQuestionId) ??
    null;

  if (!question) {
    return (
      <div className="panel rounded-[28px] p-5">
        <p className="text-sm text-[var(--muted)]">Няма обяснение за този въпрос.</p>
      </div>
    );
  }

  const fromDay = Number(resolvedSearchParams.fromDay ?? question.day_id);
  const mode = resolvedSearchParams.mode === "extra" ? "extra" : "main";
  const backHref =
    fromDay > 0 ? `/quiz/${fromDay}${mode === "extra" ? "?mode=extra" : ""}` : "/dashboard";

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
        href={backHref}
        className="btn-neon-outline block rounded-2xl px-5 py-4 text-center text-sm font-semibold"
      >
        Обратно към теста
      </Link>
    </div>
  );
}
