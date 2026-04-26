/**
 * Catálogo PT-BR curado para o MVP do Vocax.
 *
 * Cada entrada inclui:
 *  - extensão melódica (melodyLowMidi/melodyHighMidi) — derivada manualmente
 *    de partituras / análise auditiva. Dados aproximados, suficientes para
 *    o filtro duro do matching.
 *  - chave dominante (rootMidi + mode)
 *  - perfil de timbre por gênero (warm, bright, raspy)
 *  - dificuldade percebida 1..5
 *
 * Para o MVP usamos deep-link Spotify (sem áudio). Em produção, esta tabela
 * vira pgvector + atualização noturna via Spotify API + Demucs.
 */

export type Genre = 'sertanejo' | 'mpb' | 'pop' | 'gospel' | 'samba' | 'rock' | 'bossa' | 'forro';

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  /** Spotify track URI (deep-link). spotify:track:<id> ou URL https. */
  spotifyUrl: string;
  /** Apple Music opcional. */
  appleMusicUrl?: string;
  /** Extensão da melodia vocal (sem coros), em MIDI. */
  melodyLowMidi: number;
  melodyHighMidi: number;
  /** Tessitura predominante (zona onde a melodia mais "mora"). */
  tessituraLowMidi: number;
  tessituraHighMidi: number;
  /** Chave musical: nota raiz em MIDI + modo. */
  rootMidi: number;
  mode: 'major' | 'minor';
  bpm: number;
  /** 1..5, 1 = beginner-friendly. */
  difficulty: number;
  /** Cores/atmosferas que o timbre da música evoca. */
  timbreTags: Array<'quente' | 'brilhante' | 'soprosa' | 'rasgada' | 'aveludada' | 'expressiva'>;
  /** Indica se costuma soar bem para vozes femininas, masculinas, ou ambas. */
  voicePreference: 'feminine' | 'masculine' | 'any';
  year: number;
}

// MIDI helpers para o catálogo (mais legível):
// C4=60, D4=62, E4=64, F4=65, G4=67, A4=69, B4=71, C5=72, D5=74, E5=76, F5=77, G5=79, A5=81

