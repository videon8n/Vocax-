import { Header } from '@/ui/header';

export const metadata = { title: 'Sobre' };

export default function SobrePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-4xl tracking-tight">Sobre o Vocax</h1>
        <p className="mt-6 text-lg text-graphite-200 leading-relaxed">
          O Vocax nasceu de uma pergunta simples que todo cantor faz: <em>"qual música cai bem na minha voz?"</em>
        </p>
        <p className="mt-4 text-graphite-200 leading-relaxed">
          Apps existentes treinam afinação, são sociais ou viram karaokê. Nenhum deles fecha o ciclo entre
          análise vocal e curadoria musical. O Vocax é o primeiro.
        </p>

        <h2 className="font-display text-2xl mt-12 mb-3">Como funciona por dentro</h2>
        <ul className="space-y-3 text-graphite-200 leading-relaxed list-disc list-inside">
          <li>
            Captura via Web Audio API + <code>AudioWorklet</code> — thread dedicada de áudio, ~25ms
            de latência total.
          </li>
          <li>
            Detecção de frequência fundamental pelo algoritmo <strong>YIN</strong> (de Cheveigné &amp;
            Kawahara, 2002), com refino por interpolação parabólica.
          </li>
          <li>
            Análise heurística de timbre: centróide espectral, RMS, instabilidade e detecção de vibrato 4-7Hz.
          </li>
          <li>
            Classificação de fach baseada em referências pedagógicas (Coffin, Miller).
          </li>
          <li>
            Matching de músicas combinando filtro duro de extensão + similaridade de timbre + tolerância de
            transposição (±3 semitons).
          </li>
        </ul>

        <h2 className="font-display text-2xl mt-12 mb-3">O que vem em seguida</h2>
        <ul className="space-y-2 text-graphite-200 leading-relaxed list-disc list-inside">
          <li>Modelos de timbre treinados (encoder próprio + classificador de fach por MLP)</li>
          <li>Plano de prática diária personalizado</li>
          <li>Modo Senior com vocabulário simplificado e fontes maiores</li>
          <li>Catálogo expandido com extração automática de melodia via Demucs</li>
          <li>Apps nativos iOS/Android compartilhando a mesma stack ML</li>
        </ul>
      </main>
    </>
  );
}
