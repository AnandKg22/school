"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface CelebrationOptions {
  particleCount?: number;
  durationMs?: number;
  colors?: string[];
}

interface CelebrationContextType {
  isCelebrating: boolean;
  triggerCelebration: (options?: CelebrationOptions) => void;
  stopCelebration: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const [isCelebrating, setIsCelebrating] = useState(false);

  const stopCelebration = useCallback(() => {
    setIsCelebrating(false);
  }, []);

  const triggerCelebration = useCallback(
    (options?: CelebrationOptions) => {
      setIsCelebrating(true);
      const duration = options?.durationMs || 3500;
      setTimeout(() => {
        setIsCelebrating(false);
      }, duration);
    },
    []
  );

  // Listen to global window event
  useEffect(() => {
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<CelebrationOptions>;
      triggerCelebration(customEvent.detail);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("school:celebrate", handleCustomEvent);
      return () => {
        window.removeEventListener("school:celebrate", handleCustomEvent);
      };
    }
  }, [triggerCelebration]);

  return (
    <CelebrationContext.Provider
      value={{
        isCelebrating,
        triggerCelebration,
        stopCelebration,
      }}
    >
      {children}
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error("useCelebration must be used within a CelebrationProvider");
  }
  return context;
}
