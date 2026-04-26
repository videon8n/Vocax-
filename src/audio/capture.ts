/**
 * Captura de áudio do microfone com permissões e tratamento de erro.
 * Toda a lógica de baixo nível com getUserMedia mora aqui.
 */

export type MicState = 'idle' | 'requesting' | 'ready' | 'denied' | 'error';

export interface MicError {
  code: 'permission' | 'no-device' | 'insecure-context' | 'unsupported' | 'unknown';
  message: string;
}

export interface MicHandle {
  stream: MediaStream;
  audioContext: AudioContext;
  source: MediaStreamAudioSourceNode;
  sampleRate: number;
  stop: () => void;
}

export async function requestMicrophone(): Promise<MicHandle> {
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw createMicError('unsupported', 'Seu navegador não suporta captura de áudio.');
  }
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    throw createMicError(
      'insecure-context',
      'O Vocax precisa rodar em HTTPS para acessar o microfone.'
    );
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
      video: false,
    });
  } catch (err: unknown) {
    const e = err as DOMException;
    if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
      throw createMicError('permission', 'Você precisa permitir o acesso ao microfone.');
    }
    if (e.name === 'NotFoundError' || e.name === 'OverconstrainedError') {
      throw createMicError('no-device', 'Não encontramos um microfone disponível.');
    }
    throw createMicError('unknown', e.message || 'Erro desconhecido ao acessar o microfone.');
  }

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioCtx({ latencyHint: 'interactive' });
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  const source = audioContext.createMediaStreamSource(stream);

  return {
    stream,
    audioContext,
    source,
    sampleRate: audioContext.sampleRate,
    stop: () => {
      stream.getTracks().forEach((t) => t.stop());
      void audioContext.close();
    },
  };
}

function createMicError(code: MicError['code'], message: string): MicError {
  return { code, message };
}

export function isMicError(err: unknown): err is MicError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'message' in err &&
    typeof (err as MicError).code === 'string'
  );
}
