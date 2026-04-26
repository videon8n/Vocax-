# Vocax

> Análise vocal com IA. Descubra seu timbre, sua extensão e as músicas que caem na sua voz.

Vocax é um Progressive Web App brasileiro que transforma o microfone do seu navegador em um **professor de canto + curador musical pessoal**. Em 90 segundos, ele entende sua voz e te diz exatamente quais músicas combinam com você.

## O que o Vocax faz

- **Detecta seu pitch em tempo real** (algoritmo YIN, ~25ms de latência)
- **Mapeia sua extensão vocal** (nota mais grave e mais aguda confiáveis)
- **Identifica seu fach** (soprano, mezzo, contralto, tenor, barítono, baixo)
- **Analisa seu timbre** com adjetivos humanos ("quente, aveludada, brilhante no agudo")
- **Recomenda músicas reais** do catálogo brasileiro com deep-link para Spotify
- **Gera um Cartão de Voz** compartilhável

## Diferencial

Apps como Smule, Vanido e Yousician treinam afinação. **Nenhum deles te diz qual música cantar.** O Vocax é o primeiro a fechar esse ciclo: análise vocal completa → catálogo real de músicas que cabem na sua voz.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Web Audio API + AudioWorklet** para captura de baixa latência
- **Algoritmo YIN** em JavaScript puro para detecção de f0 (sem dependência de modelo ML pesado no MVP)
- **Tailwind v3** + design tokens próprios + **Framer Motion**
- **PWA** instalável, funciona offline para histórico
- **Zustand** para estado da sessão de gravação

## Privacidade

Voz é dado biométrico. Por padrão, **nenhum áudio bruto sai do seu dispositivo**. Toda a análise acontece no navegador. Apenas métricas agregadas (range, fach, embedding de timbre) são enviadas ao servidor — e só com seu consentimento explícito.

## Rodando localmente

```bash
pnpm install
pnpm dev
# abra http://localhost:3000
```

## Estrutura

```
src/
├── audio/          # captura, AudioWorklet, processamento de sinal
├── ml/             # análise de pitch, range, timbre, fach
├── features/       # slices verticais (pitch, range, timbre, fach, songs)
├── ui/             # design system, componentes
├── state/          # stores Zustand
├── data/           # catálogo PT-BR curado
└── app/            # rotas Next.js (App Router)
```

## Roadmap

- **MVP atual:** análise on-device, recomendação por extensão e chave, Cartão de Voz
- **v1.0:** plano diário personalizado, vibrato, evolução, modo Senior, login
- **v2.0:** duetos, marketplace de professores, app nativo iOS/Android

## Licença

Propriedade. Todos os direitos reservados.
