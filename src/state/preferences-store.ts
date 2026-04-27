'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

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

function pickClientStorage(): StateStorage {
  const memory = new Map<string, string>();
  const inMemory: StateStorage = {
    getItem: (k) => memory.get(k) ?? null,
    setItem: (k, v) => {
      memory.set(k, v);
    },
    removeItem: (k) => {
      memory.delete(k);
    },
  };
  if (typeof window === 'undefined') return inMemory;
  for (const candidate of [window.localStorage, window.sessionStorage]) {
    try {
      const probe = '__vocax_probe__';
      candidate.setItem(probe, '1');
      candidate.removeItem(probe);
      return candidate;
    } catch {
      continue;
    }
  }
  return inMemory;
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
      storage: createJSONStorage(pickClientStorage),
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
