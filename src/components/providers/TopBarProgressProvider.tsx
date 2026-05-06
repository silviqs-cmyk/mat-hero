"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export interface TopBarProgressState {
  label: string;
  summary: string;
  helper: string;
  value: number;
  max: number;
  tone: "cyan" | "lime";
}

interface TopBarProgressContextValue {
  progress: TopBarProgressState | null;
  setProgress: (value: TopBarProgressState | null) => void;
}

const TopBarProgressContext = createContext<TopBarProgressContextValue | null>(null);

export function TopBarProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<TopBarProgressState | null>(null);

  const value = useMemo(
    () => ({
      progress,
      setProgress,
    }),
    [progress],
  );

  return (
    <TopBarProgressContext.Provider value={value}>
      {children}
    </TopBarProgressContext.Provider>
  );
}

export function useTopBarProgress() {
  const context = useContext(TopBarProgressContext);

  if (!context) {
    throw new Error("useTopBarProgress must be used within TopBarProgressProvider.");
  }

  return context;
}
