import { Header } from '@/ui/header';
import Link from 'next/link';

export const metadata = { title: 'Privacidade' };

export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12 prose prose-invert">
        <h1 className="font-display text-4xl tracking-tight">Privacidade</h1>
        <p className="text-graphite-200 mt-4 leading-relaxed">
          Voz é um dado biométrico — protegido pela LGPD (Brasil) e por leis equivalentes no exterior.
          O Vocax foi construído com privacidade no centro.
        </p>

        <section className="mt-10 space-y-6">
          <Block title="Onde a análise acontece">
            Toda a análise vocal — detecção de pitch, extensão, fach e timbre — roda no seu próprio
            navegador, dentro de um <em>AudioWorklet</em>. <strong>Áudio bruto nunca é enviado para
            qualquer servidor.</strong>
          </Block>
          <Block title="O que guardamos">
            Apenas o resultado agregado da análise (faixa de notas, adjetivos, fach) é salvo localmente
            no <code>localStorage</code> do seu navegador. Nada é sincronizado com a nuvem no MVP atual.
          </Block>
          <Block title="O que enviamos (com seu opt-in)">
            Sincronização entre dispositivos é opcional. Se você ativar o login (magic link via email),
            apenas o resultado agregado da análise é salvo no nosso backend (Supabase, Postgres com
            Row-Level Security). Áudio nunca é enviado, nem sequer descritores brutos do pitch — só
            extensão, tessitura, adjetivos de timbre e fach.
          </Block>
          <Block title="Como apagar tudo">
            Vá em <Link href="/perfil" className="text-amber underline-offset-4 hover:underline">Meu
            perfil</Link> e clique em "Esquecer-me". Limpa o navegador imediatamente. Se você usar
            sincronização, "Esquecer-me" também apaga o histórico do servidor (cascade delete).
          </Block>
          <Block title="Direitos do titular (LGPD)">
            <strong>Acesso e portabilidade:</strong> exporte todo o histórico em JSON na página{' '}
            <Link href="/perfil/historico" className="text-amber underline-offset-4 hover:underline">/perfil/historico</Link>.{' '}
            <strong>Retificação:</strong> refazendo a análise. <strong>Eliminação:</strong> botão
            "Esquecer-me" no perfil. <strong>Oposição:</strong> não use o app, ou desative analytics
            opt-in no banner inferior.
          </Block>
          <Block title="Cookies e analytics">
            Sem cookies de rastreamento. Há um banner discreto pedindo permissão para enviar eventos
            agregados (passos completados, gêneros preferidos) via PostHog. Sem PII, sem fingerprint,
            sem cross-site tracking — e você pode recusar com 1 clique sem perda funcional.
          </Block>
        </section>

        <p className="mt-12 text-sm text-graphite-300">
          Atualizado em abril de 2026. Dúvidas? <a className="underline" href="mailto:privacidade@vocax.app">privacidade@vocax.app</a>
        </p>
      </main>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-graphite-800/40 p-6">
      <h2 className="font-display text-xl mb-2">{title}</h2>
      <p className="text-graphite-200 leading-relaxed">{children}</p>
    </div>
  );
}
