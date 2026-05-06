"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AchievementBadge } from "@/components/AchievementBadge";
import { ScoreCard } from "@/components/ScoreCard";
import { WeakTopicCard } from "@/components/WeakTopicCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCurrentUserClient, signOut } from "@/lib/auth/client";
import { demoDays } from "@/lib/demoData";

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

export default function ReportPage() {
  const router = useRouter();
  const { progress } = useAppState();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const user = await getCurrentUserClient();

      if (!active) {
        return;
      }

      setUserEmail(user?.email ?? null);
      setAuthReady(true);
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  const improvement = Math.max(0, progress.last_quiz_score - 55);
  const completedDaysLabel = `${progress.completed_days.length}/10`;
  const profileName = useMemo(() => {
    if (userEmail) {
      return userEmail.split("@")[0];
    }

    return "Гост потребител";
  }, [userEmail]);

  const diagnosedTopics = useMemo(() => {
    return demoDays
      .map((day) => ({
        dayId: day.id,
        topic: day.topic,
        score: progress.topic_scores[day.topic],
      }))
      .filter((item) => typeof item.score === "number")
      .sort((a, b) => b.score - a.score);
  }, [progress.topic_scores]);

  const diagnosisAverage = diagnosedTopics.length
    ? Math.round(diagnosedTopics.reduce((sum, topic) => sum + topic.score, 0) / diagnosedTopics.length)
    : 0;
  const strongestTopic = diagnosedTopics[0] ?? null;
  const weakestTopic = diagnosedTopics[diagnosedTopics.length - 1] ?? null;
  const testedTopicsCount = diagnosedTopics.length;

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-5 lg:mx-auto lg:max-w-5xl">
      <NeonCard padding="md">
        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <SectionHeader label="Профил" title={<h2 className="mh-heading-lg">{profileName}</h2>} />
            {!userEmail ? (
              <p className="mh-copy-muted mt-3">
                В момента работиш като гост. Данните се пазят локално за тази сесия.
              </p>
            ) : null}
            <NeonButton
              type="button"
              onClick={() => void handleSignOut()}
              variant="secondary"
              className="mt-5 min-h-0 px-4 py-3 text-sm"
            >
              Изход
            </NeonButton>
          </div>

          <NeonCard as="div" tone="muted" padding="sm" className="space-y-3 rounded-[24px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Имейл</p>
              <p className="mt-2 text-sm text-white">{userEmail ?? "Няма свързан имейл"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Статус</p>
              <p className="mt-2 text-sm text-white">
                {authReady ? (userEmail ? "Регистриран профил" : "Гост режим") : "Зареждане..."}
              </p>
            </div>
          </NeonCard>
        </div>
      </NeonCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ScoreCard title="Текущ ден" value={`${progress.current_day}`} helper="от 10" accent="cyan" />
        <ScoreCard title="XP" value={`${progress.xp}`} helper="натрупан опит" accent="lime" />
        <ScoreCard title="Серия" value={`${progress.streak}`} helper="последователни теста" accent="pink" />
        <ScoreCard title="Завършени дни" value={completedDaysLabel} helper="отключен напредък" accent="purple" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <ScoreCard title="Подобрение" value={`+${improvement}%`} helper="спрямо старт" accent="lime" />
        <ScoreCard title="Последен тест" value={`${progress.last_quiz_score}%`} helper="последен резултат" accent="cyan" />
      </section>

      <NeonCard padding="md">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="mh-heading-lg">Диагностика на знанията</h2>
            <p className="mh-copy-muted mt-2">
              Оценката е изградена от преминатите тестове и показва къде си стабилен и къде имаш нужда от още повторение.
            </p>
          </div>
          <Badge tone={getReadinessTone(diagnosisAverage)}>
            {testedTopicsCount > 0 ? getReadinessLabel(diagnosisAverage) : "Очаква първи тест"}
          </Badge>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <ScoreCard
            title="Обща готовност"
            value={testedTopicsCount > 0 ? `${diagnosisAverage}%` : "0%"}
            helper={testedTopicsCount > 0 ? "средно от оценените теми" : "няма натрупани тестове"}
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
            helper={weakestTopic ? weakestTopic.topic : "премини първия тест"}
            accent="pink"
          />
        </div>

        {testedTopicsCount > 0 ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <NeonCard as="div" tone="green" padding="sm" className="rounded-[24px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-200">Най-стабилна тема</p>
              <h3 className="mt-2 font-display text-xl text-white">{strongestTopic?.topic}</h3>
              <p className="mt-2 text-slate-200">Готовност: {strongestTopic?.score}%. Тук вече имаш добра опора.</p>
            </NeonCard>

            <NeonCard as="div" tone="purple" padding="sm" className="rounded-[24px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">Тема за натиск</p>
              <h3 className="mt-2 font-display text-xl text-white">{weakestTopic?.topic}</h3>
              <p className="mt-2 text-slate-200">
                Готовност: {weakestTopic?.score}%. Тук си струва да върнеш урока и да решиш още няколко задачи.
              </p>
            </NeonCard>
          </div>
        ) : (
          <p className="mt-5 rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-slate-300">
            Все още няма достатъчно данни за диагностика. Реши поне един тест и тук ще се появи по-точна картина на знанията ти.
          </p>
        )}

        {testedTopicsCount > 0 ? (
          <div className="mt-5 space-y-3">
            {diagnosedTopics.map((item) => (
              <div key={item.topic} className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-white">{item.topic}</p>
                  <p className="mt-1 text-xs text-white/55">Ден {item.dayId}</p>
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
          {progress.weak_topics.length > 0 ? (
            progress.weak_topics.map((topic) => (
              <WeakTopicCard key={topic} topic={topic} score={progress.topic_scores[topic]} />
            ))
          ) : (
            <p className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-slate-300">
              Все още няма достатъчно данни за слаби теми. Реши няколко теста и тук ще се появи по-точна картина на профила ти.
            </p>
          )}
        </div>
      </NeonCard>

      <NeonCard tone="green" padding="md">
        <h2 className="mh-heading-lg">Какво да направиш утре</h2>
        <p className="mh-copy-muted mt-3">
          Повтори 2 задачи по {progress.weak_topics[0]?.toLowerCase() ?? "основните теми"}, после направи един кратък смесен тест. Това държи прогреса стабилен и профилът ти расте с реални резултати.
        </p>
      </NeonCard>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AchievementBadge label="XP герой" unlocked={progress.xp >= 200} />
        <AchievementBadge label="3 дни" unlocked={progress.completed_days.length >= 3} />
        <AchievementBadge label="80%+" unlocked={progress.last_quiz_score >= 80} />
      </section>
    </div>
  );
}
