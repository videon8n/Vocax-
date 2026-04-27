/**
 * Detecção de capacidades de áudio do navegador.
 *
 * Vocax depende de:
 *  - getUserMedia (microfone) — Chrome 47+, FF 36+, Safari 11+
 *  - AudioContext — universal moderno
 *  - AudioWorklet — Chrome 66+, FF 76+, Safari 14.1+ (iOS 14.5+)
 *  - Secure Context (HTTPS ou localhost)
 *
 * Sem AudioWorklet o pipeline de pitch não roda; o usuário precisa
 * de uma mensagem clara em vez de erro genérico.
 */

export interface AudioCapabilities {
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  hasAudioContext: boolean;
  hasAudioWorklet: boolean;
  isSecureContext: boolean;
  /** True se TUDO necessário para análise está disponível. */
  isFullySupported: boolean;
}

export function detectAudioCapabilities(): AudioCapabilities {
  if (typeof window === 'undefined') {
    return {
      hasMediaDevices: false,
      hasGetUserMedia: false,
      hasAudioContext: false,
      hasAudioWorklet: false,
      isSecureContext: false,
      isFullySupported: false,
    };
  }
  const hasMediaDevices = typeof navigator !== 'undefined' && !!navigator.mediaDevices;
  const hasGetUserMedia = hasMediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  const hasAudioContext = !!AudioCtx;
  const hasAudioWorklet =
    hasAudioContext &&
    typeof (AudioCtx.prototype as AudioContext & { audioWorklet?: AudioWorklet }).audioWorklet !== 'undefined';
  const isSecureContext = window.isSecureContext === true;

  const isFullySupported =
    hasMediaDevices && hasGetUserMedia && hasAudioContext && hasAudioWorklet && isSecureContext;

  return {
    hasMediaDevices,
    hasGetUserMedia,
    hasAudioContext,
    hasAudioWorklet,
    isSecureContext,
    isFullySupported,
  };
}

export interface CompatibilityIssue {
  code: 'no-secure-context' | 'no-media-devices' | 'no-audio-worklet' | 'no-audio-context';
  title: string;
  message: string;
  hint: string;
}

/**
 * Retorna a primeira incompatibilidade bloqueante, ou null se tudo OK.
 * Ordem importa — falhas estruturais primeiro.
 */
export function getBlockingIssue(caps: AudioCapabilities): CompatibilityIssue | null {
  if (!caps.isSecureContext) {
    return {
      code: 'no-secure-context',
      title: 'Conexão insegura',
      message: 'O Vocax precisa de HTTPS para acessar o seu microfone.',
      hint: 'Acesse o site através de uma conexão HTTPS ou via localhost para desenvolvimento.',
    };
  }
  if (!caps.hasMediaDevices || !caps.hasGetUserMedia) {
    return {
      code: 'no-media-devices',
      title: 'Microfone indisponível',
      message: 'Seu navegador não permite acesso ao microfone.',
      hint: 'Tente abrir em Chrome, Firefox ou Safari atualizados.',
    };
  }
  if (!caps.hasAudioContext) {
    return {
      code: 'no-audio-context',
      title: 'Áudio não suportado',
      message: 'Seu navegador não suporta a Web Audio API.',
      hint: 'Atualize para uma versão recente do Chrome, Firefox ou Safari.',
    };
  }
  if (!caps.hasAudioWorklet) {
    return {
      code: 'no-audio-worklet',
      title: 'Versão antiga do navegador',
      message: 'O Vocax precisa de uma funcionalidade que só existe a partir do Safari 14.5 (iOS 14.5), Chrome 66 ou Firefox 76.',
      hint: 'Atualize seu navegador ou abra o Vocax em um aparelho mais recente.',
    };
  }
  return null;
}
