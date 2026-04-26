#!/usr/bin/env bash
#
# Vocax — setup automático para rodar localmente.
# Uso: bash setup.sh
#
# Faz: checa Node, instala pnpm via corepack se faltar, instala deps,
# valida o build e sobe o dev server em http://localhost:3000.

set -euo pipefail

# Cores
A='\033[1;33m'  # amarelo
M='\033[1;35m'  # magenta
G='\033[1;32m'  # verde
R='\033[1;31m'  # vermelho
N='\033[0m'

banner() {
  printf "${M}\n"
  printf "  ╭───────────────────────────────────────────╮\n"
  printf "  │  Vocax — setup local                      │\n"
  printf "  │  Análise vocal com IA                     │\n"
  printf "  ╰───────────────────────────────────────────╯\n"
  printf "${N}\n"
}

step() { printf "${A}▸ %s${N}\n" "$1"; }
ok()   { printf "${G}✓ %s${N}\n" "$1"; }
err()  { printf "${R}✗ %s${N}\n" "$1"; }

banner

# 1. Node
step "Verificando Node.js"
if ! command -v node >/dev/null 2>&1; then
  err "Node.js não encontrado. Instale em https://nodejs.org/ (versão 20+)."
  exit 1
fi
NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 20 ]; then
  err "Node.js $NODE_MAJOR detectado. Vocax precisa de 20+. Atualize em https://nodejs.org/."
  exit 1
fi
ok "Node $(node -v) OK"

# 2. pnpm (via corepack — vem com Node 20+)
step "Verificando pnpm"
if ! command -v pnpm >/dev/null 2>&1; then
  step "pnpm não encontrado, ativando via corepack…"
  corepack enable >/dev/null 2>&1 || sudo corepack enable
  corepack prepare pnpm@10.9.0 --activate >/dev/null 2>&1
fi
ok "pnpm $(pnpm -v) OK"

# 3. Instalar deps
step "Instalando dependências (~30s na primeira vez)"
pnpm install --silent
ok "Dependências instaladas"

# 4. Typecheck rápido
step "Validando tipos (TypeScript)"
if pnpm typecheck >/dev/null 2>&1; then
  ok "Typecheck limpo"
else
  err "Typecheck falhou — algum arquivo pode ter sido editado fora do versionamento."
  exit 1
fi

# 5. Subir dev
printf "\n${G}Tudo pronto.${N} Vou subir o dev server agora.\n"
printf "${A}→${N} Abre ${M}http://localhost:3000${N} no Chrome ou Safari.\n"
printf "${A}→${N} Permite o microfone quando o navegador pedir.\n"
printf "${A}→${N} ${M}Ctrl+C${N} encerra.\n\n"

exec pnpm dev
