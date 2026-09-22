-- Sleight of Word: initial Supabase schema
-- Put this at supabase/migrations/0001_init.sql (or paste it into the Supabase SQL editor).
--
-- Design rules:
--   1. Answers never reach the phone. Clients read `puzzles` (no answers) and ask
--      `check_guess()` whether a guess is right. `puzzle_answers` is locked to clients.
--   2. Money and multiplayer scores are written by server functions, never by the app.
--   3. Row Level Security is on for every table.
--
-- Not covered yet (see notes at the bottom): rate limiting, live-race timing, moderation tools.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.norm_answer(t text)
returns text
language sql
immutable
as $$
  select btrim(regexp_replace(regexp_replace(upper(coalesce(t, '')), '[^A-Z ]', '', 'g'), '\s+', ' ', 'g'))
$$;

-- ---------------------------------------------------------------------------
-- Players
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text check (char_length(display_name) <= 30),
  avatar       text,
  created_at   timestamptz not null default now()
);

-- Private balances. Clients can read their own row but never write it.
create table public.wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  coins   integer not null default 0 check (coins >= 0),
  gems    integer not null default 0 check (gems >= 0)
);

-- New sign-ups get a profile and a wallet automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, 'player_' || substr(replace(new.id::text, '-', ''), 1, 12));
  insert into public.wallets (user_id, coins, gems) values (new.id, 0, 0);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Puzzles (loaded from the GitHub JSON files by a script)
-- ---------------------------------------------------------------------------
-- Public side: everything the app needs to DRAW a puzzle, and nothing that gives it away.
create table public.puzzles (
  id          text primary key,
  mode        text not null check (mode in ('seams', 'splits', 'charades')),
  difficulty  smallint not null check (difficulty between 1 and 5),
  sentence    text,
  view_data   jsonb not null default '{}'::jsonb,
  tags        text[] not null default '{}',
  status      text not null default 'draft' check (status in ('draft', 'reviewed', 'live', 'retired')),
  daily_date  date,
  created_at  timestamptz not null default now()
);
create index puzzles_live_mode_idx on public.puzzles (mode) where status = 'live';
create unique index puzzles_daily_idx on public.puzzles (daily_date, mode) where daily_date is not null;

comment on column public.puzzles.view_data is
  'Render info without answers. seams: {"pair":[1,2],"length":4}. splits: {"word_index":4}. charades: {"parts":[{"clue":"A vehicle","length":3}],"whole_clue":"...","whole_length":6}.';

-- Private side: answers and the full authoring payload. No client policies = no client access.
create table public.puzzle_answers (
  puzzle_id        text primary key references public.puzzles (id) on delete cascade,
  answer           text not null,
  accepted_answers text[] not null,
  explanation      text not null,
  payload          jsonb not null
);

-- ---------------------------------------------------------------------------
-- Solo progress and daily trick
-- ---------------------------------------------------------------------------
create table public.progress (
  user_id    uuid not null references auth.users (id) on delete cascade,
  puzzle_id  text not null references public.puzzles (id) on delete cascade,
  best_stars smallint not null default 0 check (best_stars between 0 and 3),
  attempts   integer not null default 0 check (attempts >= 0),
  solved_at  timestamptz,
  primary key (user_id, puzzle_id)
);

create table public.daily_results (
  user_id       uuid not null references auth.users (id) on delete cascade,
  day           date not null,
  tricks_done   smallint not null default 0 check (tricks_done between 0 and 5),
  chest_claimed boolean not null default false,
  primary key (user_id, day)
);

