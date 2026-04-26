"use client";

import { useEffect, useMemo, useState } from "react";
import { AchievementBadge } from "@/components/AchievementBadge";
import { ScoreCard } from "@/components/ScoreCard";
import { WeakTopicCard } from "@/components/WeakTopicCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { demoDays } from "@/lib/demoData";
import { supabase } from "@/lib/supabaseClient";

function maskSessionId(sessionId: string) {
  if (sessionId.length <= 10) {
    return sessionId;
  }

  return `${sessionId.slice(0, 6)}...${sessionId.slice(-4)}`;
}

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

function getReadinessClass(score: number) {
  if (score >= 80) {
    return "border-lime-400/30 bg-lime-400/10 text-lime-100";
  }

  if (score >= 65) {
    return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
  }

  if (score >= 50) {
    return "border-pink-400/30 bg-pink-400/10 text-pink-100";
  }

  return "border-rose-400/30 bg-rose-400/10 text-rose-100";
}

export default function ReportPage() {
  const { progress, sessionId } = useAppState();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!supabase) {
        if (active) {
          setAuthReady(true);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      setUserEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
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
    ? Math.round(
        diagnosedTopics.reduce((sum, topic) => sum + topic.score, 0) / diagnosedTopics.length,
      )
    : 0;
  const strongestTopic = diagnosedTopics[0] ?? null;
  const weakestTopic = diagnosedTopics[diagnosedTopics.length - 1] ?? null;
  const testedTopicsCount = diagnosedTopics.length;

  return (
    <div className="space-y-5 lg:mx-auto lg:max-w-5xl">
      <section className="panel-glow rounded-[30px] p-5">
        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Профил
            </p>
            <h2 className="mt-2 font-display text-3xl text-white">{profileName}</h2>
            {!userEmail ? (
              <p className="panel-copy-muted mt-3">
                В момента работиш като гост. Данните се пазят локално за тази сесия.
              </p>
            ) : null}
          </div>

          <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                Имейл
              </p>
              <p className="mt-2 text-sm text-white">{userEmail ?? "Няма свързан имейл"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                Статус
              </p>
              <p className="mt-2 text-sm text-white">
                {authReady ? (userEmail ? "Регистриран профил" : "Гост режим") : "Зареждане..."}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                Потребител ID
              </p>
              <p className="mt-2 break-all text-sm text-white/80">
                {userId ?? maskSessionId(sessionId)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ScoreCard title="Текущ ден" value={`${progress.current_day}`} helper="от 10" accent="cyan" />
        <ScoreCard title="XP" value={`${progress.xp}`} helper="натрупан опит" accent="lime" />
        <ScoreCard title="Серия" value={`${progress.streak}`} helper="последователни теста" accent="pink" />
        <ScoreCard
          title="Завършени дни"
          value={completedDaysLabel}
          helper="отключен напредък"
          accent="purple"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <ScoreCard
          title="Подобрение"
          value={`+${improvement}%`}
          helper="спрямо старт"
          accent="lime"
        />
        <ScoreCard
          title="Последен тест"
          value={`${progress.last_quiz_score}%`}
          helper="последен резултат"
          accent="cyan"
        />
      </section>

      <section className="panel-glow rounded-[28px] p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-white">Диагностика на знанията</h2>
            <p className="panel-copy-muted mt-2">
              Оценката е изградена от преминатите тестове и показва къде си стабилен и къде имаш
              нужда от още повторение.
            </p>
          </div>
          <div className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getReadinessClass(diagnosisAverage)}`}>
            {testedTopicsCount > 0 ? getReadinessLabel(diagnosisAverage) : "Очаква първи тест"}
          </div>
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
            <div className="rounded-[24px] border border-lime-400/20 bg-lime-400/8 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-200">
                Най-стабилна тема
              </p>
              <h3 className="mt-2 font-display text-xl text-white">{strongestTopic?.topic}</h3>
              <p className="panel-copy mt-2 text-slate-200">
                Готовност: {strongestTopic?.score}%. Тук вече имаш добра опора.
              </p>
            </div>

            <div className="rounded-[24px] border border-pink-400/20 bg-pink-400/8 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-200">
                Тема за натиск
              </p>
              <h3 className="mt-2 font-display text-xl text-white">{weakestTopic?.topic}</h3>
              <p className="panel-copy mt-2 text-slate-200">
                Готовност: {weakestTopic?.score}%. Тук си струва да върнеш урока и да решиш още
                няколко задачи.
              </p>
            </div>
          </div>
        ) : (
          <p className="panel-copy mt-5 rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-slate-300">
            Все още няма достатъчно данни за диагностика. Реши поне един тест и тук ще се появи
            по-точна картина на знанията ти.
          </p>
        )}

        {testedTopicsCount > 0 ? (
          <div className="mt-5 space-y-3">
            {diagnosedTopics.map((item) => (
              <div
                key={item.topic}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="panel-copy text-white">{item.topic}</p>
                  <p className="mt-1 text-xs text-white/55">Ден {item.dayId}</p>
                </div>
                <div className={`rounded-full border px-3 py-1 text-xs font-bold ${getReadinessClass(item.score)}`}>
                  {item.score}% • {getReadinessLabel(item.score)}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel-glow rounded-[28px] p-5">
        <h2 className="font-display text-2xl text-white">Теми за преговор</h2>
        <div className="mt-4 space-y-3">
          {progress.weak_topics.length > 0 ? (
            progress.weak_topics.map((topic) => (
              <WeakTopicCard key={topic} topic={topic} score={progress.topic_scores[topic]} />
            ))
          ) : (
            <p className="panel-copy rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-slate-300">
              Все още няма достатъчно данни за слаби теми. Реши няколко теста и тук ще се появи
              по-точна картина на профила ти.
            </p>
          )}
        </div>
      </section>

      <section className="panel-lime rounded-[28px] p-5">
        <h2 className="font-display text-2xl text-white">Какво да направиш утре</h2>
        <p className="panel-copy-muted mt-3">
          Повтори 2 задачи по {progress.weak_topics[0]?.toLowerCase() ?? "основните теми"}, после
          направи един кратък смесен тест. Това държи прогреса стабилен и профилът ти расте с
          реални резултати, а не само с време в приложението.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AchievementBadge label="XP герой" unlocked={progress.xp >= 200} />
        <AchievementBadge label="3 дни" unlocked={progress.completed_days.length >= 3} />
        <AchievementBadge label="80%+" unlocked={progress.last_quiz_score >= 80} />
      </section>
    </div>
  );
}
