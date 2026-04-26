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
          <Block title="O que enviamos">
            Hoje, nada. Quando o login chegar, você poderá optar por sincronizar seu histórico — sempre
            como vetores numéricos, nunca como áudio.
          </Block>
          <Block title="Como apagar tudo">
            Vá em <Link href="/perfil" className="text-amber underline-offset-4 hover:underline">Meu
            perfil</Link> e clique em "Esquecer-me". Limpa todos os dados deste navegador imediatamente.
          </Block>
          <Block title="Cookies e analytics">
            O Vocax não usa cookies de rastreamento. Métricas anônimas de uso (sem identificadores
            pessoais) podem ser coletadas via PostHog para melhorar o produto.
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
