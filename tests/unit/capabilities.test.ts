import { describe, it, expect } from 'vitest';
import { detectAudioCapabilities, getBlockingIssue } from '@/audio/capabilities';

describe('detectAudioCapabilities (jsdom env)', () => {
  it('returns a fully-shaped object', () => {
    const caps = detectAudioCapabilities();
    expect(caps).toHaveProperty('hasMediaDevices');
    expect(caps).toHaveProperty('hasGetUserMedia');
    expect(caps).toHaveProperty('hasAudioContext');
    expect(caps).toHaveProperty('hasAudioWorklet');
    expect(caps).toHaveProperty('isSecureContext');
    expect(caps).toHaveProperty('isFullySupported');
  });

  it('isFullySupported is false in jsdom (no AudioWorklet)', () => {
    const caps = detectAudioCapabilities();
    expect(caps.isFullySupported).toBe(false);
  });

  it('does not throw even when AudioContext.prototype.audioWorklet is a getter', () => {
    // Reproduz o caso real de Chrome onde audioWorklet é getter no prototype
    // que joga TypeError: Illegal invocation se acessado fora de instance.
    class FakeAudioContext {}
    Object.defineProperty(FakeAudioContext.prototype, 'audioWorklet', {
      get() {
        throw new TypeError('Illegal invocation');
      },
      configurable: true,
    });
    const original = (window as unknown as { AudioContext?: unknown }).AudioContext;
    (window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;

    expect(() => detectAudioCapabilities()).not.toThrow();
    const caps = detectAudioCapabilities();
    expect(caps.hasAudioContext).toBe(true);
    // 'in' não chama o getter, então deve ver a propriedade como existente
    expect(caps.hasAudioWorklet).toBe(true);

    (window as unknown as { AudioContext?: unknown }).AudioContext = original;
  });
});

describe('getBlockingIssue', () => {
  it('returns null when everything is supported', () => {
    expect(
      getBlockingIssue({
        hasMediaDevices: true,
        hasGetUserMedia: true,
        hasAudioContext: true,
        hasAudioWorklet: true,
        isSecureContext: true,
        isFullySupported: true,
      })
    ).toBeNull();
  });

  it('flags insecure context first (highest priority)', () => {
    const issue = getBlockingIssue({
      hasMediaDevices: true,
      hasGetUserMedia: true,
      hasAudioContext: true,
      hasAudioWorklet: true,
      isSecureContext: false,
      isFullySupported: false,
    });
    expect(issue?.code).toBe('no-secure-context');
  });

  it('flags missing AudioWorklet (iOS Safari < 14.5 case)', () => {
    const issue = getBlockingIssue({
      hasMediaDevices: true,
      hasGetUserMedia: true,
      hasAudioContext: true,
      hasAudioWorklet: false,
      isSecureContext: true,
      isFullySupported: false,
    });
    expect(issue?.code).toBe('no-audio-worklet');
    expect(issue?.message).toContain('Safari');
  });

  it('every issue includes a hint', () => {
    const issue = getBlockingIssue({
      hasMediaDevices: false,
      hasGetUserMedia: false,
      hasAudioContext: true,
      hasAudioWorklet: true,
      isSecureContext: true,
      isFullySupported: false,
    });
    expect(issue?.hint).toBeDefined();
    expect((issue?.hint ?? '').length).toBeGreaterThan(10);
  });
});
