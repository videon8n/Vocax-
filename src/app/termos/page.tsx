import { Header } from '@/ui/header';

export const metadata = { title: 'Termos' };

export default function TermosPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-4xl tracking-tight">Termos de uso</h1>
        <p className="mt-6 text-graphite-200 leading-relaxed">
          O Vocax é uma ferramenta de análise vocal e recomendação musical. Não substitui orientação
          médica, fonoaudiológica ou pedagógica. Use por sua conta e risco.
        </p>
        <p className="mt-4 text-graphite-200 leading-relaxed">
          Os links para Spotify e Apple Music são deep-links públicos. O Vocax não hospeda, distribui
          ou licencia conteúdo musical de terceiros.
        </p>
        <p className="mt-4 text-graphite-200 leading-relaxed">
          Este é um produto em desenvolvimento. Funcionalidades podem mudar sem aviso prévio.
        </p>
      </main>
    </>
  );
}
