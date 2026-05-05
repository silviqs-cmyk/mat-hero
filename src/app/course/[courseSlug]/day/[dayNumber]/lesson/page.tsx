"use client";

import { useParams } from "next/navigation";
import { BookOpenCheck, ChevronRight, Lightbulb, PlayCircle } from "lucide-react";
import { MascotCharacter } from "@/components/MascotCharacter";
import { InfoCard } from "@/components/dashboard/InfoCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useCourse } from "@/hooks/useCourse";
import { useDayContentBundle } from "@/hooks/useDayContentBundle";
import { buildPracticeHref, buildVideoHref } from "@/lib/studentFlow";

export default function CourseLessonPage() {
  const params = useParams<{ courseSlug: string; dayNumber: string }>();
  const dayNumber = Number(params.dayNumber);
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(params.courseSlug);
  const { data: bundle, isLoading: bundleLoading, error: bundleError } = useDayContentBundle(
    params.courseSlug,
    Number.isFinite(dayNumber) ? dayNumber : 1,
  );

  if (courseLoading || bundleLoading) {
    return <LoadingState title="Зареждам урока" lines={4} />;
  }

  if (courseError || bundleError) {
    return (
      <ErrorState
        title="Не успях да заредя урока"
        description={courseError ?? bundleError ?? "Възникна грешка."}
        action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
      />
    );
  }

  const lesson = bundle?.lessons[0];
  if (!course || !bundle || !lesson) {
    return (
      <EmptyState
        title="Няма урок за този ден"
        description="Публикувай lesson в CMS-а и той ще се появи тук."
      />
    );
  }

  const theorySection =
    lesson.sections?.find((section) => ["theory", "tip", "warning", "formula"].includes(section.section_type)) ??
    lesson.sections?.[0];
  const exampleSection =
    lesson.sections?.find((section) => section.section_type === "example") ??
    lesson.sections?.[1] ??
    lesson.sections?.[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <NeonCard padding="lg" className="rounded-[30px]">
          <SectionHeader
            label="Урок"
            title={lesson.title}
            action={<Badge tone="cyan">{lesson.type}</Badge>}
            align="center"
          />
          <p className="mh-copy-muted mt-4">{bundle.day.description}</p>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <InfoCard label={theorySection?.title ?? "Най-важното"} tone="cyan" icon={<Lightbulb className="h-5 w-5 text-cyan-200" />}>
              <p>{theorySection?.content ?? lesson.content}</p>
            </InfoCard>
            <InfoCard label={exampleSection?.title ?? "Пример"} tone="purple" icon={<BookOpenCheck className="h-5 w-5 text-fuchsia-200" />}>
              <p>{exampleSection?.content ?? lesson.content}</p>
            </InfoCard>
          </div>

          {lesson.sections && lesson.sections.length > 0 ? (
            <div className="mt-6 grid gap-3">
              {lesson.sections.map((section) => (
                <NeonCard key={section.id} padding="sm" className="rounded-[22px]">
                  <p className="mh-label">{section.title}</p>
                  <p className="mt-3 text-[1rem] leading-7 text-slate-200">{section.content}</p>
                </NeonCard>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-4 2xl:flex-row">
            <NeonButton href={lesson.video_url ? buildVideoHref(course.slug, bundle.day.day_number) : buildPracticeHref(course.slug, bundle.day.day_number)} variant="secondary" className="min-h-14 w-full px-6 text-[1.1rem] 2xl:w-auto">
              <PlayCircle className="h-5 w-5" />
              {lesson.video_url ? "Гледай видеото" : "Към задачите"}
            </NeonButton>
            <NeonButton href={buildPracticeHref(course.slug, bundle.day.day_number)} className="min-h-14 w-full px-8 text-[1.15rem] 2xl:flex-1">
              Продължи към задачите
              <ChevronRight className="h-5 w-5" />
            </NeonButton>
          </div>
        </NeonCard>

        <MascotCharacter
          mood="happy"
          message="Прегледай теорията, мини през примера и после затвърди с практическите задачи."
          xpText="+25 XP след тест"
        />
      </section>
    </div>
  );
}
