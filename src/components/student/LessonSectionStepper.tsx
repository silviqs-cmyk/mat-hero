"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lightbulb, PlayCircle } from "lucide-react";
import { renderFormattedInlineText } from "@/components/lesson/LessonSectionContent";
import { FormattedTheoryContent } from "@/components/student/FormattedTheoryContent";
import { NeonButton } from "@/components/ui/NeonButton";
import { useDayProgress } from "@/hooks/useDayProgress";
import { resolveLessonVideo } from "@/lib/video";
import type { LessonSection } from "@/types/course";

interface LessonSectionStepperProps {
  sections: LessonSection[];
  practiceHref: string;
  videoHref?: string;
  finalHref?: string;
  finalLabel?: string;
  initialSectionIndex?: number;
  courseSlug: string;
  dayNumber: number;
}

function getSectionTitle(section: LessonSection, fallbackIndex: number) {
  const normalizedTitle = section.title?.trim();

  if (normalizedTitle) {
    return normalizedTitle;
  }

  return `ТЕМА ${fallbackIndex + 1}`;
}

export function LessonSectionStepper({
  sections,
  practiceHref,
  videoHref,
  finalHref,
  finalLabel,
  initialSectionIndex = 0,
  courseSlug,
  dayNumber,
}: LessonSectionStepperProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(initialSectionIndex);
  const { markStepCompleted } = useDayProgress(courseSlug, dayNumber);

  const safeIndex = Math.min(currentSectionIndex, Math.max(sections.length - 1, 0));
  const currentSection = sections[safeIndex];
  const isFirstSection = safeIndex === 0;
  const isLastSection = safeIndex === sections.length - 1;
  const currentTopicVideoUrl =
    currentSection?.video_status === "published" && currentSection.video_url ? currentSection.video_url : null;
  const currentTopicVideo = resolveLessonVideo(currentTopicVideoUrl);
  const resolvedFinalHref = finalHref ?? practiceHref;
  const resolvedFinalLabel = finalLabel ?? "Към упражненията";

  useEffect(() => {
    if (isLastSection) {
      markStepCompleted("theory");
    }
  }, [isLastSection, markStepCompleted]);

  if (!currentSection) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <span className="shrink-0">
            <Lightbulb className="h-5 w-5 text-cyan-200" />
          </span>
          <div className="min-w-0">
            <p className="mh-label text-white/55">Тема {safeIndex + 1} от {sections.length}</p>
            <h3 className="mt-2 text-xl font-semibold leading-snug tracking-normal text-[var(--mh-text)] sm:text-[1.35rem]">
              {renderFormattedInlineText(getSectionTitle(currentSection, safeIndex), `section-title-${safeIndex}`)}
            </h3>
          </div>
        </div>

        <div className="mt-5">
          <FormattedTheoryContent content={currentSection.content} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {isFirstSection ? (
          <div className="hidden sm:block" aria-hidden="true" />
        ) : (
          <NeonButton
            type="button"
            variant="ghost"
            className="mh-btn-uniform min-h-14 justify-center"
            onClick={() => setCurrentSectionIndex((index) => Math.max(index - 1, 0))}
          >
            <ChevronLeft className="h-5 w-5" />
            Предишна тема
          </NeonButton>
        )}

        {currentTopicVideo ? (
          <NeonButton
            href={videoHref ?? currentTopicVideo.src}
            target={videoHref ? undefined : "_blank"}
            rel={videoHref ? undefined : "noreferrer"}
            variant="secondary"
            className="mh-btn-uniform min-h-14 justify-center"
          >
            <PlayCircle className="h-5 w-5" />
            Видео
          </NeonButton>
        ) : (
          <div className="hidden sm:block" aria-hidden="true" />
        )}

        {isLastSection ? (
          <NeonButton
            href={resolvedFinalHref}
            variant="primary"
            className="mh-btn-uniform min-h-14 justify-center"
          >
            {resolvedFinalLabel}
            <ChevronRight className="h-5 w-5" />
          </NeonButton>
        ) : (
          <NeonButton
            type="button"
            className="mh-btn-uniform min-h-14 justify-center"
            onClick={() => setCurrentSectionIndex((index) => Math.min(index + 1, sections.length - 1))}
          >
            Следваща тема
            <ChevronRight className="h-5 w-5" />
          </NeonButton>
        )}
      </div>
    </div>
  );
}
