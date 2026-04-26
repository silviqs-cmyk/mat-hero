"use client";

import { useEffect, useMemo, useState } from "react";
import { AchievementBadge } from "@/components/AchievementBadge";
import { ScoreCard } from "@/components/ScoreCard";
import { WeakTopicCard } from "@/components/WeakTopicCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { supabase } from "@/lib/supabaseClient";

function maskSessionId(sessionId: string) {
  if (sessionId.length <= 10) {
    return sessionId;
  }

  return `${sessionId.slice(0, 6)}...${sessionId.slice(-4)}`;
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

  return (
    <div className="space-y-5 lg:mx-auto lg:max-w-5xl">
      <section className="panel-glow rounded-[30px] p-5">
        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Профил
            </p>
            <h2 className="mt-2 font-display text-3xl text-white">{profileName}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {userEmail
                ? "Влязъл си с реален акаунт и прогресът ти може да се пази между сесиите."
                : "В момента работиш като гост. Данните се пазят локално за тази сесия."}
            </p>
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
        <h2 className="font-display text-2xl text-white">Теми за преговор</h2>
        <div className="mt-4 space-y-3">
          {progress.weak_topics.length > 0 ? (
            progress.weak_topics.map((topic) => (
              <WeakTopicCard key={topic} topic={topic} score={progress.topic_scores[topic]} />
            ))
          ) : (
            <p className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
              Още няма достатъчно данни за слаби теми. Реши няколко теста и тук ще се появи
              по-точна картина на профила ти.
            </p>
          )}
        </div>
      </section>

      <section className="panel-lime rounded-[28px] p-5">
        <h2 className="font-display text-2xl text-white">Какво да направиш утре</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Повтори 2 задачи по {progress.weak_topics[0]?.toLowerCase() ?? "основните теми"}, после
          направи един кратък смесен тест. Това държи прогреса стабилен и профила ти расте с реални
          резултати, а не само с време в приложението.
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
