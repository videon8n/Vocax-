'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/ui/header';
import { Button } from '@/ui/button';
import { useSession } from '@/state/session-store';
import { matchSongs, type MatchResult } from '@/features/songs/matcher';
import type { Genre } from '@/data/catalog';
import { ArrowUpRight, Music, ArrowLeft, Filter } from 'lucide-react';

const GENRES: Array<{ id: Genre; label: string }> = [
  { id: 'sertanejo', label: 'Sertanejo' },
  { id: 'mpb', label: 'MPB' },
  { id: 'gospel', label: 'Gospel' },
  { id: 'pop', label: 'Pop' },
  { id: 'samba', label: 'Samba' },
  { id: 'bossa', label: 'Bossa' },
  { id: 'rock', label: 'Rock' },
  { id: 'forro', label: 'Forró' },
];

export default function MusicasPage() {
  const profile = useSession((s) => s.profile);
  const hasHydrated = useSession((s) => s.hasHydrated);
  const router = useRouter();
  const [filterGenres, setFilterGenres] = useState<Set<Genre>>(new Set());

  useEffect(() => {
    if (hasHydrated && !profile) router.replace('/onboarding');
  }, [profile, hasHydrated, router]);

  const results = useMemo<MatchResult[]>(() => {
    if (!profile) return [];
    const all = matchSongs(
      {
        range: profile.range,
        timbre: profile.timbre,
        fach: profile.fach.primary,
        preferredGenres: Array.from(filterGenres),
      },
      30
    );
    if (filterGenres.size === 0) return all.slice(0, 12);
    return all.filter((r) => filterGenres.has(r.song.genre)).slice(0, 12);
  }, [profile, filterGenres]);

  function toggleGenre(g: Genre) {
    const next = new Set(filterGenres);
    if (next.has(g)) next.delete(g);
    else next.add(g);
    setFilterGenres(next);
  }

  if (!profile) return null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <Link href="/resultado" className="inline-flex items-center gap-2 text-sm text-graphite-300 hover:text-graphite-100 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao perfil
        </Link>

        <p className="text-sm uppercase tracking-[0.2em] text-amber mb-3">Curadoria pessoal</p>
        <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
          Suas músicas.
        </h1>
        <p className="mt-4 text-lg text-graphite-200 max-w-2xl">
          Cabem na sua extensão, combinam com seu timbre, e estão na chave certa.
        </p>

        {/* Filtros de gênero */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm text-graphite-300 mr-2">
            <Filter className="h-3.5 w-3.5" />
            Gênero
          </span>
          {GENRES.map((g) => {
            const active = filterGenres.has(g.id);
            return (
              <button
                key={g.id}
                onClick={() => toggleGenre(g.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors duration-240 ease-smooth border ${
                  active
                    ? 'bg-vocax-gradient border-transparent text-white shadow-md shadow-magenta/20'
                    : 'border-white/10 bg-white/5 text-graphite-100 hover:bg-white/10'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Lista de músicas */}
        <div className="mt-10 grid gap-3">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-8 text-center text-graphite-200">
              Nenhuma música cabe nesse filtro. Tente liberar mais gêneros.
            </div>
          ) : (
            results.map((m, i) => <SongRow key={m.song.id} match={m} rank={i + 1} />)
          )}
        </div>

        <div className="mt-12 rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <h3 className="font-display text-xl">Gostou?</h3>
            <p className="text-graphite-200 mt-1 text-sm">
              Em breve: plano de prática diária e overlay de pitch ao vivo enquanto você canta junto.
            </p>
          </div>
          <Button variant="ghost">Avise-me</Button>
        </div>
      </main>
    </>
  );
}

function SongRow({ match, rank }: { match: MatchResult; rank: number }) {
  const { song, transpose, reason, score } = match;
  const transposeLabel =
    transpose === 0
      ? 'Tom original'
      : `${transpose > 0 ? '+' : ''}${transpose} semiton${Math.abs(transpose) === 1 ? '' : 's'}`;
  const scorePct = Math.round(Math.max(0, Math.min(1, score)) * 100);

  return (
    <a
      href={song.spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-4 md:p-5 hover:bg-graphite-700/40 hover:border-white/10 transition-all duration-240 ease-smooth"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-vocax-gradient/15 text-amber font-display text-xl border border-amber/15">
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="font-medium text-base md:text-lg truncate">{song.title}</h3>
          <span className="text-sm text-graphite-300">{song.artist}</span>
        </div>
        <p className="mt-1 text-sm text-graphite-200 line-clamp-1">{reason}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-graphite-300 flex-wrap">
          <Tag>{song.genre.toUpperCase()}</Tag>
          <Tag>{transposeLabel}</Tag>
          <Tag>{song.bpm} BPM</Tag>
          <Tag>Dificuldade {song.difficulty}/5</Tag>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
        <div className="text-xs text-graphite-300">match</div>
        <div className="font-mono text-lg text-amber">{scorePct}%</div>
      </div>
      <div className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-graphite-100 transition-all duration-240 ease-smooth group-hover:bg-vocax-gradient group-hover:text-white">
        <ArrowUpRight className="h-5 w-5" />
      </div>
    </a>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">{children}</span>
  );
}
