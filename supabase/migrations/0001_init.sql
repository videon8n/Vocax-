-- Vocax — schema inicial (Supabase Postgres)
--
-- Princípios:
--  - RLS ON em todas as tabelas, sem exceção
--  - Cada linha é dona do user_id; só o próprio usuário lê/escreve
--  - Sem JOIN com auth.users por padrão (privacy by design)

-- ============================================================
-- voice_profiles
-- ============================================================

create table if not exists public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists voice_profiles_user_created_idx
  on public.voice_profiles (user_id, created_at desc);

alter table public.voice_profiles enable row level security;

drop policy if exists "voice_profiles owner read" on public.voice_profiles;
create policy "voice_profiles owner read"
  on public.voice_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "voice_profiles owner insert" on public.voice_profiles;
create policy "voice_profiles owner insert"
  on public.voice_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "voice_profiles owner delete" on public.voice_profiles;
create policy "voice_profiles owner delete"
  on public.voice_profiles
  for delete
  using (auth.uid() = user_id);

-- voice_profiles é append-only; não há policy de UPDATE
-- (uma análise não muda; refazer cria nova linha)

-- ============================================================
-- consent_log — audit trail LGPD
-- ============================================================

create table if not exists public.consent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_version text not null,
  accepted_at timestamptz not null default now()
);

create index if not exists consent_log_user_idx
  on public.consent_log (user_id, accepted_at desc);

alter table public.consent_log enable row level security;

drop policy if exists "consent_log owner read" on public.consent_log;
create policy "consent_log owner read"
  on public.consent_log
  for select
  using (auth.uid() = user_id);

drop policy if exists "consent_log owner insert" on public.consent_log;
create policy "consent_log owner insert"
  on public.consent_log
  for insert
  with check (auth.uid() = user_id);
