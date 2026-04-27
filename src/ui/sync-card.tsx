'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudOff, Mail, LogOut, Check } from 'lucide-react';
import { Button } from './button';
import { toast } from './toast';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { pushProfile } from '@/lib/supabase/profile-sync';
import { useSession } from '@/state/session-store';

interface AuthUser {
  id: string;
  email?: string;
}

/**
 * Card opt-in para sync via Supabase.
 *
 * 3 estados visuais:
 *  - feature desligada (sem env vars) → CloudOff + explicação
 *  - logged out → input de email + magic link
 *  - logged in → ações sync/sair + email mostrado
 */
export function SyncCard() {
  const profile = useSession((s) => s.profile);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    void sb.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id, email: data.user.email ?? undefined });
    });
    const { data: sub } = sb.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) setUser({ id: session.user.id, email: session.user.email ?? undefined });
      else setUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const [emailError, setEmailError] = useState<string | null>(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    const trimmed = email.trim();
    if (!emailRegex.test(trimmed)) {
      setEmailError('Digite um email válido (ex: nome@dominio.com).');
      return;
    }
    const sb = getSupabaseBrowser();
    if (!sb) return;
    setLoading(true);
    const { error } = await sb.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/perfil` },
    });
    setLoading(false);
    if (error) {
      setEmailError(error.message);
      toast({ tone: 'error', title: 'Não foi possível enviar', description: error.message });
      return;
    }
    setEmailSent(true);
    toast({ tone: 'success', title: 'Enviado!', description: 'Confira o link mágico no seu email.' });
  }

  async function handleSync() {
    if (!profile) return;
    setLoading(true);
    const result = await pushProfile(profile);
    setLoading(false);
    if (result.ok) {
      toast({ tone: 'success', title: 'Salvo na nuvem', description: 'Disponível em qualquer device com seu login.' });
    } else {
      toast({ tone: 'error', title: 'Erro ao salvar', description: result.error ?? 'Tente novamente' });
    }
  }

  async function handleSignOut() {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    await sb.auth.signOut();
    setUser(null);
    setEmail('');
    setEmailSent(false);
    toast({ tone: 'info', title: 'Sessão encerrada', description: 'Seu perfil local continua aqui.' });
  }

  // Caso A: feature desligada
  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-graphite-300">
            <CloudOff className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-xl">Sincronização entre dispositivos</h3>
            <p className="mt-2 text-sm text-graphite-200 leading-relaxed">
              Esta instância do Vocax está rodando sem backend. Seu perfil fica salvo só
              neste navegador. Para ativar histórico e multi-device, é preciso configurar
              Supabase nas variáveis de ambiente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Caso B: logged in
  if (user) {
    return (
      <div className="rounded-2xl border border-sage/30 bg-sage/5 p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sage/15 text-sage">
            <Check className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h3 className="font-display text-xl">Conectado</h3>
            <p className="mt-1 text-sm text-graphite-200">
              {user.email} · seu histórico fica salvo na nuvem
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {profile && (
            <Button onClick={handleSync} loading={loading}>
              <Cloud className="h-4 w-4" />
              Salvar análise atual
            </Button>
          )}
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    );
  }

  // Caso C: logged out — magic link
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-vocax-gradient/15 border border-amber/20 text-amber">
          <Cloud className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-xl">Salvar a sua jornada</h3>
          <p className="mt-2 text-sm text-graphite-200 leading-relaxed">
            Opcional. Habilita histórico ilimitado, sincronização entre dispositivos e
            comparação com análises anteriores. Sua voz continua sendo processada
            localmente — só o resultado vai pra nuvem, criptografado.
          </p>
        </div>
      </div>
      {emailSent ? (
        <div className="rounded-xl border border-sage/30 bg-sage/5 p-4 text-sm text-graphite-100">
          Link mágico enviado para <strong>{email}</strong>. Abra no mesmo navegador.
        </div>
      ) : (
        <form onSubmit={handleSendMagicLink} noValidate className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="magic-email" className="sr-only">
                Email para receber link mágico
              </label>
              <input
                id="magic-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                aria-invalid={emailError ? 'true' : 'false'}
                aria-describedby={emailError ? 'magic-email-error' : undefined}
                placeholder="seu@email.com"
                className={`w-full rounded-xl border bg-graphite-900/60 px-4 py-3 text-base text-graphite-50 placeholder:text-graphite-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber min-h-[48px] ${
                  emailError ? 'border-danger/60' : 'border-white/10'
                }`}
              />
            </div>
            <Button type="submit" loading={loading}>
              <Mail className="h-4 w-4" />
              Enviar link
            </Button>
          </div>
          {emailError && (
            <p id="magic-email-error" role="alert" className="text-sm text-danger">
              {emailError}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