-- ---------------------------------------------------------------------------
-- Friends
-- ---------------------------------------------------------------------------
create table public.friendships (
  id         uuid primary key default gen_random_uuid(),
  requester  uuid not null references auth.users (id) on delete cascade,
  addressee  uuid not null references auth.users (id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  check (requester <> addressee)
);
-- One row per pair, whichever direction the request went.
create unique index friendships_pair_idx
  on public.friendships (least(requester, addressee), greatest(requester, addressee));
create index friendships_addressee_idx on public.friendships (addressee);

create table public.reports (
  id         uuid primary key default gen_random_uuid(),
  reporter   uuid not null references auth.users (id) on delete cascade,
  reported   uuid not null references auth.users (id) on delete cascade,
  reason     text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Multiplayer (async challenges first; live races can reuse the same tables)
-- ---------------------------------------------------------------------------
create table public.matches (
  id          uuid primary key default gen_random_uuid(),
  created_by  uuid not null references auth.users (id) on delete cascade,
  kind        text not null default 'async' check (kind in ('async', 'live')),
  status      text not null default 'waiting' check (status in ('waiting', 'active', 'finished', 'cancelled')),
  round_count smallint not null check (round_count between 1 and 10),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '3 days',
  finished_at timestamptz
);

create table public.match_players (
  match_id    uuid not null references public.matches (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  status      text not null default 'invited' check (status in ('invited', 'joined', 'declined')),
  total_score integer not null default 0,
  joined_at   timestamptz,
  primary key (match_id, user_id)
);
create index match_players_user_idx on public.match_players (user_id);

create table public.match_rounds (
  id        uuid primary key default gen_random_uuid(),
  match_id  uuid not null references public.matches (id) on delete cascade,
  round_no  smallint not null,
  puzzle_id text not null references public.puzzles (id),
  unique (match_id, round_no)
);

create table public.round_results (
  round_id      uuid not null references public.match_rounds (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  solved        boolean,
  stars         smallint check (stars between 0 and 3),
  elapsed_ms    integer,
  hints_used    smallint,
  wrong_guesses smallint,
  points        integer not null default 0,
  primary key (round_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Membership helper (security definer avoids recursive row-level-security checks)
-- ---------------------------------------------------------------------------
create or replace function public.is_match_member(p_match uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.match_players where match_id = p_match and user_id = auth.uid())
$$;

create or replace function public.is_match_player(p_match uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.match_players
    where match_id = p_match and user_id = auth.uid() and status = 'joined'
  )
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.wallets        enable row level security;
alter table public.puzzles        enable row level security;
alter table public.puzzle_answers enable row level security;   -- no policies on purpose
alter table public.progress       enable row level security;
alter table public.daily_results  enable row level security;
alter table public.friendships    enable row level security;
alter table public.reports        enable row level security;
alter table public.matches        enable row level security;
alter table public.match_players  enable row level security;
alter table public.match_rounds   enable row level security;
alter table public.round_results  enable row level security;

-- Profiles: any signed-in player can look people up by username; you edit only your own.
create policy profiles_read   on public.profiles for select to authenticated using (true);
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Wallets: read your own, never write from the app.
create policy wallets_read on public.wallets for select to authenticated using (user_id = auth.uid());

-- Puzzles: only live ones, and only the answer-free columns exist here.
create policy puzzles_read on public.puzzles for select to anon, authenticated using (status = 'live');

-- Solo progress and daily results: own rows only.
create policy progress_own on public.progress for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy daily_own on public.daily_results for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Friendships
create policy friends_read on public.friendships for select to authenticated
  using (requester = auth.uid() or addressee = auth.uid());
create policy friends_request on public.friendships for insert to authenticated
  with check (requester = auth.uid() and status = 'pending');
create policy friends_respond on public.friendships for update to authenticated
  using (addressee = auth.uid()) with check (addressee = auth.uid() and status in ('accepted', 'blocked'));
create policy friends_remove on public.friendships for delete to authenticated
  using (requester = auth.uid() or addressee = auth.uid());

-- Reports: file your own, read nothing back.
create policy reports_insert on public.reports for insert to authenticated with check (reporter = auth.uid());

-- Matches: you see matches you are part of.
create policy matches_read on public.matches for select to authenticated using (public.is_match_member(id));
create policy match_players_read on public.match_players for select to authenticated using (public.is_match_member(match_id));
create policy match_rounds_read on public.match_rounds for select to authenticated using (public.is_match_player(match_id));
create policy round_results_read on public.round_results for select to authenticated
  using (exists (select 1 from public.match_rounds r where r.id = round_id and public.is_match_player(r.match_id)));

-- ---------------------------------------------------------------------------
-- Privileges: clients get read access (plus the few writes above), nothing more.
-- ---------------------------------------------------------------------------
revoke all on public.puzzle_answers from anon, authenticated;
revoke insert, update, delete on public.wallets from anon, authenticated;
revoke insert, update, delete on public.matches from anon, authenticated;
revoke insert, update, delete on public.match_players from anon, authenticated;
revoke insert, update, delete on public.match_rounds from anon, authenticated;
revoke insert, update, delete on public.round_results from anon, authenticated;
revoke insert, delete on public.profiles from anon, authenticated;
revoke update on public.profiles from anon, authenticated;
grant  update (username, display_name, avatar) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Server functions (these are the only way to change scores and matches)
-- ---------------------------------------------------------------------------

-- Is this guess correct? Works for the whole answer of any mode ("BEAR", "CAR PET", "CARROT").
create or replace function public.check_guess(p_puzzle_id text, p_guess text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.puzzle_answers a
    join public.puzzles p on p.id = a.puzzle_id
    where a.puzzle_id = p_puzzle_id
      and p.status = 'live'
      and public.norm_answer(p_guess) = any (select public.norm_answer(x) from unnest(a.accepted_answers) x)
  )
$$;

-- Start a challenge: pick random live puzzles, invite 1-3 accepted friends.
create or replace function public.create_match(p_friend_ids uuid[], p_rounds int default 5, p_kind text default 'async')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_match uuid;
  f uuid;
begin
  if v_me is null then raise exception 'sign in required'; end if;
  if p_rounds < 1 or p_rounds > 10 then raise exception 'rounds must be between 1 and 10'; end if;
  if coalesce(array_length(p_friend_ids, 1), 0) not between 1 and 3 then raise exception 'invite 1 to 3 friends'; end if;

  foreach f in array p_friend_ids loop
    if not exists (
      select 1 from public.friendships
      where status = 'accepted'
        and ((requester = v_me and addressee = f) or (requester = f and addressee = v_me))
    ) then
      raise exception 'you are not friends with %', f;
    end if;
  end loop;

  insert into public.matches (created_by, kind, round_count)
  values (v_me, p_kind, p_rounds)
  returning id into v_match;

  insert into public.match_players (match_id, user_id, status, joined_at) values (v_match, v_me, 'joined', now());
  foreach f in array p_friend_ids loop
    insert into public.match_players (match_id, user_id, status) values (v_match, f, 'invited');
  end loop;

  insert into public.match_rounds (match_id, round_no, puzzle_id)
  select v_match, (row_number() over ())::smallint, s.id
  from (select id from public.puzzles where status = 'live' order by random() limit p_rounds) s;

  return v_match;
end;
$$;

-- Accept or decline an invite.
create or replace function public.respond_to_match(p_match uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.match_players
     set status = case when p_accept then 'joined' else 'declined' end,
         joined_at = case when p_accept then now() else null end
   where match_id = p_match and user_id = auth.uid() and status = 'invited';
  if not found then raise exception 'no pending invite'; end if;

  if p_accept then
    update public.matches set status = 'active' where id = p_match and status = 'waiting';
  end if;
end;
$$;

-- Start the clock for one round. The server keeps the start time, not the phone.
create or replace function public.start_round(p_round uuid)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match uuid;
  v_started timestamptz;
begin
  select match_id into v_match from public.match_rounds where id = p_round;
  if v_match is null or not public.is_match_player(v_match) then raise exception 'not allowed'; end if;

  insert into public.round_results (round_id, user_id) values (p_round, auth.uid())
  on conflict (round_id, user_id) do nothing;

  select started_at into v_started from public.round_results where round_id = p_round and user_id = auth.uid();
  return v_started;
end;
$$;

-- Submit the final answer for a round. Correctness, time and points are decided here.
create or replace function public.submit_round(p_round uuid, p_guess text, p_hints int default 0, p_wrong int default 0)
returns table (o_solved boolean, o_stars int, o_points int, o_elapsed_ms int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match uuid;
  v_puzzle text;
  v_res public.round_results%rowtype;
  v_ok boolean;
  v_ms int;
  v_stars int;
  v_points int;
  v_hints int := least(greatest(coalesce(p_hints, 0), 0), 3);
  v_wrong int := least(greatest(coalesce(p_wrong, 0), 0), 3);
begin
  select r.match_id, r.puzzle_id into v_match, v_puzzle from public.match_rounds r where r.id = p_round;
  if v_match is null or not public.is_match_player(v_match) then raise exception 'not allowed'; end if;

  select * into v_res from public.round_results where round_id = p_round and user_id = auth.uid() for update;
  if not found then raise exception 'round not started'; end if;
  if v_res.finished_at is not null then raise exception 'already submitted'; end if;

  v_ok := public.check_guess(v_puzzle, p_guess);
  v_ms := greatest(0, (extract(epoch from (now() - v_res.started_at)) * 1000)::int);
  v_stars := case when v_ok then greatest(1, 3 - v_hints - v_wrong) else 0 end;
  v_points := case when v_ok then v_stars * 100 + greatest(0, 50 - v_ms / 1000) else 0 end;

  update public.round_results
     set finished_at = now(), solved = v_ok, stars = v_stars, elapsed_ms = v_ms,
         hints_used = v_hints, wrong_guesses = v_wrong, points = v_points
   where round_id = p_round and user_id = auth.uid();

  update public.match_players set total_score = total_score + v_points
   where match_id = v_match and user_id = auth.uid();

  -- Close the match when every joined player has finished every round.
  if not exists (
    select 1
    from public.match_players mp
    join public.match_rounds mr on mr.match_id = mp.match_id
    where mp.match_id = v_match and mp.status = 'joined'
      and not exists (
        select 1 from public.round_results rr
        where rr.round_id = mr.id and rr.user_id = mp.user_id and rr.finished_at is not null
      )
  ) then
    update public.matches set status = 'finished', finished_at = now() where id = v_match;
  end if;

  return query select v_ok, v_stars, v_points, v_ms;
end;
$$;

-- Function access: signed-in players only.
revoke execute on function public.check_guess(text, text) from public, anon;
revoke execute on function public.create_match(uuid[], int, text) from public, anon;
revoke execute on function public.respond_to_match(uuid, boolean) from public, anon;
revoke execute on function public.start_round(uuid) from public, anon;
revoke execute on function public.submit_round(uuid, text, int, int) from public, anon;
grant execute on function public.check_guess(text, text) to authenticated;
grant execute on function public.create_match(uuid[], int, text) to authenticated;
grant execute on function public.respond_to_match(uuid, boolean) to authenticated;
grant execute on function public.start_round(uuid) to authenticated;
grant execute on function public.submit_round(uuid, text, int, int) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: let phones watch friends' results and invites live.
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.round_results;
  alter publication supabase_realtime add table public.match_players;
  alter publication supabase_realtime add table public.matches;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$$;

-- ---------------------------------------------------------------------------
-- Known gaps (deliberately left for later)
-- ---------------------------------------------------------------------------
-- * Hints and wrong-guess counts in submit_round come from the phone. A cheater can send 0.
--   Fix later: count attempts on the server (log each guess through a function).
-- * check_guess has no rate limit, so a script could brute-force answers. Add a per-user
--   attempts table or use an edge function with throttling before public launch.
-- * Rewards (coins and gems) are not granted anywhere yet; add a grant_rewards() function.
-- * Live races need a countdown start time both players share. The tables support it,
--   but the timing logic is not written.
-- * Puzzle import from the GitHub JSON files needs a small loader script.
