'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import type { CompatibilityIssue } from '@/audio/capabilities';

interface Props {
  issue: CompatibilityIssue;
}

/**
 * Tela bloqueante mostrada quando o navegador não suporta o pipeline
 * de áudio do Vocax. É educativa e propõe alternativas em vez de
 * derrubar o usuário num erro genérico.
 */
export function UnsupportedBrowser({ issue }: Props) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-3xl border border-amber/30 bg-amber/5 p-8 md:p-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/15 text-amber">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-3xl md:text-4xl tracking-tight">
          {issue.title}
        </h1>
        <p className="mt-4 text-graphite-200 leading-relaxed text-lg">{issue.message}</p>
        <p className="mt-4 text-graphite-300 leading-relaxed">
          <strong className="text-graphite-100">Como resolver:</strong> {issue.hint}
        </p>
        <ul className="mt-6 space-y-2 text-sm text-graphite-200">
          <li>• Chrome 66+ (Android, desktop)</li>
          <li>• Firefox 76+ (Android, desktop)</li>
          <li>• Safari 14.5+ (iOS 14.5 ou superior, macOS Big Sur+)</li>
          <li>• Edge 79+</li>
        </ul>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="/" className="button-ghost">
            Voltar ao início
          </Link>
          <Link href="/sobre" className="button-ghost">
            Saiba mais sobre a tecnologia
          </Link>
        </div>
      </div>
    </main>
  );
}
