"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers/AppStateProvider";
import { NeonButton } from "@/components/ui/NeonButton";
import { resetStudentProgress } from "@/services/resetProgress";

interface RoadmapResetButtonProps {
  isAuthenticated: boolean;
}

export function RoadmapResetButton({ isAuthenticated }: RoadmapResetButtonProps) {
  const router = useRouter();
  const { resetProgress } = useAppState();
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    if (isResetting) {
      return;
    }

    setIsResetting(true);
    setError(null);

    try {
      if (isAuthenticated) {
        await resetStudentProgress();
      }

      resetProgress();
      router.refresh();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Не успях да зануля прогреса.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <NeonButton
        type="button"
        onClick={() => void handleReset()}
        variant="secondary"
        className="min-h-0 px-4 py-2 text-sm"
        disabled={isResetting}
      >
        {isResetting ? "Зануляване..." : "Рестарт"}
      </NeonButton>
      {error ? <p className="max-w-sm text-right text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
