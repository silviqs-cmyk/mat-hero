import { NeonCard } from "@/components/ui/NeonCard";

interface LoadingStateProps {
  title?: string;
  lines?: number;
}

export function LoadingState({ title = "Зареждане...", lines = 3 }: LoadingStateProps) {
  return (
    <NeonCard padding="md">
      <p className="mh-label">{title}</p>
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="h-4 animate-pulse rounded-full bg-white/8" />
        ))}
      </div>
    </NeonCard>
  );
}
