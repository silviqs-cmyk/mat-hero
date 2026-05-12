"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  PlayCircle,
  Sigma,
  Sparkles,
} from "lucide-react";
import { LessonSectionContent } from "@/components/lesson/LessonSectionContent";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import type { LessonSection } from "@/types/course";

interface LessonSectionStepperProps {
  sections: LessonSection[];
  practiceHref: string;
  videoHref?: string;
  finalHref?: string;
  finalLabel?: string;
}

function getSectionMeta(sectionType: string) {
  switch (sectionType) {
    case "example":
      return {
        label: "Пример",
        tone: "purple" as const,
        badgeTone: "purple" as const,
        icon: <BookOpenCheck className="h-5 w-5 text-fuchsia-200" />,
      };
    case "formula":
      return {
        label: "Формула",
        tone: "gold" as const,
        badgeTone: "gold" as const,
        icon: <Sigma className="h-5 w-5 text-amber-200" />,
      };
    case "tip":
      return {
        label: "\u0421\u044a\u0432\u0435\u0442",
        tone: "green" as const,
        badgeTone: "green" as const,
        icon: <Sparkles className="h-5 w-5 text-emerald-200" />,
      };
    case "warning":
      return {
        label: "\u0427\u0435\u0441\u0442\u0430 \u0433\u0440\u0435\u0448\u043a\u0430",
        tone: "muted" as const,
        badgeTone: "neutral" as const,
        icon: <AlertTriangle className="h-5 w-5 text-amber-200" />,
      };
    case "theory":
    default:
      return {
        label: "\u0422\u0435\u043e\u0440\u0438\u044f",
        tone: "cyan" as const,
        badgeTone: "cyan" as const,
        icon: <Lightbulb className="h-5 w-5 text-cyan-200" />,
      };
  }
}

function getSectionTitle(section: LessonSection, fallbackIndex: number) {
  const normalizedTitle = section.title?.trim();

  if (normalizedTitle) {
    return normalizedTitle.toLocaleUpperCase("bg-BG");
  }

  return `\u0422\u0415\u041c\u0410 ${fallbackIndex + 1}`;
}

export function LessonSectionStepper({
  sections,
  practiceHref,
  videoHref,
  finalHref,
  finalLabel,
}: LessonSectionStepperProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const safeIndex = Math.min(currentSectionIndex, Math.max(sections.length - 1, 0));
  const currentSection = sections[safeIndex];
  const isFirstSection = safeIndex === 0;
  const isLastSection = safeIndex === sections.length - 1;
  const currentMeta = currentSection ? getSectionMeta(currentSection.section_type) : null;
  const resolvedFinalHref = finalHref ?? practiceHref;
  const resolvedFinalLabel = finalLabel ?? "\u041a\u044a\u043c \u0437\u0430\u0434\u0430\u0447\u0438\u0442\u0435";

  if (!currentSection || !currentMeta) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Badge tone="cyan">
          {"\u0422\u0435\u043c\u0430"} {safeIndex + 1} {"\u043e\u0442"} {sections.length}
        </Badge>
        <Badge tone={currentMeta.badgeTone}>{currentMeta.label}</Badge>
      </div>

      <NeonCard tone={currentMeta.tone} padding="lg" className="rounded-[28px]">
        <div className="flex items-start gap-3">
          <span className="shrink-0">{currentMeta.icon}</span>
          <div className="min-w-0">
            <p className="mh-label text-[var(--mh-accent-cyan-soft)]">{currentMeta.label}</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[0.12em] text-[var(--mh-text)]">
              {getSectionTitle(currentSection, safeIndex)}
            </h3>
          </div>
        </div>

        <div className="mt-6 text-[1.05rem] leading-8 text-[var(--mh-text)]">
          <LessonSectionContent text={currentSection.content} />
        </div>
      </NeonCard>

      <div className="grid gap-3 sm:grid-cols-3">
        {videoHref ? (
          <NeonButton
            href={videoHref}
            variant="ghost"
            className="min-h-14 w-full justify-center sm:justify-self-start"
          >
            <PlayCircle className="h-5 w-5" />
            {"\u0412\u0438\u0434\u0435\u043e"}
          </NeonButton>
        ) : (
          <div className="hidden sm:block" aria-hidden="true" />
        )}

        {isFirstSection ? (
          <div className="hidden sm:block" aria-hidden="true" />
        ) : (
          <NeonButton
            type="button"
            variant="ghost"
            className="min-h-14 w-full justify-center"
            onClick={() => setCurrentSectionIndex((index) => Math.max(index - 1, 0))}
          >
            <ChevronLeft className="h-5 w-5" />
            "Предишна тема"
          </NeonButton>
        )}

        {isLastSection ? (
          <NeonButton
            href={resolvedFinalHref}
            variant="primary"
            className="min-h-14 w-full justify-center sm:justify-self-end"
          >
            {resolvedFinalLabel}
            <ChevronRight className="h-5 w-5" />
          </NeonButton>
        ) : (
          <NeonButton
            type="button"
            className="min-h-14 w-full justify-center sm:justify-self-end"
            onClick={() => setCurrentSectionIndex((index) => Math.min(index + 1, sections.length - 1))}
          >
            {"\u0421\u043b\u0435\u0434\u0432\u0430\u0449\u0430 \u0442\u0435\u043c\u0430"}
            <ChevronRight className="h-5 w-5" />
          </NeonButton>
        )}
      </div>
    </div>
  );
}
