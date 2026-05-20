import { AchievementBadge } from "@/components/AchievementBadge";
import { ProfileSignOutButton } from "@/components/profile/ProfileSignOutButton";
import { ScoreCard } from "@/components/ScoreCard";
import { WeakTopicCard } from "@/components/WeakTopicCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { requireStudent } from "@/lib/auth/server";
import { resolveCourseProgress } from "@/lib/progress";
import { buildLessonTopicHref, formatTopicLabel } from "@/lib/topicLabels";
import {
  getDefaultCourseServer,
  getUserCourseProgressServer,
  getUserQuizDaySummariesServer,
  getUserTopicDiagnosticsServer,
  listUserResultsServer,
} from "@/services/studentContent.server";

function getReadinessLabel(score: number) {
  if (score >= 80) {
    return "Стабилно знание";
  }

  if (score >= 65) {
    return "Добра основа";
  }

  if (score >= 50) {
    return "Иска още упражнения";
  }

  return "Нужен е преговор";
}

function getReadinessTone(score: number) {
  if (score >= 80) {
    return "green" as const;
  }

  if (score >= 65) {
    return "cyan" as const;
  }

  if (score >= 50) {
    return "purple" as const;
  }

  return "gold" as const;
}

function getProfileName(fullName: string | null, email: string | null) {
  if (fullName?.trim()) {
    return fullName.trim();
  }

  if (email) {
    return email.split("@")[0] ?? "Потребител";
  }

  return "Потребител";
}

