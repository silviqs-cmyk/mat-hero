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
  type TopicDiagnostic,
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

function normalizeTopicName(topic: string) {
  return formatTopicLabel(topic)
    .toLocaleLowerCase("bg-BG")
    .replace(/\s+/g, " ")
    .trim();
}

function groupTopicDiagnosticsForDisplay(topicDiagnostics: TopicDiagnostic[]) {
  const groupedTopics = new Map<string, TopicDiagnostic>();

  for (const topicDiagnostic of topicDiagnostics) {
    const displayTopic = formatTopicLabel(topicDiagnostic.topic);
    const normalizedTopic = normalizeTopicName(displayTopic);
    const existingTopic = groupedTopics.get(normalizedTopic);
    const mergedDayNumbers = Array.from(
      new Set([...(existingTopic?.dayNumbers ?? []), ...topicDiagnostic.dayNumbers]),
    ).sort((left, right) => left - right);

    if (!existingTopic) {
      groupedTopics.set(normalizedTopic, {
        ...topicDiagnostic,
        topic: displayTopic,
        dayNumbers: mergedDayNumbers,
      });
      continue;
    }

    const selectedTopic =
      topicDiagnostic.score < existingTopic.score
        ? {
            ...topicDiagnostic,
            topic: displayTopic,
          }
        : existingTopic;

    groupedTopics.set(normalizedTopic, {
      ...selectedTopic,
      topic: displayTopic,
      dayNumbers: mergedDayNumbers,
    });
  }

  return Array.from(groupedTopics.values());
}

