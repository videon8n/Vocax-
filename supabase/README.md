# Supabase setup (opcional)

A persistência via Supabase é **opcional** no Vocax. Sem ela, o app continua funcionando 100% on-device — só não há sincronização entre dispositivos nem histórico além de uma análise.

## 1. Criar projeto

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Authentication > Providers > Email**, ative **Magic link**.
3. Em **Authentication > URL Configuration**, adicione:
   - Site URL: `https://vocax.app` (ou o seu domínio)
   - Redirect URLs: `https://vocax.app/auth/callback`

## 2. Aplicar migrations

```bash
# Via Supabase CLI
supabase db push

# Ou copie/cole supabase/migrations/0001_init.sql no SQL editor
```

## 3. Variáveis de ambiente

Crie `.env.local` (ou variáveis na Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://vocax.app
```

(Opcional, para analytics PostHog server-side via proxy):
```
POSTHOG_HOST=https://eu.i.posthog.com
POSTHOG_API_KEY=phc_...
```

## 4. RLS

Todas as tabelas têm RLS ativo. As policies já garantem que cada usuário só lê/escreve seu próprio `user_id`. Não desligue RLS.
