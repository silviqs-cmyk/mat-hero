import { ExplanationSteps } from "@/components/ExplanationSteps";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { demoQuestions } from "@/lib/demoData";
import { formatExplanationSteps } from "@/lib/explanations";
import { getPracticeQuestionById } from "@/lib/practiceQuestions";

interface ExplanationPageProps {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ fromDay?: string; mode?: string; questionIndex?: string }>;
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
      <NeonCard padding="sm">
        <p className="mh-copy-muted">Няма обяснение за този въпрос.</p>
      </NeonCard>
    );
  }

  const fromDay = Number(resolvedSearchParams.fromDay ?? question.day_id);
  const mode = resolvedSearchParams.mode === "extra" ? "extra" : "main";
  const questionIndex = Number(resolvedSearchParams.questionIndex ?? "0");
  const questionIndexParam =
    Number.isFinite(questionIndex) && questionIndex > 0
      ? `&questionIndex=${questionIndex}`
      : questionIndex === 0
        ? "&questionIndex=0"
        : "";
  const backHref = fromDay > 0 ? `/quiz/${fromDay}?mode=${mode}${questionIndexParam}` : "/dashboard";
  const formattedSteps = formatExplanationSteps(question.explanation_steps);

  return (
    <div className="space-y-6">
      <NeonCard padding="md">
        <SectionHeader
          label="Задача"
          title={<h2 className="mh-heading-lg">{question.question_text}</h2>}
        />
        <p className="mt-3 text-[1rem] text-slate-400">Тема: {question.topic}</p>
      </NeonCard>

      <ExplanationSteps steps={formattedSteps} />

      <NeonButton href={backHref} variant="secondary">
        Обратно към теста
      </NeonButton>
    </div>
  );
}
