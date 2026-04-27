'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

/**
 * Storage com graceful-degrade. Em Safari iOS no modo privado,
 * localStorage existe mas tem cota 0 — qualquer setItem joga QuotaExceededError.
 * Detectamos isso e caímos para sessionStorage; se ambos falharem,
 * usamos um stub em memória (perfil só vive na aba atual).
 */
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
      storage: createJSONStorage(pickClientStorage),
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * Hook utilitário que redireciona para `/onboarding` se não houver profile
 * APÓS hidratação. Substitui o padrão repetido em /resultado, /musicas, etc.
 *
 * Retorna `null` enquanto hidrata (caller deve renderizar fallback).
 */
export function useRequireProfile() {
  const profile = useSession((s) => s.profile);
  const hasHydrated = useSession((s) => s.hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !profile) router.replace('/onboarding');
  }, [hasHydrated, profile, router]);

  return { profile, hasHydrated, ready: hasHydrated && !!profile };
}
