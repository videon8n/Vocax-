'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from './button';

interface ShareActionsProps {
  shareText: string;
  shareUrl?: string;
}

export function ShareActions({ shareText, shareUrl }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = shareUrl ?? (typeof window !== 'undefined' ? window.location.href : '');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Meu Cartão de Voz · Vocax', text: shareText, url });
        return;
      } catch {
        // usuário cancelou — segue para fallback
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${url}`.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  }

  return (
    <Button onClick={handleShare} variant="ghost">
      {copied ? <Check className="h-4 w-4 text-sage" /> : <Share2 className="h-4 w-4" />}
      {copied ? 'Copiado!' : 'Compartilhar'}
      {!copied && <Copy className="hidden md:inline h-3.5 w-3.5 opacity-50" />}
    </Button>
  );
}
