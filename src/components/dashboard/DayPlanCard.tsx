"use client";

import { BookOpen, CheckCircle2, ChevronRight, PenTool, Play, Sparkles, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDayProgress } from "@/hooks/useDayProgress";
import { Badge } from "@/components/ui/Badge";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { DayPlanStep } from "@/types";

const iconMap = {
  lesson: BookOpen,
  video: Play,
  practice: PenTool,
  quiz: CheckCircle2,
  bonus: Target,
  results: Trophy,
};

const toneMap = {
  purple: {
    title: "mh-tone-title--purple",
    activeCircle:
      "border-fuchsia-300/95 bg-slate-900/96 text-fuchsia-50 shadow-[0_0_0_1px_rgba(244,114,182,0.34),0_0_24px_rgba(217,70,239,0.52),0_0_38px_rgba(168,85,247,0.34)]",
    hoverCircle:
      "hover:border-fuchsia-100 hover:text-fuchsia-50 hover:shadow-[0_0_0_1px_rgba(244,114,182,0.52),0_0_38px_rgba(217,70,239,0.92),0_0_68px_rgba(168,85,247,0.68)]",
    completedCircle:
      "border-fuchsia-300/70 bg-slate-900/88 text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,0.2)]",
    activeLine: "bg-fuchsia-300 shadow-[0_0_14px_rgba(217,70,239,0.9),0_0_24px_rgba(168,85,247,0.48)]",
    completedLine: "bg-fuchsia-300/60 shadow-[0_0_10px_rgba(217,70,239,0.28)]",
    connector: "bg-gradient-to-r from-fuchsia-300/95 to-violet-300/44 shadow-[0_0_18px_rgba(217,70,239,0.24)]",
  },
  cyan: {
    title: "mh-tone-title--cyan",
    activeCircle:
      "border-cyan-200/95 bg-slate-900/96 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.36),0_0_24px_rgba(34,211,238,0.52),0_0_38px_rgba(59,130,246,0.34)]",
    hoverCircle:
      "hover:border-cyan-50 hover:text-cyan-50 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.54),0_0_38px_rgba(34,211,238,0.92),0_0_68px_rgba(59,130,246,0.68)]",
    completedCircle:
      "border-cyan-300/72 bg-slate-900/88 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.2)]",
    activeLine: "bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.95),0_0_22px_rgba(59,130,246,0.4)]",
    completedLine: "bg-cyan-300/60 shadow-[0_0_10px_rgba(34,211,238,0.28)]",
    connector: "bg-gradient-to-r from-cyan-300/95 to-sky-300/44 shadow-[0_0_18px_rgba(34,211,238,0.24)]",
  },
  green: {
    title: "mh-tone-title--green",
    activeCircle:
      "border-emerald-300/95 bg-slate-900/96 text-emerald-50 shadow-[0_0_0_1px_rgba(74,222,128,0.32),0_0_24px_rgba(74,222,128,0.52),0_0_38px_rgba(16,185,129,0.34)]",
    hoverCircle:
      "hover:border-emerald-100 hover:text-emerald-50 hover:shadow-[0_0_0_1px_rgba(74,222,128,0.5),0_0_38px_rgba(74,222,128,0.9),0_0_68px_rgba(16,185,129,0.64)]",
    completedCircle:
      "border-emerald-300/72 bg-slate-900/88 text-emerald-100 shadow-[0_0_18px_rgba(74,222,128,0.2)]",
    activeLine: "bg-emerald-300 shadow-[0_0_14px_rgba(74,222,128,0.88),0_0_22px_rgba(16,185,129,0.34)]",
    completedLine: "bg-emerald-300/60 shadow-[0_0_10px_rgba(74,222,128,0.24)]",
    connector: "bg-gradient-to-r from-emerald-300/95 to-lime-300/40 shadow-[0_0_18px_rgba(74,222,128,0.22)]",
  },
  gold: {
    title: "mh-tone-title--gold",
    activeCircle:
      "border-amber-300/95 bg-slate-900/96 text-amber-50 shadow-[0_0_0_1px_rgba(252,211,77,0.3),0_0_24px_rgba(251,191,36,0.52),0_0_38px_rgba(245,158,11,0.34)]",
    hoverCircle:
      "hover:border-amber-100 hover:text-amber-50 hover:shadow-[0_0_0_1px_rgba(252,211,77,0.5),0_0_38px_rgba(251,191,36,0.88),0_0_68px_rgba(245,158,11,0.64)]",
    completedCircle:
      "border-amber-300/72 bg-slate-900/88 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.2)]",
    activeLine: "bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.84),0_0_22px_rgba(245,158,11,0.32)]",
    completedLine: "bg-amber-300/60 shadow-[0_0_10px_rgba(251,191,36,0.22)]",
    connector: "bg-gradient-to-r from-amber-300/95 to-orange-300/40 shadow-[0_0_18px_rgba(251,191,36,0.22)]",
  },
};

