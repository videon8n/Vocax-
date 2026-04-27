'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PreferencesState {
  /** Som ambiente em transições/celebrações. Default: false. */
  soundEnabled: boolean;
  /** Já aceitou banner de analytics anônimo. null = ainda não respondeu. */
  analyticsConsent: boolean | null;
  hasHydrated: boolean;
  setSoundEnabled: (v: boolean) => void;
  setAnalyticsConsent: (v: boolean) => void;
  setHasHydrated: (v: boolean) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      soundEnabled: false,
      analyticsConsent: null,
      hasHydrated: false,
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setAnalyticsConsent: (v) => set({ analyticsConsent: v }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'vocax-preferences-v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : (undefined as unknown as Storage)
      ),
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        analyticsConsent: state.analyticsConsent,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
