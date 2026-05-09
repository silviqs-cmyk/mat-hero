"use client";

import { useLayoutEffect } from "react";
import { useTopBarProgress, type TopBarProgressState } from "@/components/providers/TopBarProgressProvider";

interface TopBarProgressSyncProps {
  value: TopBarProgressState | null;
}

export function TopBarProgressSync({ value }: TopBarProgressSyncProps) {
  const { setProgress } = useTopBarProgress();

  useLayoutEffect(() => {
    setProgress(value);

    return () => {
      setProgress(null);
    };
  }, [setProgress, value]);

  return null;
}
