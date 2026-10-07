-- AI Bet Casino: content foundation (profiles/roles, taxonomy, articles, audit log).
-- Authorization is enforced here (grants + RLS), not only in the app UI.

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('reader', 'editor', 'admin');
create type public.content_section as enum ('sports', 'casino', 'responsible_gambling');
create type public.content_type as enum (
  'preview', 'tip', 'odds_analysis', 'casino_guide', 'responsible_gambling'
);
-- 'published' with a future published_at is treated as "scheduled".
create type public.content_status as enum ('draft', 'published', 'archived');

-- ---------------------------------------------------------------------------
-- Profiles & roles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role public.app_role not null default 'reader',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Role helpers live in a schema that the Data API does not expose.
create function private.current_app_role()
returns public.app_role
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create function private.is_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(private.current_app_role() in ('editor', 'admin'), false)
$$;

create function private.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(private.current_app_role() = 'admin', false)
$$;

grant usage on schema private to anon, authenticated;
revoke all on all functions in schema private from public;
grant execute on function private.current_app_role(), private.is_staff(), private.is_admin()
  to anon, authenticated;

-- Every new auth user gets a reader profile; roles are raised only by an admin.
create function private.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Admin-only role management (callable via RPC; checks the caller itself).
create function public.admin_set_role(target_user uuid, new_role public.app_role)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only administrators can change roles' using errcode = '42501';
  end if;
  if target_user = (select auth.uid()) and new_role <> 'admin' then
    raise exception 'Administrators cannot demote themselves' using errcode = '42501';
  end if;
  update public.profiles set role = new_role, updated_at = now() where id = target_user;
end;
$$;

revoke all on function public.admin_set_role(uuid, public.app_role) from public, anon;
grant execute on function public.admin_set_role(uuid, public.app_role) to authenticated;

-- ---------------------------------------------------------------------------
-- Taxonomy
-- ---------------------------------------------------------------------------
create table public.sports (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 60)
);

create table public.leagues (
  id integer generated always as identity primary key,
  sport_id smallint not null references public.sports (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  country text,
  unique (id, sport_id)
);

create table public.categories (
  id smallint generated always as identity primary key,
  section public.content_section not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 60),
  description text not null default '' check (char_length(description) <= 300)
);

-- ---------------------------------------------------------------------------
-- Articles
-- ---------------------------------------------------------------------------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 5 and 160),
  excerpt text not null check (char_length(excerpt) between 20 and 300),
  body text not null check (char_length(body) between 1 and 50000),
  content_type public.content_type not null,
  category_id smallint not null references public.categories (id) on delete restrict,
  sport_id smallint references public.sports (id) on delete restrict,
  league_id integer,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  is_featured boolean not null default false,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('english', title), 'A')
    || setweight(to_tsvector('english', excerpt), 'B')
    || setweight(to_tsvector('english', body), 'C')
  ) stored,
  -- A league must belong to the article's sport.
  foreign key (league_id, sport_id) references public.leagues (id, sport_id) on delete restrict,
  constraint league_requires_sport check (league_id is null or sport_id is not null),
  constraint published_requires_date check (status <> 'published' or published_at is not null)
);

create index articles_public_listing_idx on public.articles (status, published_at desc);
create index articles_category_idx on public.articles (category_id);
create index articles_sport_idx on public.articles (sport_id);
create index articles_league_idx on public.articles (league_id);
create index articles_author_idx on public.articles (author_id);
create index articles_search_idx on public.articles using gin (search);

create function private.touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger articles_touch_updated_at
  before update on public.articles
  for each row execute function private.touch_updated_at();

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Audit log (written only by triggers; readable by admins)
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at desc);

create function private.audit_article_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  row_data public.articles;
begin
  row_data := coalesce(new, old);
  insert into public.audit_logs (actor_id, action, entity, entity_id, details)
  values (
    (select auth.uid()),
    lower(tg_op),
    'article',
    row_data.id,
    jsonb_build_object(
      'slug', row_data.slug,
      'status', row_data.status,
      'previous_status', case when tg_op = 'UPDATE' then old.status end
    )
  );
  return null;
end;
$$;

create trigger articles_audit
  after insert or update or delete on public.articles
  for each row execute function private.audit_article_change();

-- ---------------------------------------------------------------------------
-- Grants (explicit; nothing is exposed by default)
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.sports, public.leagues, public.categories,
  public.articles, public.audit_logs from anon, authenticated;

grant select on public.sports, public.leagues, public.categories to anon, authenticated;
grant insert, update, delete on public.sports, public.leagues, public.categories to authenticated;

grant select on public.articles to anon, authenticated;
grant insert (slug, title, excerpt, body, content_type, category_id, sport_id, league_id,
  status, published_at, is_featured)
  on public.articles to authenticated;
-- author_id, id and timestamps are not client-updatable.
grant update (slug, title, excerpt, body, content_type, category_id, sport_id, league_id,
  status, published_at, is_featured)
  on public.articles to authenticated;
grant delete on public.articles to authenticated;

grant select on public.profiles to authenticated;
-- Visitors may see staff bylines (name only) on published content.
grant select (id, display_name) on public.profiles to anon;
grant update (display_name) on public.profiles to authenticated;

grant select on public.audit_logs to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.sports enable row level security;
alter table public.leagues enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: users see themselves; staff see everyone (author names in editor tools).
create policy "profiles: read own or staff" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_staff()));

create policy "profiles: public staff bylines" on public.profiles
  for select to anon, authenticated
  using (role in ('editor', 'admin'));

create policy "profiles: update own display name" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Taxonomy: public read, admin write.
create policy "sports: public read" on public.sports for select to anon, authenticated using (true);
create policy "sports: admin insert" on public.sports for insert to authenticated
  with check ((select private.is_admin()));
create policy "sports: admin update" on public.sports for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "sports: admin delete" on public.sports for delete to authenticated
  using ((select private.is_admin()));

create policy "leagues: public read" on public.leagues for select to anon, authenticated using (true);
create policy "leagues: admin insert" on public.leagues for insert to authenticated
  with check ((select private.is_admin()));
create policy "leagues: admin update" on public.leagues for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "leagues: admin delete" on public.leagues for delete to authenticated
  using ((select private.is_admin()));

create policy "categories: public read" on public.categories for select to anon, authenticated using (true);
create policy "categories: admin insert" on public.categories for insert to authenticated
  with check ((select private.is_admin()));
create policy "categories: admin update" on public.categories for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "categories: admin delete" on public.categories for delete to authenticated
  using ((select private.is_admin()));

-- Articles: everyone reads live published content; staff read and write everything;
-- only admins delete.
create policy "articles: public read published" on public.articles
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "articles: staff read all" on public.articles
  for select to authenticated
  using ((select private.is_staff()));

create policy "articles: staff insert as self" on public.articles
  for insert to authenticated
  with check ((select private.is_staff()) and author_id = (select auth.uid()));

create policy "articles: staff update" on public.articles
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

create policy "articles: admin delete" on public.articles
  for delete to authenticated
  using ((select private.is_admin()));

create policy "audit_logs: admin read" on public.audit_logs
  for select to authenticated
  using ((select private.is_admin()));
