@echo off
REM Vocax — setup automático para Windows (cmd.exe)
REM Uso: setup.cmd

echo.
echo  ╭───────────────────────────────────────────╮
echo  │  Vocax — setup local (Windows)            │
echo  │  Analise vocal com IA                     │
echo  ╰───────────────────────────────────────────╯
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [erro] Node.js nao encontrado. Instale em https://nodejs.org/ (versao 20+).
  pause
  exit /b 1
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo [info] Ativando pnpm via corepack...
  corepack enable
  corepack prepare pnpm@10.9.0 --activate
)

echo [info] Instalando dependencias...
call pnpm install
if errorlevel 1 (
  echo [erro] Falha ao instalar dependencias.
  pause
  exit /b 1
)

echo [info] Validando tipos...
call pnpm typecheck
if errorlevel 1 (
  echo [erro] Typecheck falhou.
  pause
  exit /b 1
)

echo.
echo Tudo pronto. Subindo dev server...
echo Abra http://localhost:3000 no Chrome ou Edge.
echo Permita o microfone quando o navegador pedir.
echo Ctrl+C encerra.
echo.

call pnpm dev