export default async function ProfilePage() {
  const { profile, onboardingMessage } = await requireStudent();

  if (!profile) {
    return (
      <EmptyState
        title="Профилът още не е готов"
        description={onboardingMessage ?? "Опитай отново след малко."}
      />
    );
  }

  const course = await getDefaultCourseServer();

  if (!course) {
    return (
      <EmptyState
        title="Няма активен курс"
        description="Default курсът nvo-matematika-7-klas липсва или не е публикуван."
      />
    );
  }

  const [progress, results, topicDiagnostics, derivedQuizResults] = await Promise.all([
    getUserCourseProgressServer(profile.id, course.id),
    listUserResultsServer(profile.id, course.id),
    getUserTopicDiagnosticsServer(profile.id, course.id),
    getUserQuizDaySummariesServer(profile.id, course.id),
  ]);

  const effectiveResults =
    results.length > 0
      ? results.map((result) => ({
          percentage: result.percentage,
          score: result.score,
          totalQuestions: result.total_questions,
          weakTopics: result.weak_topics,
          dayNumber: course.days.find((day) => day.id === result.course_day_id)?.day_number ?? null,
          completedAt: result.completed_at,
        }))
      : derivedQuizResults.map((result) => ({
          percentage: result.percentage,
          score: result.score,
          totalQuestions: result.totalQuestions,
          weakTopics: result.weakTopics,
          dayNumber: result.dayNumber,
          completedAt: result.completedAt,
        }));
  const latestResult = effectiveResults[0] ?? null;
  const averageResult =
    effectiveResults.length > 0
      ? Math.round(effectiveResults.reduce((sum, result) => sum + result.percentage, 0) / effectiveResults.length)
      : 0;
  const strongestTopic = topicDiagnostics[0] ?? null;
  const weakestTopic = topicDiagnostics.length > 0 ? topicDiagnostics[topicDiagnostics.length - 1] ?? null : null;
  const testedTopicsCount = topicDiagnostics.length;
  const weakTopicsFromResults = Array.from(
    new Set(effectiveResults.flatMap((result) => result.weakTopics).filter(Boolean)),
  );
  const displayedWeakTopics =
    topicDiagnostics.length > 0
      ? [...topicDiagnostics].sort((left, right) => left.score - right.score).slice(0, 3)
      : weakTopicsFromResults.map((topic) => ({
          topic,
          score: 0,
          correctCount: 0,
          totalCount: 0,
          dayNumbers: [],
        }));
  const recommendation =
    weakestTopic?.topic
      ? `Повтори темата ${formatTopicLabel(weakestTopic.topic).toLocaleLowerCase("bg-BG")} и после мини още веднъж през кратък тест.`
      : "Реши няколко теста, за да направим по-точна диагностика.";
  const improvement =
    effectiveResults.length >= 2
      ? Math.max(0, effectiveResults[0].percentage - effectiveResults[effectiveResults.length - 1].percentage)
      : Math.max(0, (latestResult?.percentage ?? 0) - 55);
  const resolvedProgress = resolveCourseProgress({
    progress,
    resultDayNumbers: effectiveResults.map((result) => result.dayNumber),
    totalDays: course.duration_days,
  });
  const completedDayNumbers = resolvedProgress.completedDayNumbers;
  const currentDayValue = resolvedProgress.currentDayNumber;
  const xpValue =
    progress?.total_xp ??
    effectiveResults.reduce((sum, result) => sum + result.score + 25, 0);
  const streakValue = progress?.streak_days ?? effectiveResults.length;
  const completedDaysLabel = `${resolvedProgress.completedDaysCount}/${course.duration_days}`;

  return (
    <div className="space-y-5 lg:mx-auto lg:max-w-5xl">
      <NeonCard padding="md">
        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <SectionHeader label="Профил" title={<h2 className="mh-heading-lg">{getProfileName(profile.full_name, profile.email)}</h2>} />
            <ProfileSignOutButton />
          </div>

          <NeonCard as="div" tone="muted" padding="sm" className="space-y-3 rounded-[24px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Имейл</p>
              <p className="mt-2 text-sm text-white">{profile.email ?? "Няма свързан имейл"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Статус</p>
              <p className="mt-2 text-sm text-white">Регистриран профил</p>
            </div>
          </NeonCard>
        </div>
      </NeonCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ScoreCard title="Текущ ден" value={`${currentDayValue}`} helper={`от ${course.duration_days}`} accent="cyan" />
        <ScoreCard title="XP" value={`${xpValue}`} helper="натрупан опит" accent="lime" />
        <ScoreCard title="Серия" value={`${streakValue}`} helper="последователни теста" accent="pink" />
        <ScoreCard title="Завършени дни" value={completedDaysLabel} helper="отключен напредък" accent="purple" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <ScoreCard title="Подобрение" value={`+${improvement}%`} helper="спрямо първите резултати" accent="lime" />
        <ScoreCard title="Последен тест" value={`${latestResult?.percentage ?? 0}%`} helper="последен реален резултат" accent="cyan" />
      </section>

      <NeonCard padding="md">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="mh-heading-lg">Диагностика на знанията</h2>
            <p className="mh-copy-muted mt-2">
              Оценката е изградена от реалните резултати и отговори в Supabase.
            </p>
          </div>
          <Badge tone={getReadinessTone(averageResult)}>
            {testedTopicsCount > 0 ? getReadinessLabel(averageResult) : "Очаква първи тест"}
          </Badge>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <ScoreCard
            title="Обща готовност"
            value={testedTopicsCount > 0 ? `${averageResult}%` : "0%"}
            helper={testedTopicsCount > 0 ? "средно от реалните резултати" : "няма натрупани тестове"}
            accent="cyan"
          />
          <ScoreCard
            title="Диагностирани теми"
            value={`${testedTopicsCount}`}
            helper="теми с реални данни"
            accent="purple"
          />
          <ScoreCard
            title="Фокус сега"
            value={weakestTopic ? `${weakestTopic.score}%` : "—"}
            helper={weakestTopic ? formatTopicLabel(weakestTopic.topic) : "премини първия тест"}
            accent="pink"
          />
        </div>

        {testedTopicsCount > 0 ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <NeonCard as="div" tone="green" padding="sm" className="rounded-[24px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-200">Най-стабилна тема</p>
              <h3 className="mt-2 font-display text-xl text-white">{strongestTopic ? formatTopicLabel(strongestTopic.topic) : null}</h3>
              <p className="mt-2 text-slate-200">Готовност: {strongestTopic?.score}%. Тук вече имаш добра опора.</p>
            </NeonCard>

            <NeonCard as="div" tone="purple" padding="sm" className="rounded-[24px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">Тема за натиск</p>
              <h3 className="mt-2 font-display text-xl text-white">{weakestTopic ? formatTopicLabel(weakestTopic.topic) : null}</h3>
              <p className="mt-2 text-slate-200">
                Готовност: {weakestTopic?.score}%. Тук си струва да върнеш урока и да решиш още няколко задачи.
              </p>
            </NeonCard>
          </div>
        ) : (
          <p className="mt-5 rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-slate-300">
            Реши няколко теста, за да направим диагностика.
          </p>
        )}

        {testedTopicsCount > 0 ? (
          <div className="mt-5 space-y-3">
            {[...topicDiagnostics].sort((left, right) => right.score - left.score).map((item) => (
              <div key={item.topic} className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-white">{formatTopicLabel(item.topic)}</p>
                  <p className="mt-1 text-xs text-white/55">
                    {item.dayNumbers.length > 0 ? `Дни ${item.dayNumbers.join(", ")}` : "Без ден"}
                  </p>
                </div>
                <Badge tone={getReadinessTone(item.score)}>
                  {item.score}% • {getReadinessLabel(item.score)}
                </Badge>
              </div>
            ))}
          </div>
        ) : null}
      </NeonCard>

      <NeonCard padding="md">
        <h2 className="mh-heading-lg">Теми за преговор</h2>
        <div className="mt-4 space-y-3">
          {displayedWeakTopics.length > 0 ? (
            displayedWeakTopics.map((topic) => (
              <WeakTopicCard
                key={topic.topic}
                topic={topic.topic}
                score={topic.score}
                href={topic.dayNumbers[0] ? buildLessonTopicHref(course.slug, topic.dayNumbers[0], topic.topic) : undefined}
              />
            ))
          ) : (
            <p className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-slate-300">
              Реши няколко теста, за да направим диагностика.
            </p>
          )}
        </div>
      </NeonCard>

      <NeonCard tone="green" padding="md">
        <h2 className="mh-heading-lg">Какво да направиш утре</h2>
        <p className="mh-copy-muted mt-3">{recommendation}</p>
      </NeonCard>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AchievementBadge label="XP герой" unlocked={xpValue >= 200} />
        <AchievementBadge label="3 дни" unlocked={completedDayNumbers.length >= 3} />
        <AchievementBadge label="80%+" unlocked={(latestResult?.percentage ?? 0) >= 80} />
      </section>
    </div>
  );
}
