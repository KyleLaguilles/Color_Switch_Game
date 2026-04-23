-- ============================================================
-- Run this entire file in the Supabase SQL editor.
-- ============================================================

-- ─── Tables ──────────────────────────────────────────────────

create table if not exists question_sets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  created_at  timestamptz default now() not null
);

create table if not exists questions (
  id                 uuid primary key default gen_random_uuid(),
  set_id             uuid references question_sets(id) on delete cascade,
  user_id            uuid references auth.users(id) on delete cascade not null,
  question           text not null,
  correct_answer     text not null,
  incorrect_answers  text[] not null,
  difficulty         text,
  created_at         timestamptz default now() not null,
  is_default         boolean default false not null
);

create table if not exists game_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  score      integer not null,
  mode       text,
  played_at  timestamptz default now() not null
);

create table if not exists question_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  question_id  uuid references questions(id) on delete set null,
  category     text,
  was_correct  boolean not null,
  answered_at  timestamptz default now() not null
);

-- ─── Enable RLS ──────────────────────────────────────────────

alter table question_sets      enable row level security;
alter table questions          enable row level security;
alter table game_sessions      enable row level security;
alter table question_attempts  enable row level security;

-- ─── RLS Policies: question_sets ─────────────────────────────

create policy "users can select own question_sets"
  on question_sets for select
  using (auth.uid() = user_id);

create policy "users can insert own question_sets"
  on question_sets for insert
  with check (auth.uid() = user_id);

create policy "users can update own question_sets"
  on question_sets for update
  using (auth.uid() = user_id);

create policy "users can delete own question_sets"
  on question_sets for delete
  using (auth.uid() = user_id);

-- ─── RLS Policies: questions ─────────────────────────────────

create policy "users can select own questions"
  on questions for select
  using (auth.uid() = user_id);

create policy "users can insert own questions"
  on questions for insert
  with check (auth.uid() = user_id);

create policy "users can update own questions"
  on questions for update
  using (auth.uid() = user_id);

create policy "users can delete own questions"
  on questions for delete
  using (auth.uid() = user_id);

-- ─── RLS Policies: game_sessions ─────────────────────────────

create policy "users can select own game_sessions"
  on game_sessions for select
  using (auth.uid() = user_id);

create policy "users can insert own game_sessions"
  on game_sessions for insert
  with check (auth.uid() = user_id);

create policy "users can update own game_sessions"
  on game_sessions for update
  using (auth.uid() = user_id);

create policy "users can delete own game_sessions"
  on game_sessions for delete
  using (auth.uid() = user_id);

-- ─── RLS Policies: question_attempts ─────────────────────────

create policy "users can select own question_attempts"
  on question_attempts for select
  using (auth.uid() = user_id);

create policy "users can insert own question_attempts"
  on question_attempts for insert
  with check (auth.uid() = user_id);

create policy "users can update own question_attempts"
  on question_attempts for update
  using (auth.uid() = user_id);

create policy "users can delete own question_attempts"
  on question_attempts for delete
  using (auth.uid() = user_id);

-- ─── Migration: add category column (run if schema already applied) ──
-- If you applied the schema before stat tracking was added, run this:
--
-- alter table question_attempts add column if not exists category text;
