import { Star } from "lucide-react";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import type { HeroBuddyModel } from "@/types";

interface HeroBuddyCardProps {
  buddy: HeroBuddyModel;
}

export function HeroBuddyCard({ buddy }: HeroBuddyCardProps) {
  return (
    <NeonCard padding="lg" className="min-h-full">
      <p className="mh-label text-center text-fuchsia-200">Hero Buddy</p>
      <div className="mt-5 flex justify-center">
        <AnimatedHeroMascot size="lg" animated={false} />
      </div>
      <h3 className="mt-3 font-display text-[2.05rem] font-bold text-white">{buddy.title}</h3>
      <p className="mh-copy mt-3 text-[1.05rem]">{buddy.message}</p>
      <NeonButton variant="success" className="mt-7 min-h-14 w-full">
        <Star className="h-5 w-5" />
        {buddy.rewardLabel}
      </NeonButton>
    </NeonCard>
  );
}
