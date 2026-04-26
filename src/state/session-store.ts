'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { RangeAnalysis } from '@/features/range/range-detector';
import type { TimbreAnalysis } from '@/features/timbre/timbre-analyzer';
import type { FachResult } from '@/features/fach/fach-classifier';

export interface VoiceProfile {
  createdAt: number;
  range: RangeAnalysis;
  timbre: TimbreAnalysis;
  fach: FachResult;
  /** Métricas adicionais para a UI. */
  stats: {
    durationSec: number;
    sampleCount: number;
    pitchAccuracyHint: number; // 0..1 (fração de frames com confiança alta)
  };
}

interface SessionState {
  profile: VoiceProfile | null;
  hasHydrated: boolean;
  setProfile: (profile: VoiceProfile) => void;
  clear: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      profile: null,
      hasHydrated: false,
      setProfile: (profile) => set({ profile }),
      clear: () => set({ profile: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'vocax-session-v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (undefined as unknown as Storage))),
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
