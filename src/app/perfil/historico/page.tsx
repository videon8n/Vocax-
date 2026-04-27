'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/ui/header';
import { Button } from '@/ui/button';
import { Skeleton } from '@/ui/skeleton';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { listProfiles, exportProfilesAsJson, type VoiceProfileRow } from '@/lib/supabase/profile-sync';
import { midiToNoteName } from '@/lib/music';
import { ArrowLeft, Download, CloudOff } from 'lucide-react';

export default function HistoricoPage() {
  const [rows, setRows] = useState<VoiceProfileRow[] | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthed(false);
      return;
    }
    const sb = getSupabaseBrowser();
    if (!sb) {
      setAuthed(false);
      return;
    }
    void (async () => {
      const { data } = await sb.auth.getUser();
      if (!data.user) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      const list = await listProfiles();
      setRows(list);
    })();
  }, []);

  function handleExport() {
    if (!rows) return;
    const json = exportProfilesAsJson(rows);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocax-historico-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-2 text-sm text-graphite-300 hover:text-graphite-100 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao perfil
        </Link>

        <h1 className="font-display text-4xl tracking-tight">Histórico</h1>
        <p className="mt-3 text-graphite-200">
          Suas análises ao longo do tempo. Veja como sua voz mudou.
        </p>

        {!isSupabaseConfigured && (
          <div className="mt-10 rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6">
            <div className="flex items-start gap-3">
              <CloudOff className="h-5 w-5 text-graphite-300 mt-1" aria-hidden="true" />
              <div>
                <h2 className="font-display text-xl">Sincronização não configurada</h2>
                <p className="mt-2 text-sm text-graphite-200 leading-relaxed">
                  Esta instância do Vocax não tem backend ativo. Histórico fica
                  disponível depois que a sincronização opcional for habilitada.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSupabaseConfigured && authed === false && (
          <div className="mt-10 rounded-2xl border border-amber/20 bg-amber/5 p-6">
            <h2 className="font-display text-xl">Você não está conectado.</h2>
            <p className="mt-2 text-sm text-graphite-200">
              Faça login pelo card de sincronização em <Link href="/perfil" className="text-amber underline-offset-4 hover:underline">/perfil</Link> para ver seu histórico.
            </p>
          </div>
        )}

        {isSupabaseConfigured && authed && rows === null && (
          <div className="mt-10 space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {isSupabaseConfigured && authed && rows && rows.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6 text-center">
            <p className="text-graphite-200">Nenhuma análise sincronizada ainda.</p>
            <Link href="/onboarding" className="button-primary mt-5 inline-flex">
              Fazer minha primeira análise
            </Link>
          </div>
        )}

        {isSupabaseConfigured && authed && rows && rows.length > 0 && (
          <>
            <div className="mt-10 space-y-3">
              {rows.map((row) => (
                <article
                  key={row.id}
                  className="rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-5"
                >
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <h2 className="font-display text-2xl text-gradient">
                      {row.profile.fach.primaryLabel}
                    </h2>
                    <p className="text-sm text-graphite-300">
                      {new Date(row.created_at).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <p className="mt-2 font-mono text-sm text-graphite-200">
                    {midiToNoteName(row.profile.range.lowMidi)} —{' '}
                    {midiToNoteName(row.profile.range.highMidi)} ·{' '}
                    {row.profile.range.spanSemitones} semitons
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.profile.timbre.adjectives.map((a) => (
                      <span
                        key={a}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-graphite-100"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <Button variant="ghost" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Exportar JSON (LGPD)
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
