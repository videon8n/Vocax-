/**
 * pitch-stream.ts — bridge entre o AudioWorklet e o JS principal.
 * Anexa o pitch-processor.js, ouve mensagens e faz suavização leve.
 */

import type { MicHandle } from './capture';

export interface PitchSample {
  hz: number | null;
  confidence: number;
  rms: number;
  centroid: number;
  timestamp: number;
}

export interface PitchStreamHandle {
  worklet: AudioWorkletNode;
  stop: () => void;
}

export async function attachPitchStream(
  mic: MicHandle,
  onSample: (sample: PitchSample) => void
): Promise<PitchStreamHandle> {
  // Garante que o worklet seja carregado uma única vez por contexto
  await mic.audioContext.audioWorklet.addModule('/worklets/pitch-processor.js');

  const node = new AudioWorkletNode(mic.audioContext, 'pitch-processor', {
    numberOfInputs: 1,
    numberOfOutputs: 0,
    channelCount: 1,
    channelCountMode: 'explicit',
    channelInterpretation: 'speakers',
    processorOptions: { sampleRate: mic.audioContext.sampleRate },
  });

  // Buffer rolante de 5 amostras para mediana (estabilidade)
  const window: PitchSample[] = [];
  const WINDOW = 5;

  node.port.onmessage = (event) => {
    const sample = event.data as PitchSample;
    window.push(sample);
    if (window.length > WINDOW) window.shift();
    onSample(smooth(window));
  };

  mic.source.connect(node);

  return {
    worklet: node,
    stop: () => {
      try {
        mic.source.disconnect(node);
      } catch {}
      node.port.onmessage = null;
      node.disconnect();
    },
  };
}

/**
 * Mediana das últimas N amostras com confiança suficiente.
 * Reduz octave-jumps e ruído pontual.
 */
function smooth(window: PitchSample[]): PitchSample {
  const last = window[window.length - 1];
  const validHz = window
    .filter((s) => s.hz !== null && s.confidence > 0.5)
    .map((s) => s.hz as number)
    .sort((a, b) => a - b);

  if (validHz.length === 0) return last;

  const median = validHz[Math.floor(validHz.length / 2)];

  // Detecta octave jump no último frame e corrige
  let hz: number | null = last.hz;
  if (last.hz && median) {
    const ratio = last.hz / median;
    if (ratio > 1.8 && ratio < 2.2) hz = last.hz / 2;
    else if (ratio < 0.55 && ratio > 0.45) hz = last.hz * 2;
  }
  return { ...last, hz };
}
