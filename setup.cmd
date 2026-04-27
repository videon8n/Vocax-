@echo off
REM Vocax - setup automatico para Windows
REM Uso: setup.cmd

chcp 65001 >nul 2>&1

echo.
echo ============================================
echo   Vocax - setup local (Windows)
echo   Analise vocal com IA
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [erro] Node.js nao encontrado.
  echo Instale a versao LTS em https://nodejs.org/ e execute setup.cmd novamente.
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [ok] Node.js %NODE_VER%

where pnpm >nul 2>nul
if errorlevel 1 (
  echo [info] Ativando pnpm via corepack...
  call corepack enable
  call corepack prepare pnpm@10.9.0 --activate
)

for /f "tokens=*" %%v in ('pnpm -v 2^>nul') do set PNPM_VER=%%v
echo [ok] pnpm %PNPM_VER%

echo.
echo [info] Instalando dependencias (~30s)...
call pnpm install
if errorlevel 1 (
  echo [erro] Falha ao instalar dependencias.
  pause
  exit /b 1
)
echo [ok] Dependencias instaladas

echo.
echo [info] Validando tipos...
call pnpm typecheck
if errorlevel 1 (
  echo [erro] Typecheck falhou.
  pause
  exit /b 1
)
echo [ok] Typecheck limpo

echo.
echo ============================================
echo   Tudo pronto. Subindo dev server...
echo ============================================
echo.
echo   Abra http://localhost:3000 no Chrome
echo   Permita o microfone quando pedir
echo   Ctrl+C para encerrar
echo.

call pnpm dev