interface DayPlanCardProps {
  badge: string;
  title: string;
  steps: DayPlanStep[];
}

function getCurrentStepId(pathname: string, steps: DayPlanStep[]) {
  const directMatch = steps.find((step) => step.href && (pathname === step.href || pathname.startsWith(`${step.href}/`)));
  if (directMatch) {
    return directMatch.id;
  }

  if (pathname.includes("/bonus")) {
    return steps.find((step) => step.type === "bonus")?.id ?? null;
  }

  if (pathname.includes("/practice")) {
    return steps.find((step) => step.type === "practice")?.id ?? null;
  }

  if (pathname.includes("/quiz")) {
    return steps.find((step) => step.type === "quiz")?.id ?? null;
  }

  if (pathname.includes("/lesson") || pathname.includes("/video")) {
    return steps.find((step) => step.type === "lesson")?.id ?? null;
  }

  return null;
}

export function DayPlanCard({ badge, title, steps }: DayPlanCardProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [animatedLabels, setAnimatedLabels] = useState<string[]>(() => steps.map(() => ""));
  const dayMatch = pathname.match(/\/day\/(\d+)/);
  const courseMatch = pathname.match(/\/course\/([^/]+)\/day\/(\d+)/);
  const dayNumber = Number(courseMatch?.[2] ?? dayMatch?.[1] ?? 1);
  const courseSlug = courseMatch?.[1] ?? "default";
  const { progress } = useDayProgress(courseSlug, dayNumber);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const labels = steps.map((step) => step.eyebrow.replace(/^\d+\.\s*/, ""));
    setAnimatedLabels(labels.map(() => ""));

    const timers: ReturnType<typeof setTimeout>[] = [];
    let delay = 120;

    labels.forEach((label, stepIndex) => {
      for (let charIndex = 1; charIndex <= label.length; charIndex += 1) {
        const currentValue = label.slice(0, charIndex);
        timers.push(
          setTimeout(() => {
            setAnimatedLabels((previous) => {
              const next = [...previous];
              next[stepIndex] = currentValue;
              return next;
            });
          }, delay),
        );
        delay += 28;
      }

      delay += 150;
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [steps]);

  const activeStepId = mounted
    ? getCurrentStepId(pathname, steps) ?? steps.find((step) => !progress.practice || step.type !== "bonus")?.id ?? steps[0]?.id
    : steps[0]?.id;
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStepId),
  );

  return (
    <NeonCard padding="lg" className="overflow-hidden">
      <SectionHeader
        label="План за деня"
        title={title}
        action={
          badge ? (
            <Badge tone="cyan">
              <Sparkles className="h-5 w-5" />
              {badge}
            </Badge>
          ) : undefined
        }
      />

      <div className="relative mt-8 px-0 py-2 sm:mt-10 sm:px-2 sm:pt-4">
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-1 sm:grid-cols-4 sm:gap-9 sm:px-0 lg:gap-14">
          {steps.map((step, index) => {
            const Icon = iconMap[step.type];
            const tones = toneMap[step.tone];
            const stepContent = (
              <div className="group flex flex-col items-center text-center rounded-[26px] px-1 py-2 sm:px-1.5 sm:py-1">
                <div
                  className={[
                    "relative z-10 flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-[22px] border transition-all duration-200 sm:h-[4.35rem] sm:w-[4.35rem] sm:rounded-[24px]",
                    tones.activeCircle,
                    tones.hoverCircle,
                  ].join(" ")}
                >
                  <Icon className="h-7 w-7 transition-transform duration-300 group-hover:rotate-[8deg] sm:h-7 sm:w-7" />
                </div>

                <div className="mt-5 px-1">
                  <p
                    className={[
                      `mh-label ${tones.title} text-[0.92rem] transition-all duration-200 group-hover:brightness-[1.35] sm:text-[0.84rem]`,
                      "opacity-100 brightness-125",
                    ].join(" ")}
                  >
                    {animatedLabels[index] || "\u00A0"}
                  </p>
                </div>
              </div>
            );

            return (
              <div key={step.id} className="relative min-w-0">
                {step.href ? (
                  <Link
                    href={step.href}
                    className="block rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
                  >
                    {stepContent}
                  </Link>
                ) : (
                  stepContent
                )}

                {index < steps.length - 1 ? (
                  <>
                    <div
                      className="pointer-events-none absolute left-[calc(50%+0.85rem)] top-[1.7rem] hidden w-[calc(100%-1.7rem)] items-center sm:flex sm:top-[2rem]"
                      aria-hidden="true"
                    >
                      <span className={["block h-[2px] flex-1", tones.connector].join(" ")} />
                      <ChevronRight className="ml-1 h-4 w-4 shrink-0 text-white/90 drop-shadow-[0_0_12px_rgba(255,255,255,0.42)]" />
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </NeonCard>
  );
}
