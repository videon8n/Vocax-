'use client';

import { useState } from 'react';
import { Copy, Check, Share2, Twitter, MessageCircle } from 'lucide-react';
import { Button } from './button';
import { toast } from './toast';
import { track } from '@/lib/analytics';

interface ShareActionsProps {
  shareText: string;
  shareUrl?: string;
  /** Hashtags adicionados ao tweet (sem #). */
  hashtags?: string[];
}

/**
 * Compartilhamento com fallback inteligente:
 *  - Web Share API (mobile + alguns desktops)
 *  - Botões dedicados Twitter / WhatsApp visíveis em desktop como atalho
 *  - Copiar link sempre como último fallback
 */
export function ShareActions({
  shareText,
  shareUrl,
  hashtags = ['Vocax', 'MinhaVoz'],
}: ShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const url = shareUrl ?? (typeof window !== 'undefined' ? window.location.href : 'https://vocax.app');
  const tag = `#${hashtags.join(' #')}`;
  const fullText = `${shareText} ${tag}`;

  async function handleNativeShare() {
    track('card_shared', { channel: 'native' });
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Meu Cartão de Voz · Vocax', text: shareText, url });
        return;
      } catch {
        // usuário cancelou — segue para fallback
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${fullText} ${url}`.trim());
      setCopied(true);
      toast({ tone: 'success', title: 'Copiado!', description: 'Pronto para colar onde quiser.' });
      setTimeout(() => setCopied(false), 2400);
    }
  }

  function handleTwitter() {
    track('card_shared', { channel: 'twitter' });
    const u = new URL('https://twitter.com/intent/tweet');
    u.searchParams.set('text', fullText);
    u.searchParams.set('url', url);
    window.open(u.toString(), '_blank', 'noopener,noreferrer');
  }

  function handleWhatsApp() {
    track('card_shared', { channel: 'whatsapp' });
    const u = new URL('https://wa.me/');
    u.searchParams.set('text', `${fullText} ${url}`);
    window.open(u.toString(), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button onClick={handleNativeShare} variant="ghost" aria-label="Compartilhar cartão de voz">
        {copied ? <Check className="h-4 w-4 text-sage" /> : <Share2 className="h-4 w-4" />}
        {copied ? 'Copiado!' : 'Compartilhar'}
        {!copied && <Copy className="hidden md:inline h-3.5 w-3.5 opacity-50" />}
      </Button>
      <button
        type="button"
        onClick={handleTwitter}
        aria-label="Compartilhar no Twitter"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-graphite-100 transition-all duration-base ease-smooth hover:bg-white/10 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber min-h-[48px]"
      >
        <Twitter className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Twitter</span>
      </button>
      <button
        type="button"
        onClick={handleWhatsApp}
        aria-label="Compartilhar no WhatsApp"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-graphite-100 transition-all duration-base ease-smooth hover:bg-white/10 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber min-h-[48px]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>
    </div>
  );
}
