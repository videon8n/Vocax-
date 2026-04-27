import type { ReactNode } from 'react';
import { InfoTooltip } from '@/ui/info-tooltip';

export interface Post {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO
  readingMin: number;
  category: 'fundamentos' | 'pratica' | 'curadoria';
  body: () => ReactNode;
}

export const POSTS: Post[] = [
  {
    slug: 'o-que-e-fach',
    title: 'O que é fach e como descobrir o seu',
    description:
      'Fach é a forma como professores de canto classificam a sua voz. Soprano, mezzo, tenor, barítono… o que cada um significa e como você descobre o seu — em 90 segundos.',
    publishedAt: '2026-04-20',
    readingMin: 6,
    category: 'fundamentos',
    body: () => (
      <>
        <p>
          A palavra <strong>fach</strong> vem do alemão e significa, literalmente, “especialidade”.
          No mundo da ópera, ela é o método tradicional de classificar uma voz cantada — não pela
          afinação ou potência, mas por uma combinação de extensão, tessitura,
          {' '}
          <InfoTooltip term="timbre">
            Textura sonora da voz: brilho, calor, sopro, aspereza. Independe da nota cantada.
          </InfoTooltip>
          {' '}
          e zona confortável.
        </p>

        <h2>Os seis fachs principais</h2>
        <p>
          Há seis classificações clássicas usadas como referência pedagógica. Cada uma cobre
          aproximadamente duas oitavas, com sobreposição entre vizinhos.
        </p>
        <ul>
          <li><strong>Soprano</strong> — voz feminina aguda. C4 a C6 (Dó central até dois oitavas acima).</li>
          <li><strong>Mezzo-soprano</strong> — voz feminina média. A3 a A5.</li>
          <li><strong>Contralto</strong> — voz feminina grave. F3 a F5.</li>
          <li><strong>Tenor</strong> — voz masculina aguda. C3 a C5.</li>
          <li><strong>Barítono</strong> — voz masculina média. A2 a A4. (mais comum em homens adultos)</li>
          <li><strong>Baixo</strong> — voz masculina grave. E2 a E4.</li>
        </ul>

        <h2>Mas e quem não cabe perfeitamente em uma caixa?</h2>
        <p>
          Quase ninguém cabe. Vozes reais transitam entre fachs vizinhos —
          é normal um mezzo-tenor, uma soprano-mezzo, um barítono-baixo. O Vocax não te dá um
          veredito; ele mostra a tendência principal e a secundária, com um número de confiança que
          reflete o quão definida está a sua zona.
        </p>

        <h2>Por que isso importa?</h2>
        <p>
          Saber o seu fach desbloqueia escolhas musicais melhores. Se você é soprano, “Águas de
          Março” na tonalidade original cabe; “Tempo Perdido” da Legião Urbana, não — a melodia mora
          numa região grave demais, mesmo subindo três semitons.
        </p>
        <p>
          O algoritmo de recomendação do Vocax usa exatamente isso: filtra músicas pela sua
          extensão real, sugere transposições onde fizer diferença e prioriza o que mora na sua
          {' '}
          <InfoTooltip term="tessitura">
            A faixa central onde a voz soa mais natural — não os limites, e sim o conforto.
            Tecnicamente: percentis 25 a 75 da distribuição de notas que você produziu.
          </InfoTooltip>
          .
        </p>

        <h2>Como descobrir o seu</h2>
        <p>
          A maneira tradicional é com um professor de canto, em algumas aulas. A nova maneira é
          aqui: o Vocax escuta 90 segundos da sua voz (sirenes, arpejos, frase livre) e calcula sua
          extensão e tessitura no próprio navegador, sem mandar áudio pra lugar nenhum.
        </p>
        <p>
          <a href="/onboarding">Comece sua análise →</a>
        </p>
      </>
    ),
  },
  {
    slug: 'tipos-de-voz-pt-br',
    title: 'Soprano, mezzo, contralto, tenor: diferenças com exemplos PT-BR',
    description:
      'Cada tipo de voz com pelo menos um exemplo em português brasileiro. Entender ouvindo é mais rápido que entender lendo.',
    publishedAt: '2026-04-22',
    readingMin: 7,
    category: 'fundamentos',
    body: () => (
      <>
        <p>
          Sabe quando você lê “Maria Bethânia é contralto” e isso não te diz muita coisa? A
          classificação só faz sentido depois de você ouvir lado a lado. Vamos por isso.
        </p>

        <h2>Soprano</h2>
        <p>
          Voz feminina aguda. No Brasil, <strong>Aline Barros</strong> é soprano lírico em muitos
          álbuns gospel. <strong>Daniela Mercury</strong> tem registro soprano em momentos
          característicos do axé. A própria <strong>Ivete Sangalo</strong> em “Festa” mostra a
          flexibilidade do registro agudo.
        </p>

        <h2>Mezzo-soprano</h2>
        <p>
          A “média” feminina — não é grave nem aguda. <strong>Elis Regina</strong> é o exemplo
          canônico em MPB; <strong>Marisa Monte</strong> também navega aí. É o tipo mais comum em
          mulheres adultas no Brasil; o Vocax classifica como mezzo cerca de 35% das vozes que ele
          escuta.
        </p>

        <h2>Contralto</h2>
        <p>
          Voz feminina grave, encorpada. <strong>Maria Bethânia</strong> é o exemplo mais
          identificável: o registro de “Como o Diabo Gosta” mora abaixo do Lá3 com presença total.
          Contralto puro é raro — a maioria que se identifica como contralto na verdade é
          mezzo-grave.
        </p>

        <h2>Tenor</h2>
        <p>
          A voz masculina aguda. <strong>Caetano Veloso</strong> em “Sozinho” fica num tenor leve.
          <strong>Daniel Boaventura</strong> é tenor lírico clássico. Em sertanejo,{' '}
          <strong>Leonardo</strong> tinha um tenor agudo no auge da dupla.
        </p>

        <h2>Barítono</h2>
        <p>
          Voz masculina média — a mais comum entre homens adultos. <strong>Chico Buarque</strong>{' '}
          é barítono em quase tudo, com cor escura.{' '}
          <strong>Almir Sater</strong> também. Quase 50% dos homens que cantam o Vocax classifica
          como barítono.
        </p>

        <h2>Baixo</h2>
        <p>
          Voz masculina grave. Raríssimo no pop brasileiro. Em coral e gospel,{' '}
          <strong>Anderson Freire</strong> pode descer pra essa zona. O baixo profundo (que cobre
          notas abaixo do Mi2) é mais comum em coros do que em solistas pop.
        </p>

        <h2>E os híbridos?</h2>
        <p>
          A maioria das vozes é híbrida. O Vocax mostra primário + secundário porque{' '}
          <em>quase ninguém</em> é 100% um fach só. Se sua confiança vier 38%, isso não é falha —
          é informação. Significa “sua voz transita entre dois mundos”, e isso é uma vantagem na
          escolha de repertório, não um problema.
        </p>

        <p>
          <a href="/onboarding">Descubra o seu →</a>
        </p>
      </>
    ),
  },
  {
    slug: 'escolher-musica-pra-cantar',
    title: 'Como escolher uma música que cabe na sua voz',
    description:
      'Três sinais simples para saber se uma música é pra você antes de começar a ensaiar — e quando subir/baixar o tom faz mais sentido que insistir no original.',
    publishedAt: '2026-04-24',
    readingMin: 5,
    category: 'pratica',
    body: () => (
      <>
        <p>
          Cantar uma música que não cabe na voz é a forma mais rápida de cansar, perder afinação e
          desistir. Antes de começar a praticar, três checagens:
        </p>

        <h2>1. A nota mais alta cabe na sua extensão?</h2>
        <p>
          Procure a nota mais aguda da melodia (geralmente está no refrão ou na ponte). Se ela está
          a mais de uma{' '}
          <InfoTooltip term="quinta">
            Cinco notas acima na escala. Ex: de Dó até Sol.
          </InfoTooltip>
          {' '}
          do que você consegue produzir sem apertar, transponha. Não é fraqueza — é técnica.
        </p>

        <h2>2. A maior parte da melodia mora na sua tessitura?</h2>
        <p>
          Uma música pode caber tecnicamente na sua extensão e mesmo assim cansar a voz se a maior
          parte das frases mora longe da sua zona confortável. O Vocax mede isso explicitamente: o
          score “tessitura” no resultado de cada música mostra quanto a melodia fica na sua faixa
          central.
        </p>

        <h2>3. O timbre da música combina com o seu?</h2>
        <p>
          Isso é mais subjetivo, mas não é mistério. Uma voz quente cantando reggaeton vibrante
          soa estranho. Uma voz brilhante cantando bossa nova introspectiva também. Não é uma
          regra; é um ponto de partida. Você pode quebrar — só saiba que está quebrando.
        </p>

        <h2>O atalho honesto: transposição</h2>
        <p>
          Cantar “Evidências” em Sol em vez de Mi não significa “tirar a beleza”. Significa fazer
          a melodia caber no seu corpo. Aretha Franklin transpunha “(You Make Me Feel Like) A
          Natural Woman” pra cima quando tava em forma e pra baixo quando o show era longo. Você
          pode fazer o mesmo.
        </p>

        <p>
          O Vocax sugere a transposição automaticamente em cada música — você vê “+2 semitons” ao
          lado da faixa, e o link do Spotify abre na busca da música original (transposição rola
          no seu instrumento de acompanhamento ou voice trainer).
        </p>

        <p>
          <a href="/onboarding">Encontre suas 10 músicas →</a>
        </p>
      </>
    ),
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
