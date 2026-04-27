'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/ui/header';
import { Button } from '@/ui/button';
import { Skeleton } from '@/ui/skeleton';
import { useSession } from '@/state/session-store';
import { encodeCompareToken } from '@/lib/compare-token';
import { track } from '@/lib/analytics';
import { toast } from '@/ui/toast';
import { Users, Copy, Check, ArrowRight } from 'lucide-react';

export default function ComparePage() {
  const profile = useSession((s) => s.profile);
  const hasHydrated = useSession((s) => s.hasHydrated);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const token = useMemo(() => {
    if (!profile) return null;
    return encodeCompareToken({
      fach: profile.fach.primaryLabel,
      fachKey: profile.fach.primary,
      lowMidi: profile.range.lowMidi,
      highMidi: profile.range.highMidi,
      tessLow: profile.range.tessituraLowMidi,
      tessHigh: profile.range.tessituraHighMidi,
      spanSemitones: profile.range.spanSemitones,
      adjectives: profile.timbre.adjectives,
      brightness: profile.timbre.brightness,
      warmth: profile.timbre.warmth,
      breathiness: profile.timbre.breathiness,
      expressiveness: profile.timbre.expressiveness,
      createdAt: profile.createdAt,
    });
  }, [profile]);

  const shareUrl = token && origin ? `${origin}/compare/${token}` : '';

  async function handleCopy() {
    if (!shareUrl) return;
    track('compare_link_generated');
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ tone: 'success', title: 'Link copiado!', description: 'Mande pra um amigo comparar a voz.' });
    setTimeout(() => setCopied(false), 2400);
  }

  async function handleNativeShare() {
    if (!shareUrl) return;
    track('compare_link_generated');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Compare sua voz com a minha · Vocax',
          text: 'Acabei de descobrir minha voz no Vocax. Faz a sua e compara comigo:',
          url: shareUrl,
        });
        return;
      } catch {
        // cancelado
      }
    }
    void handleCopy();
  }

  if (!hasHydrated) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-16">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="mt-4 h-5 w-full" />
          <Skeleton className="mt-2 h-5 w-3/4" />
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-display text-3xl">Faça sua análise primeiro.</h1>
          <p className="mt-3 text-graphite-200">
            Para comparar com um amigo, você precisa do seu próprio perfil vocal.
          </p>
          <div className="mt-8">
            <Link href="/onboarding" className="button-primary">
              Começar análise
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm uppercase tracking-[0.2em] text-amber mb-4">Compare com um amigo</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
          Compartilhe e descubra <br />
          <span className="text-gradient">como vocês combinam.</span>
        </h1>
        <p className="mt-5 text-lg text-graphite-200 max-w-xl">
          Mande este link pra alguém. Quando essa pessoa fizer a análise dela, vocês
          dois veem lado a lado: extensão, timbre, fach e harmonia possível.
        </p>

        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-vocax-gradient/15 border border-amber/20 text-amber">
              <Users className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-sm text-graphite-200">
              Link único válido por 7 dias. Sem servidor — o token carrega o cartão direto na URL.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-graphite-900/60 p-3 font-mono text-xs text-graphite-300 break-all select-all">
            {shareUrl || '...'}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button onClick={handleNativeShare}>
              <Users className="h-4 w-4" />
              Compartilhar
            </Button>
            <Button onClick={handleCopy} variant="ghost">
              {copied ? <Check className="h-4 w-4 text-sage" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado' : 'Copiar link'}
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/resultado" className="text-sm text-graphite-300 hover:text-graphite-100">
            ← Voltar ao meu resultado
          </Link>
        </div>
      </main>
    </>
  );
}