export const CATALOG: Song[] = [
  // === MPB ===
  {
    id: 'mpb-aguasdeMarco',
    title: 'Águas de Março',
    artist: 'Elis Regina & Tom Jobim',
    genre: 'mpb',
    spotifyUrl: 'https://open.spotify.com/search/Águas%20de%20Março%20Elis%20Tom',
    melodyLowMidi: 57, melodyHighMidi: 74,
    tessituraLowMidi: 60, tessituraHighMidi: 70,
    rootMidi: 65, mode: 'major', bpm: 122, difficulty: 3,
    timbreTags: ['quente', 'expressiva'], voicePreference: 'any', year: 1972,
  },
  {
    id: 'mpb-construcao',
    title: 'Construção',
    artist: 'Chico Buarque',
    genre: 'mpb',
    spotifyUrl: 'https://open.spotify.com/search/Construção%20Chico%20Buarque',
    melodyLowMidi: 52, melodyHighMidi: 67,
    tessituraLowMidi: 55, tessituraHighMidi: 64,
    rootMidi: 64, mode: 'minor', bpm: 124, difficulty: 4,
    timbreTags: ['expressiva', 'rasgada'], voicePreference: 'masculine', year: 1971,
  },
  {
    id: 'mpb-travessia',
    title: 'Travessia',
    artist: 'Milton Nascimento',
    genre: 'mpb',
    spotifyUrl: 'https://open.spotify.com/search/Travessia%20Milton%20Nascimento',
    melodyLowMidi: 55, melodyHighMidi: 76,
    tessituraLowMidi: 60, tessituraHighMidi: 72,
    rootMidi: 65, mode: 'minor', bpm: 78, difficulty: 4,
    timbreTags: ['expressiva', 'aveludada'], voicePreference: 'any', year: 1967,
  },
  {
    id: 'mpb-comoNossosPais',
    title: 'Como Nossos Pais',
    artist: 'Elis Regina',
    genre: 'mpb',
    spotifyUrl: 'https://open.spotify.com/search/Como%20Nossos%20Pais%20Elis',
    melodyLowMidi: 58, melodyHighMidi: 75,
    tessituraLowMidi: 62, tessituraHighMidi: 71,
    rootMidi: 67, mode: 'major', bpm: 88, difficulty: 3,
    timbreTags: ['expressiva', 'brilhante'], voicePreference: 'feminine', year: 1976,
  },
  {
    id: 'mpb-trem-das-onze',
    title: 'Trem das Onze',
    artist: 'Adoniran Barbosa',
    genre: 'samba',
    spotifyUrl: 'https://open.spotify.com/search/Trem%20das%20Onze%20Adoniran',
    melodyLowMidi: 50, melodyHighMidi: 64,
    tessituraLowMidi: 53, tessituraHighMidi: 62,
    rootMidi: 60, mode: 'major', bpm: 105, difficulty: 1,
    timbreTags: ['quente'], voicePreference: 'any', year: 1964,
  },

  // === Sertanejo ===
  {
    id: 'sert-evidencias',
    title: 'Evidências',
    artist: 'Chitãozinho & Xororó',
    genre: 'sertanejo',
    spotifyUrl: 'https://open.spotify.com/search/Evidências%20Chitãozinho%20Xororó',
    melodyLowMidi: 55, melodyHighMidi: 76,
    tessituraLowMidi: 60, tessituraHighMidi: 72,
    rootMidi: 64, mode: 'major', bpm: 76, difficulty: 3,
    timbreTags: ['expressiva', 'brilhante'], voicePreference: 'any', year: 1990,
  },
  {
    id: 'sert-aiseeute',
    title: 'Ai Se Eu Te Pego',
    artist: 'Michel Teló',
    genre: 'sertanejo',
    spotifyUrl: 'https://open.spotify.com/search/Ai%20Se%20Eu%20Te%20Pego%20Michel%20Teló',
    melodyLowMidi: 57, melodyHighMidi: 72,
    tessituraLowMidi: 60, tessituraHighMidi: 69,
    rootMidi: 67, mode: 'major', bpm: 130, difficulty: 1,
    timbreTags: ['brilhante'], voicePreference: 'any', year: 2011,
  },
  {
    id: 'sert-temposertaneja',
    title: 'Tempo de Aprender',
    artist: 'Almir Sater',
    genre: 'sertanejo',
    spotifyUrl: 'https://open.spotify.com/search/Tocando%20em%20Frente%20Almir%20Sater',
    melodyLowMidi: 53, melodyHighMidi: 67,
    tessituraLowMidi: 57, tessituraHighMidi: 65,
    rootMidi: 64, mode: 'major', bpm: 78, difficulty: 2,
    timbreTags: ['quente', 'aveludada'], voicePreference: 'any', year: 1992,
  },
  {
    id: 'sert-fioCabelo',
    title: 'Fio de Cabelo',
    artist: 'Leandro & Leonardo',
    genre: 'sertanejo',
    spotifyUrl: 'https://open.spotify.com/search/Fio%20de%20Cabelo%20Leandro%20Leonardo',
    melodyLowMidi: 55, melodyHighMidi: 72,
    tessituraLowMidi: 59, tessituraHighMidi: 69,
    rootMidi: 62, mode: 'major', bpm: 80, difficulty: 2,
    timbreTags: ['expressiva'], voicePreference: 'masculine', year: 1991,
  },
  {
    id: 'sert-camarote',
    title: 'Camarote',
    artist: 'Wesley Safadão',
    genre: 'sertanejo',
    spotifyUrl: 'https://open.spotify.com/search/Camarote%20Wesley%20Safadão',
    melodyLowMidi: 57, melodyHighMidi: 72,
    tessituraLowMidi: 60, tessituraHighMidi: 69,
    rootMidi: 67, mode: 'major', bpm: 156, difficulty: 1,
    timbreTags: ['brilhante'], voicePreference: 'any', year: 2017,
  },

  // === Gospel ===
  {
    id: 'gos-ruaC',
    title: 'Ruahh',
    artist: 'Aline Barros',
    genre: 'gospel',
    spotifyUrl: 'https://open.spotify.com/search/Ruahh%20Aline%20Barros',
    melodyLowMidi: 60, melodyHighMidi: 79,
    tessituraLowMidi: 64, tessituraHighMidi: 74,
    rootMidi: 67, mode: 'major', bpm: 70, difficulty: 4,
    timbreTags: ['expressiva', 'brilhante'], voicePreference: 'feminine', year: 2010,
  },
  {
    id: 'gos-OcearioMaravilhoso',
    title: 'Oceanos',
    artist: 'Hillsong em Português',
    genre: 'gospel',
    spotifyUrl: 'https://open.spotify.com/search/Oceanos%20Hillsong%20Português',
    melodyLowMidi: 59, melodyHighMidi: 76,
    tessituraLowMidi: 62, tessituraHighMidi: 72,
    rootMidi: 64, mode: 'minor', bpm: 122, difficulty: 3,
    timbreTags: ['expressiva', 'aveludada'], voicePreference: 'any', year: 2013,
  },
  {
    id: 'gos-deus-cuida',
    title: 'Deus Cuida de Mim',
    artist: 'Kleber Lucas',
    genre: 'gospel',
    spotifyUrl: 'https://open.spotify.com/search/Deus%20Cuida%20de%20Mim%20Kleber%20Lucas',
    melodyLowMidi: 55, melodyHighMidi: 72,
    tessituraLowMidi: 59, tessituraHighMidi: 69,
    rootMidi: 67, mode: 'major', bpm: 74, difficulty: 2,
    timbreTags: ['quente', 'expressiva'], voicePreference: 'any', year: 2008,
  },

  // === Pop BR ===
  {
    id: 'pop-festa',
    title: 'Festa',
    artist: 'Ivete Sangalo',
    genre: 'pop',
    spotifyUrl: 'https://open.spotify.com/search/Festa%20Ivete%20Sangalo',
    melodyLowMidi: 60, melodyHighMidi: 76,
    tessituraLowMidi: 64, tessituraHighMidi: 72,
    rootMidi: 67, mode: 'major', bpm: 132, difficulty: 2,
    timbreTags: ['brilhante', 'expressiva'], voicePreference: 'feminine', year: 2003,
  },
  {
    id: 'pop-soquetava',
    title: 'Sozinho',
    artist: 'Caetano Veloso',
    genre: 'pop',
    spotifyUrl: 'https://open.spotify.com/search/Sozinho%20Caetano',
    melodyLowMidi: 53, melodyHighMidi: 69,
    tessituraLowMidi: 57, tessituraHighMidi: 65,
    rootMidi: 62, mode: 'minor', bpm: 84, difficulty: 2,
    timbreTags: ['quente', 'aveludada'], voicePreference: 'masculine', year: 1999,
  },
  {
    id: 'pop-anitta-envolver',
    title: 'Envolver',
    artist: 'Anitta',
    genre: 'pop',
    spotifyUrl: 'https://open.spotify.com/search/Envolver%20Anitta',
    melodyLowMidi: 55, melodyHighMidi: 72,
    tessituraLowMidi: 59, tessituraHighMidi: 67,
    rootMidi: 60, mode: 'minor', bpm: 96, difficulty: 2,
    timbreTags: ['brilhante', 'soprosa'], voicePreference: 'feminine', year: 2022,
  },

  // === Bossa Nova ===
  {
    id: 'bossa-garotaIpanema',
    title: 'Garota de Ipanema',
    artist: 'João Gilberto',
    genre: 'bossa',
    spotifyUrl: 'https://open.spotify.com/search/Garota%20de%20Ipanema%20João%20Gilberto',
    melodyLowMidi: 57, melodyHighMidi: 70,
    tessituraLowMidi: 60, tessituraHighMidi: 67,
    rootMidi: 65, mode: 'major', bpm: 130, difficulty: 2,
    timbreTags: ['aveludada', 'soprosa'], voicePreference: 'any', year: 1962,
  },
  {
    id: 'bossa-corcovado',
    title: 'Corcovado',
    artist: 'Tom Jobim',
    genre: 'bossa',
    spotifyUrl: 'https://open.spotify.com/search/Corcovado%20Tom%20Jobim',
    melodyLowMidi: 55, melodyHighMidi: 67,
    tessituraLowMidi: 58, tessituraHighMidi: 65,
    rootMidi: 60, mode: 'major', bpm: 96, difficulty: 1,
    timbreTags: ['quente', 'soprosa'], voicePreference: 'any', year: 1960,
  },

  // === Rock BR ===
  {
    id: 'rock-tempoperdido',
    title: 'Tempo Perdido',
    artist: 'Legião Urbana',
    genre: 'rock',
    spotifyUrl: 'https://open.spotify.com/search/Tempo%20Perdido%20Legião%20Urbana',
    melodyLowMidi: 50, melodyHighMidi: 67,
    tessituraLowMidi: 55, tessituraHighMidi: 64,
    rootMidi: 62, mode: 'minor', bpm: 90, difficulty: 2,
    timbreTags: ['rasgada', 'expressiva'], voicePreference: 'masculine', year: 1986,
  },
  {
    id: 'rock-ouvi-dizer',
    title: 'Ouvi Dizer',
    artist: 'Melim',
    genre: 'pop',
    spotifyUrl: 'https://open.spotify.com/search/Ouvi%20Dizer%20Melim',
    melodyLowMidi: 60, melodyHighMidi: 74,
    tessituraLowMidi: 62, tessituraHighMidi: 71,
    rootMidi: 65, mode: 'major', bpm: 92, difficulty: 1,
    timbreTags: ['aveludada', 'soprosa'], voicePreference: 'any', year: 2018,
  },

  // === Forró ===
  {
    id: 'forro-asa-branca',
    title: 'Asa Branca',
    artist: 'Luiz Gonzaga',
    genre: 'forro',
    spotifyUrl: 'https://open.spotify.com/search/Asa%20Branca%20Luiz%20Gonzaga',
    melodyLowMidi: 55, melodyHighMidi: 67,
    tessituraLowMidi: 58, tessituraHighMidi: 65,
    rootMidi: 60, mode: 'major', bpm: 122, difficulty: 1,
    timbreTags: ['expressiva', 'rasgada'], voicePreference: 'any', year: 1947,
  },
  {
    id: 'forro-explode',
    title: 'Explode Coração',
    artist: 'Gonzaguinha',
    genre: 'mpb',
    spotifyUrl: 'https://open.spotify.com/search/Explode%20Coração%20Gonzaguinha',
    melodyLowMidi: 57, melodyHighMidi: 72,
    tessituraLowMidi: 60, tessituraHighMidi: 69,
    rootMidi: 62, mode: 'major', bpm: 88, difficulty: 2,
    timbreTags: ['quente', 'expressiva'], voicePreference: 'any', year: 1989,
  },

  // === Samba ===
  {
    id: 'samba-aquarela',
    title: 'Aquarela do Brasil',
    artist: 'Ary Barroso',
    genre: 'samba',
    spotifyUrl: 'https://open.spotify.com/search/Aquarela%20do%20Brasil',
    melodyLowMidi: 55, melodyHighMidi: 72,
    tessituraLowMidi: 58, tessituraHighMidi: 67,
    rootMidi: 64, mode: 'major', bpm: 132, difficulty: 3,
    timbreTags: ['expressiva', 'brilhante'], voicePreference: 'any', year: 1939,
  },
  {
    id: 'samba-verme-paulo',
    title: 'O Mundo é um Moinho',
    artist: 'Cartola',
    genre: 'samba',
    spotifyUrl: 'https://open.spotify.com/search/O%20Mundo%20é%20um%20Moinho%20Cartola',
    melodyLowMidi: 55, melodyHighMidi: 69,
    tessituraLowMidi: 58, tessituraHighMidi: 65,
    rootMidi: 65, mode: 'minor', bpm: 70, difficulty: 2,
    timbreTags: ['quente', 'aveludada'], voicePreference: 'any', year: 1976,
  },
];