function getStatusMessage(
  averageResult: number,
  latestPercentage: number,
  weakestTopic: TopicDiagnostic | null,
  testedTopicsCount: number,
) {
  if (testedTopicsCount === 0) {
    return "Мини един кратък тест, за да подредим най-полезната следваща стъпка.";
  }

  if (averageResult >= 75) {
    return "Държиш добра основа. Продължи със смесени задачи, за да затвърдиш темпото.";
  }

  if (latestPercentage >= 60) {
    return weakestTopic
      ? `Имаш база. Един спокоен преговор на ${formatTopicLabel(weakestTopic.topic).toLocaleLowerCase("bg-BG")} ще помогне най-много.`
      : "Имаш база. Един кратък преговор сега ще вдигне следващия резултат.";
  }

  return weakestTopic
    ? `Сега не гони обем. Върни ${formatTopicLabel(weakestTopic.topic).toLocaleLowerCase("bg-BG")} и после мини кратък тест.`
    : "Сега най-много ще помогне кратък преговор и още един спокоен тест.";
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
  const testedTopicsCount = topicDiagnostics.length;
  const weakTopicsFromResults = Array.from(
    new Set(effectiveResults.flatMap((result) => result.weakTopics).filter(Boolean)),
  );
  const groupedTopicDiagnostics = groupTopicDiagnosticsForDisplay(topicDiagnostics);
  const sortedGroupedTopics = [...groupedTopicDiagnostics].sort((left, right) => right.score - left.score);
  const strongestTopic = sortedGroupedTopics[0] ?? null;
  const weakestTopic =
    sortedGroupedTopics.length > 0 ? sortedGroupedTopics[sortedGroupedTopics.length - 1] ?? null : null;
  const reviewTopics =
    groupedTopicDiagnostics.length > 0
      ? [...groupedTopicDiagnostics].sort((left, right) => left.score - right.score).slice(0, 3)
      : weakTopicsFromResults.slice(0, 3).map((topic) => ({
          topic: formatTopicLabel(topic),
          score: 0,
          correctCount: 0,
          totalCount: 0,
          dayNumbers: [],
        }));
  const recommendation =
    weakestTopic?.topic
      ? `Повтори "${formatTopicLabel(weakestTopic.topic)}" и мини кратък тест.`
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
  const xpValue = progress?.total_xp ?? effectiveResults.reduce((sum, result) => sum + result.score + 25, 0);
  const streakValue = progress?.streak_days ?? effectiveResults.length;
  const completedDaysLabel = `${resolvedProgress.completedDaysCount}/${course.duration_days}`;
  const statusMessage = getStatusMessage(
    averageResult,
    latestResult?.percentage ?? 0,
    weakestTopic,
    testedTopicsCount,
  );

  return (
    <div className="space-y-5 lg:mx-auto lg:max-w-5xl">
      <NeonCard padding="md">
        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div className="space-y-3">
            <SectionHeader
              label="Профил"
              title={<h2 className="mh-heading-lg">{getProfileName(profile.full_name, profile.email)}</h2>}
            />
            <ProfileSignOutButton />
          </div>

          <NeonCard as="div" tone="muted" padding="sm" className="rounded-[24px]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Текущ ден</p>
            <p className="mt-3 font-display text-2xl text-white">
              Ден {currentDayValue} от {course.duration_days}
            </p>
          </NeonCard>
        </div>
      </NeonCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ScoreCard title="XP" value={`${xpValue}`} helper="натрупан опит" accent="lime" />
        <ScoreCard title="Серия" value={`${streakValue}`} helper="последователни теста" accent="pink" />
        <ScoreCard title="Завършени дни" value={completedDaysLabel} helper="отключен напредък" accent="purple" />
        <ScoreCard title="Подобрение" value={`+${improvement}%`} helper="спрямо първите резултати" accent="cyan" />
      </section>

      <NeonCard padding="md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="mh-heading-lg">Твоето състояние</h2>
            <p className="mh-copy-muted mt-2">
              Виж къде си сега, какво ти е стабилно и къде да насочиш следващата енергия.
            </p>
          </div>
          <Badge tone={getReadinessTone(averageResult)}>
            {testedTopicsCount > 0 ? getReadinessLabel(averageResult) : "Очаква първи тест"}
          </Badge>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_0.9fr_1.2fr]">
          <ScoreCard
            title="Обща готовност"
            value={testedTopicsCount > 0 ? `${averageResult}%` : "0%"}
            helper={testedTopicsCount > 0 ? "средно от реалните резултати" : "няма натрупани тестове"}
            accent="cyan"
          />
          <ScoreCard
            title="Последен тест"
            value={`${latestResult?.percentage ?? 0}%`}
            helper="последният реален резултат"
            accent="purple"
          />
          <NeonCard as="div" tone="muted" padding="sm" className="rounded-[24px]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Фокус сега</p>
            <h3 className="mt-3 font-display text-2xl text-white">
              {weakestTopic ? formatTopicLabel(weakestTopic.topic) : "Премини първия тест"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{statusMessage}</p>
          </NeonCard>
        </div>
      </NeonCard>

      <NeonCard padding="md">
        <h2 className="mh-heading-lg">Диагностика накратко</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <NeonCard as="div" tone="green" padding="sm" className="rounded-[24px]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-200">Силна страна</p>
            <h3 className="mt-3 font-display text-xl text-white">
              {strongestTopic ? formatTopicLabel(strongestTopic.topic) : "Ще се появи след първия тест"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {strongestTopic ? `Готовност ${strongestTopic.score}%` : "Още няма достатъчно данни."}
            </p>
          </NeonCard>

          <NeonCard as="div" tone="purple" padding="sm" className="rounded-[24px]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">За преговор</p>
            <h3 className="mt-3 font-display text-xl text-white">
              {weakestTopic ? formatTopicLabel(weakestTopic.topic) : "Ще се появи след първия тест"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {weakestTopic ? `Готовност ${weakestTopic.score}%` : "Още няма достатъчно данни."}
            </p>
          </NeonCard>

          <NeonCard as="div" tone="muted" padding="sm" className="rounded-[24px]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Какво да направиш утре</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">{recommendation}</p>
          </NeonCard>
        </div>
      </NeonCard>

      <NeonCard padding="md">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="mh-heading-lg">Теми за преговор</h2>
            <p className="mh-copy-muted mt-2">Показваме само най-важните теми за действие, не целия diagnostics списък.</p>
          </div>
          {groupedTopicDiagnostics.length > 0 ? (
            <Badge tone="neutral">{groupedTopicDiagnostics.length} теми с данни</Badge>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          {reviewTopics.length > 0 ? (
            reviewTopics.map((topic) => (
              <WeakTopicCard
                key={`${normalizeTopicName(topic.topic)}-${topic.dayNumbers.join("-")}`}
                topic={topic.topic}
                score={topic.score}
                href={topic.dayNumbers[0] ? buildLessonTopicHref(course.slug, topic.dayNumbers[0], topic.topic) : undefined}
              />
            ))
          ) : (
            <p className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-slate-300">
              Реши няколко теста, за да направим диагностика и да подредим темите за преговор.
            </p>
          )}
        </div>
      </NeonCard>

      <NeonCard padding="md">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-white marker:hidden">
            <div>
              <h2 className="text-base font-semibold text-white">Виж всички диагностицирани теми</h2>
              <p className="mt-1 text-sm text-white/55">
                {groupedTopicDiagnostics.length > 0
                  ? `${groupedTopicDiagnostics.length} визуално групирани теми`
                  : "Пълният списък ще се появи след първите тестове"}
              </p>
            </div>
            {groupedTopicDiagnostics.length > 0 ? (
              <Badge tone={getReadinessTone(averageResult)}>{averageResult}% обща готовност</Badge>
            ) : null}
          </summary>

          {groupedTopicDiagnostics.length > 0 ? (
            <div className="mt-4 space-y-3">
              {sortedGroupedTopics.map((item) => (
                <div
                  key={`${normalizeTopicName(item.topic)}-${item.dayNumbers.join("-")}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3"
                >
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
        </details>
      </NeonCard>

      <section className="space-y-3">
        <h2 className="mh-heading-lg">Постижения</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AchievementBadge label="XP герой" unlocked={xpValue >= 200} />
          <AchievementBadge label="3 дни" unlocked={completedDayNumbers.length >= 3} />
          <AchievementBadge label="80%+" unlocked={(latestResult?.percentage ?? 0) >= 80} />
        </div>
      </section>
    </div>
  );
}
