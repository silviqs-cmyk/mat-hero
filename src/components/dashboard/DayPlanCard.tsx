import { BookOpen, CheckCircle2, Gift, PenTool, Play, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { DayPlanStep } from "@/types";

const iconMap = {
  lesson: BookOpen,
  video: Play,
  practice: PenTool,
  quiz: CheckCircle2,
  bonus: Gift,
  results: Trophy,
};

const toneMap = {
  purple: {
    card: "purple" as const,
    icon: "mh-icon-shell--purple",
    badge: "purple" as const,
    title: "mh-tone-title--purple",
  },
  cyan: {
    card: "cyan" as const,
    icon: "mh-icon-shell--cyan",
    badge: "cyan" as const,
    title: "mh-tone-title--cyan",
  },
  green: {
    card: "green" as const,
    icon: "mh-icon-shell--green",
    badge: "green" as const,
    title: "mh-tone-title--green",
  },
  gold: {
    card: "gold" as const,
    icon: "mh-icon-shell--gold",
    badge: "gold" as const,
    title: "mh-tone-title--gold",
  },
};

interface DayPlanCardProps {
  badge: string;
  title: string;
  steps: DayPlanStep[];
}

export function DayPlanCard({ badge, title, steps }: DayPlanCardProps) {
  return (
    <NeonCard padding="lg">
      <SectionHeader
        label="План за деня"
        title={title}
        action={
          <Badge tone="cyan">
            <Sparkles className="h-5 w-5" />
            {badge}
          </Badge>
        }
      />

      <div className="mt-7 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {steps.map((step) => {
          const Icon = iconMap[step.type];
          const tones = toneMap[step.tone];

          return (
            <NeonCard
              key={step.id}
              as="article"
              tone={tones.card}
              padding="md"
              hoverable
              className="flex h-full flex-col"
            >
              <div className="flex items-start gap-4">
                <span className={`mh-icon-shell h-14 w-14 ${tones.icon}`}>
                  <Icon className="h-7 w-7" />
                </span>
                <div>
                  <p className={`mh-label ${tones.title}`}>{step.eyebrow}</p>
                  <p className="mt-2 text-[1.1rem] font-semibold text-white">{step.title}</p>
                </div>
              </div>

              <div className="mt-6 flex-1" />

              <div>
                {step.href ? (
                  <NeonButton
                    href={step.href}
                    variant="secondary"
                    className="min-h-12 w-full justify-center px-4 text-[1rem]"
                  >
                    {step.ctaLabel}
                  </NeonButton>
                ) : (
                  <Badge tone={tones.badge} className="flex min-h-12 w-full justify-center px-4 text-[1rem]">
                    {step.ctaLabel}
                  </Badge>
                )}
              </div>
            </NeonCard>
          );
        })}
      </div>
    </NeonCard>
  );
}
