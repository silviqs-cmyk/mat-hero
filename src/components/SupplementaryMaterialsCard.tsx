import type { DailyTaskSet, PracticeTask } from "@/types";

interface SupplementaryMaterialsCardProps {
  tasks: DailyTaskSet;
}

function getCorrectAnswerIndex(correctAnswerKey: string): number {
  const match = correctAnswerKey.match(/(\d+)/);
  return match ? Number(match[1]) - 1 : -1;
}

function TaskAccordion({
  title,
  subtitle,
  accentClassName,
  badgeClassName,
  tasks,
  emptyText,
}: {
  title: string;
  subtitle: string;
  accentClassName: string;
  badgeClassName: string;
  tasks: PracticeTask[];
  emptyText: string;
}) {
  return (
    <article className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_28%),linear-gradient(180deg,rgba(12,16,29,0.98),rgba(7,10,18,0.98))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.55)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${accentClassName}`}>
            {title}
          </p>
          <h3 className="mt-2 font-display text-2xl text-white">{subtitle}</h3>
        </div>
        <div className={`rounded-full border border-white/10 px-3 py-1 text-xs font-semibold shadow-[0_0_18px_rgba(255,255,255,0.06)] ${badgeClassName}`}>
          {tasks.length} задачи
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">{emptyText}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {tasks.map((task, index) => {
            const correctIndex = getCorrectAnswerIndex(task.correctAnswerKey);

            return (
              <details
                key={`${task.question}-${index}`}
                className="group rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                        Задача {index + 1}
                      </p>
                      <h4 className="mt-2 text-base font-semibold leading-6 text-white">
                        {task.question}
                      </h4>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/60 transition group-open:border-cyan-400/40 group-open:bg-cyan-400/10 group-open:text-cyan-100 group-open:shadow-[0_0_18px_rgba(37,221,255,0.14)]">
                      Виж решение
                    </span>
                  </div>
                </summary>

                <div className="mt-4 grid gap-2">
                  {task.answers.map((answer, answerIndex) => {
                    const isCorrect = answerIndex === correctIndex;

                    return (
                      <div
                        key={`${answer}-${answerIndex}`}
                        className={`rounded-2xl border px-3 py-2 text-sm ${
                          isCorrect
                            ? `${badgeClassName} border-transparent text-white shadow-[0_0_18px_rgba(37,221,255,0.12)]`
                            : "border-white/10 bg-black/10 text-white/75"
                        }`}
                      >
                        <span className="font-semibold">{String.fromCharCode(65 + answerIndex)}.</span>{" "}
                        {answer}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-2xl border border-white/8 bg-black/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Обяснение
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{task.explanation}</p>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function SupplementaryMaterialsCard({ tasks }: SupplementaryMaterialsCardProps) {
  return (
    <section className="space-y-5 lg:col-span-2">
      <TaskAccordion
        title="Основни задачи"
        subtitle="Задължителна тренировка за деня"
        accentClassName="text-cyan-300"
        badgeClassName="bg-cyan-400/12 text-cyan-100"
        tasks={tasks.main}
        emptyText="Още няма качени основни задачи за този ден."
      />

      <TaskAccordion
        title="Допълнителни задачи"
        subtitle="Бонус пакет за по-силен резултат"
        accentClassName="text-pink-300"
        badgeClassName="bg-pink-400/12 text-pink-100"
        tasks={tasks.extra}
        emptyText="Още няма качени допълнителни задачи за този ден."
      />
    </section>
  );
}
