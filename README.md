# Vocax

> Análise vocal com IA. Descubra seu timbre, sua extensão e as músicas que caem na sua voz.

---

## Rodar no seu PC em 30 segundos

### macOS / Linux

Cole no Terminal:

```bash
git clone https://github.com/videon8n/vocax-.git vocax \
  && cd vocax \
  && git checkout claude/voice-analysis-music-app-ys05h \
  && bash setup.sh
```

### Windows (PowerShell ou CMD)

```bat
git clone https://github.com/videon8n/vocax-.git vocax
cd vocax
git checkout claude/voice-analysis-music-app-ys05h
setup.cmd
```

O script cuida de tudo:

1. ✓ Verifica Node 20+
2. ✓ Ativa pnpm via corepack se faltar
3. ✓ Instala 360+ pacotes (~30s)
4. ✓ Roda typecheck
5. ✓ Sobe o dev server em **http://localhost:3000**

Abra no Chrome ou Safari, autorize o microfone e siga o fluxo:

```
/  →  /onboarding  →  /onboarding/calibrar  →  /onboarding/exercicio  →  /resultado  →  /musicas
```

### Pré-requisitos

| Ferramenta | Versão | Como instalar |
|---|---|---|
| Node.js | 20+ | https://nodejs.org/ (LTS) |
| Git | qualquer | https://git-scm.com/ |
| pnpm | 10+ | instalado automaticamente pelo `setup.sh` |

---

## O que o Vocax faz

- **Detecta pitch em tempo real** (algoritmo YIN, ~25ms latência)
- **Mapeia extensão vocal** (nota mais grave + mais aguda confiáveis)
- **Identifica fach** (soprano, mezzo, contralto, tenor, barítono, baixo)
- **Analisa timbre** com adjetivos humanos (quente, brilhante, soprosa…)
- **Recomenda 10 músicas** do catálogo PT-BR com deep-link Spotify
- **Cartão de Voz** compartilhável

## Diferencial

Smule, Vanido, SingSharp, Yousician treinam afinação. **Nenhum deles te diz qual música cantar.** O Vocax é o primeiro a fechar esse ciclo.

## Stack

- **Next.js 15.5** + **React 19** + **TypeScript** estrito
- **Web Audio API + AudioWorklet** (thread dedicada)
- **YIN** em JavaScript puro para detecção de f0
- **Tailwind v3** + design tokens (gradiente âmbar→magenta, Fraunces + Inter)
- **Zustand** para sessão local (persistente em localStorage)
- **PWA** instalável

## Privacidade

Voz é dado biométrico (LGPD). Por padrão, **nenhum áudio bruto sai do seu dispositivo**. Toda a análise acontece no navegador. Apenas resultado agregado (range, fach, timbre) é salvo localmente. Endpoint /perfil "Esquecer-me" apaga tudo.

## Estrutura

```
src/
├── audio/          # captura, AudioWorklet, processamento de sinal
├── features/       # vertical slices: pitch, range, timbre, fach, songs
├── ui/             # design system, componentes (Button, WaveVisual, PitchLine, RangeBar, VoiceCard)
├── state/          # store Zustand
├── data/           # catálogo PT-BR curado
└── app/            # rotas Next.js (App Router)
public/
└── worklets/       # AudioWorklet processor (YIN)
```

## Comandos

```bash
pnpm dev         # dev server com hot reload
pnpm build       # build de produção
pnpm start       # serve build de produção
pnpm typecheck   # validação TypeScript
pnpm lint        # ESLint
```

## Deploy

Push pra `claude/voice-analysis-music-app-ys05h` dispara deploy automático na Vercel (se conectado).

```bash
# Deploy direto via Vercel CLI (alternativa):
npm i -g vercel
vercel login
vercel --prod
```

## Roadmap

- **MVP atual:** análise on-device, recomendação por extensão e chave, Cartão de Voz
- **v1.0:** plano diário, vibrato detalhado, modo Senior, login, sincronização
- **v2.0:** duetos, marketplace de professores, app nativo iOS/Android

## Licença

Propriedade. Todos os direitos reservados.
