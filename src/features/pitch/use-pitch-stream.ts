'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { requestMicrophone, isMicError, type MicError, type MicHandle } from '@/audio/capture';
import { attachPitchStream, type PitchSample, type PitchStreamHandle } from '@/audio/pitch-stream';

export type PitchStreamStatus = 'idle' | 'starting' | 'listening' | 'stopped' | 'error';

export interface UsePitchStreamResult {
  status: PitchStreamStatus;
  start: () => Promise<void>;
  stop: () => void;
  latest: PitchSample | null;
  /** Histórico crescente desde o início da sessão (descartado em stop). */
  history: PitchSample[];
  /** Snapshot síncrono do histórico atual — útil em callbacks fora do React. */
  getHistory: () => PitchSample[];
  error: MicError | null;
  rmsLevel: number;
}

export function usePitchStream(): UsePitchStreamResult {
  const [status, setStatus] = useState<PitchStreamStatus>('idle');
  const [latest, setLatest] = useState<PitchSample | null>(null);
  const [error, setError] = useState<MicError | null>(null);
  const [rmsLevel, setRmsLevel] = useState(0);

  const micRef = useRef<MicHandle | null>(null);
  const streamRef = useRef<PitchStreamHandle | null>(null);
  const historyRef = useRef<PitchSample[]>([]);
  const [history, setHistory] = useState<PitchSample[]>([]);

  const start = useCallback(async () => {
    if (micRef.current) return;
    setStatus('starting');
    setError(null);
    historyRef.current = [];
    setHistory([]);

    try {
      const mic = await requestMicrophone();
      micRef.current = mic;
      const handle = await attachPitchStream(mic, (sample) => {
        setLatest(sample);
        setRmsLevel(sample.rms);
        historyRef.current.push(sample);
      });
      streamRef.current = handle;
      setStatus('listening');
    } catch (err) {
      if (isMicError(err)) setError(err);
      else setError({ code: 'unknown', message: 'Erro ao iniciar a captura.' });
      setStatus('error');
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.stop();
    micRef.current?.stop();
    streamRef.current = null;
    micRef.current = null;
    setHistory([...historyRef.current]);
    setStatus('stopped');
  }, []);

  // cleanup ao desmontar
  useEffect(() => {
    return () => {
      streamRef.current?.stop();
      micRef.current?.stop();
    };
  }, []);

  const getHistory = useCallback(() => historyRef.current.slice(), []);

  return { status, start, stop, latest, history, getHistory, error, rmsLevel };
}
