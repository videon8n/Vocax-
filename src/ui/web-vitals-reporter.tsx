'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { track } from '@/lib/analytics';

/**
 * Reporta Core Web Vitals (CLS, LCP, INP, FCP, TTFB) para PostHog via track().
 * Sem opt-in de analytics, vira no-op silencioso (track é gated por consent).
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    track('web_vital', {
      name: metric.name,
      value: Math.round(metric.value * 100) / 100,
      rating: (metric as { rating?: string }).rating ?? 'unknown',
      navigationType: metric.navigationType ?? 'unknown',
      id: metric.id,
    });
  });
  return null;
}
