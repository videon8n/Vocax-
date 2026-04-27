/**
 * pitch-processor.js — AudioWorklet do Vocax
 *
 * Implementa o algoritmo YIN (de Cheveigné & Kawahara, 2002) para detecção
 * de frequência fundamental (f0) em tempo real. Roda em thread dedicada de
 * áudio, sem bloquear o thread principal de UI.
 *
 * Saída: posta a cada frame ~23ms (1024 samples @ 44.1kHz):
 *   {
 *     hz: number | null,       // f0 estimada, ou null se confiança baixa
 *     confidence: number,      // 0..1 (1 - aperiodicidade YIN)
 *     rms: number,             // energia RMS do bloco (para VAD)
 *     centroid: number,        // centróide espectral aproximado (brilho)
 *     timestamp: number        // ms desde currentTime do worklet
 *   }
 */

const SAMPLE_RATE_DEFAULT = 44100;
const BUFFER_SIZE = 2048;          // janela de análise YIN
const MIN_F0_HZ = 60;              // ~B1, mais grave que baixo
const MAX_F0_HZ = 1200;            // ~D6, acima do alcance soprano
const YIN_THRESHOLD = 0.15;        // limiar clássico do YIN
const RMS_GATE_FLOOR = 0.003;      // floor absoluto — abaixo disso é ruído de mic
const RMS_GATE_FACTOR = 0.12;      // gate adaptativo = pico observado * fator
const CALIBRATION_FRAMES = 30;     // ~1.4s a 44.1k para aprender o ambiente

class PitchProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.sampleRate = (options && options.processorOptions && options.processorOptions.sampleRate) || sampleRate || SAMPLE_RATE_DEFAULT;
    this.buffer = new Float32Array(BUFFER_SIZE);
    this.bufferIdx = 0;
    this.yinBuffer = new Float32Array(BUFFER_SIZE / 2);
    this.tauMin = Math.max(2, Math.floor(this.sampleRate / MAX_F0_HZ));
    this.tauMax = Math.min(this.yinBuffer.length - 1, Math.floor(this.sampleRate / MIN_F0_HZ));
    // VAD adaptativo: aprende o pico de RMS nos primeiros frames e
    // dimensiona o gate. Ambientes barulhentos sobem o gate; silenciosos baixam.
    this.peakRms = 0;
    this.framesProcessed = 0;
    // Hysteresis para evitar piscamento entre voz/silêncio em fronteira
    this.lastVoiced = false;
  }

  /**
   * YIN — passos 1 a 5 do paper.
   * Retorna { hz, confidence } ou { hz: null, confidence: 0 }.
   */
  yin(buffer) {
    const yin = this.yinBuffer;
    const half = yin.length;

    // Passo 1+2: diferença e função de diferença cumulativa normalizada
    yin[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < half; tau++) {
      let diff = 0;
      for (let i = 0; i < half; i++) {
        const delta = buffer[i] - buffer[i + tau];
        diff += delta * delta;
      }
      runningSum += diff;
      yin[tau] = diff * tau / runningSum;
    }

    // Passo 3: limiar absoluto — primeiro mínimo abaixo do limiar
    let tauEstimate = -1;
    for (let tau = this.tauMin; tau <= this.tauMax; tau++) {
      if (yin[tau] < YIN_THRESHOLD) {
        // procura o mínimo local
        while (tau + 1 <= this.tauMax && yin[tau + 1] < yin[tau]) tau++;
        tauEstimate = tau;
        break;
      }
    }
    if (tauEstimate === -1) {
      // fallback: melhor candidato
      let minVal = Infinity;
      for (let tau = this.tauMin; tau <= this.tauMax; tau++) {
        if (yin[tau] < minVal) {
          minVal = yin[tau];
          tauEstimate = tau;
        }
      }
      if (tauEstimate < 0 || minVal > 0.5) {
        return { hz: null, confidence: 0 };
      }
    }

    // Passo 4: interpolação parabólica para refinar
    const x0 = tauEstimate - 1 >= 0 ? yin[tauEstimate - 1] : yin[tauEstimate];
    const x1 = yin[tauEstimate];
    const x2 = tauEstimate + 1 < half ? yin[tauEstimate + 1] : yin[tauEstimate];
    const a = (x0 + x2 - 2 * x1) / 2;
    const b = (x2 - x0) / 2;
    const tauRefined = a !== 0 ? tauEstimate - b / (2 * a) : tauEstimate;

    const hz = this.sampleRate / tauRefined;
    const confidence = Math.max(0, Math.min(1, 1 - x1));

    if (hz < MIN_F0_HZ || hz > MAX_F0_HZ) {
      return { hz: null, confidence: 0 };
    }
    return { hz, confidence };
  }

  /** RMS de um bloco. */
  rms(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
    return Math.sqrt(sum / buffer.length);
  }

  /** Centróide espectral aproximado via zero-crossing rate (proxy barato). */
  spectralCentroidProxy(buffer) {
    let crossings = 0;
    for (let i = 1; i < buffer.length; i++) {
      if ((buffer[i - 1] >= 0) !== (buffer[i] >= 0)) crossings++;
    }
    // converte ZCR em estimativa de centróide (heurística): ZCR * Fs / 2
    return (crossings / buffer.length) * this.sampleRate / 2;
  }

  /** Gate adaptativo: durante calibração usa floor; depois usa fator do pico. */
  computeGate() {
    if (this.framesProcessed < CALIBRATION_FRAMES) return RMS_GATE_FLOOR;
    return Math.max(RMS_GATE_FLOOR, this.peakRms * RMS_GATE_FACTOR);
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const channel = input[0];

    for (let i = 0; i < channel.length; i++) {
      this.buffer[this.bufferIdx++] = channel[i];
      if (this.bufferIdx >= BUFFER_SIZE) {
        const rms = this.rms(this.buffer);
        if (rms > this.peakRms) this.peakRms = rms;
        this.framesProcessed += 1;

        const gate = this.computeGate();
        // Hysteresis: se já estávamos vozeados, aceitamos cair até 70% do gate
        const hystGate = this.lastVoiced ? gate * 0.7 : gate;
        let result = { hz: null, confidence: 0 };
        if (rms > hystGate) {
          result = this.yin(this.buffer);
          this.lastVoiced = result.hz !== null;
        } else {
          this.lastVoiced = false;
        }
        const centroid = this.spectralCentroidProxy(this.buffer);
        this.port.postMessage({
          hz: result.hz,
          confidence: result.confidence,
          rms,
          centroid,
          timestamp: currentTime * 1000,
        });
        // janela deslizante 50% para suavidade
        this.buffer.copyWithin(0, BUFFER_SIZE / 2);
        this.bufferIdx = BUFFER_SIZE / 2;
      }
    }
    return true;
  }
}

registerProcessor('pitch-processor', PitchProcessor);
