"use client";

import { useEffect } from "react";
import type { TopBarProgressState } from "@/components/providers/TopBarProgressProvider";
import { useTopBarProgress } from "@/components/providers/TopBarProgressProvider";

interface TopBarProgressSyncProps {
  value: TopBarProgressState | null;
}

export function TopBarProgressSync({ value }: TopBarProgressSyncProps) {
  const { setProgress } = useTopBarProgress();

  useEffect(() => {
    setProgress(value);

    return () => {
      setProgress(null);
    };
  }, [setProgress, value]);

  return null;
}
