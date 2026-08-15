create extension if not exists pgcrypto;

create type public.publication_status as enum (
  'draft', 'published', 'published_with_changes', 'unpublished', 'archived'
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/avif','image/gif')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 6291456),
  alt_text text not null default '',
  created_at timestamptz not null default now()
);

create table public.film_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  author_id uuid not null references auth.users(id),
  status public.publication_status not null default 'draft',
  working_revision_id uuid,
  published_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.film_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.film_posts(id) on delete cascade,
  revision_number integer not null,
  title text not null check (char_length(title) between 1 and 160),
  subtitle text not null default '' check (char_length(subtitle) <= 280),
  body jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  cover_asset_id uuid references public.assets(id) on delete set null,
  cover_position_x numeric(5,2) not null default 50 check (cover_position_x between 0 and 100),
  cover_position_y numeric(5,2) not null default 50 check (cover_position_y between 0 and 100),
  film_title text not null default '',
  director text not null default '',
  film_year integer check (film_year between 1888 and 2200),
  featured boolean not null default false,
  published_at date,
  immutable boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, revision_number)
);

create or replace function public.protect_published_revision()
returns trigger language plpgsql set search_path = public
as $$
begin
  if old.immutable then raise exception 'published revisions are immutable'; end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger protect_published_revision
before update or delete on public.film_revisions
for each row execute function public.protect_published_revision();

alter table public.film_posts
  add constraint film_posts_working_revision_fkey
  foreign key (working_revision_id) references public.film_revisions(id),
  add constraint film_posts_published_revision_fkey
  foreign key (published_revision_id) references public.film_revisions(id);

create or replace function public.is_active_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and active = true
  );
$$;

create or replace function public.publish_film(target_post_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare source_revision public.film_revisions;
declare published_id uuid;
declare next_revision integer;
begin
  if not public.is_active_admin() then raise exception 'not authorized'; end if;

  select r.* into source_revision
  from public.film_posts p
  join public.film_revisions r on r.id = p.working_revision_id
  where p.id = target_post_id and p.author_id = auth.uid();

  if source_revision.id is null then raise exception 'working revision not found'; end if;
  if source_revision.cover_asset_id is null then raise exception 'cover image is required'; end if;
  if coalesce(jsonb_array_length(source_revision.body->'content'), 0) = 0 then raise exception 'article body is required'; end if;
  select coalesce(max(revision_number), 0) + 1 into next_revision
  from public.film_revisions where post_id = target_post_id;

  insert into public.film_revisions (
    post_id, revision_number, title, subtitle, body, cover_asset_id,
    cover_position_x, cover_position_y, film_title, director, film_year,
    featured, published_at, immutable, created_by
  ) values (
    target_post_id, next_revision, source_revision.title, source_revision.subtitle,
    source_revision.body, source_revision.cover_asset_id, source_revision.cover_position_x,
    source_revision.cover_position_y, source_revision.film_title, source_revision.director,
    source_revision.film_year, source_revision.featured, coalesce(source_revision.published_at, current_date),
    true, auth.uid()
  ) returning id into published_id;

  update public.film_posts set
    published_revision_id = published_id,
    status = 'published', updated_at = now()
  where id = target_post_id;
  return published_id;
end;
$$;

alter table public.admin_users enable row level security;
alter table public.assets enable row level security;
alter table public.film_posts enable row level security;
alter table public.film_revisions enable row level security;

create policy "admins read own allowlist row" on public.admin_users
for select to authenticated using (user_id = auth.uid());
create policy "admins manage assets" on public.assets
for all to authenticated using (public.is_active_admin() and owner_id = auth.uid())
with check (public.is_active_admin() and owner_id = auth.uid());
create policy "admins manage film posts" on public.film_posts
for all to authenticated using (public.is_active_admin() and author_id = auth.uid())
with check (public.is_active_admin() and author_id = auth.uid());
create policy "public reads published film identities" on public.film_posts
for select to anon using (status in ('published','published_with_changes'));
create policy "admins manage film revisions" on public.film_revisions
for all to authenticated using (public.is_active_admin() and created_by = auth.uid())
with check (public.is_active_admin() and created_by = auth.uid());
create policy "public reads only promoted revisions" on public.film_revisions
for select to anon using (
  exists (select 1 from public.film_posts p where p.published_revision_id = film_revisions.id)
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'editorial-images', 'editorial-images', false, 6291456,
  array['image/jpeg','image/png','image/webp','image/avif','image/gif']
) on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "admins upload editorial images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'editorial-images'
  and public.is_active_admin()
  and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "admins read editorial images" on storage.objects
for select to authenticated using (
  bucket_id = 'editorial-images' and public.is_active_admin()
);
create policy "admins update editorial images" on storage.objects
for update to authenticated using (
  bucket_id = 'editorial-images' and public.is_active_admin()
);

create or replace function public.is_published_asset(path_to_check text)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.assets a
    join public.film_revisions r on r.cover_asset_id = a.id
    join public.film_posts p on p.published_revision_id = r.id
    where a.storage_path = path_to_check
      and p.status in ('published', 'published_with_changes')
  );
$$;

create policy "public reads published editorial images" on storage.objects
for select to anon using (
  bucket_id = 'editorial-images' and public.is_published_asset(name)
);

create policy "public reads metadata for published assets" on public.assets
for select to anon using (public.is_published_asset(storage_path));

-- After creating the author in Supabase Auth, run once in the SQL editor:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'author@example.com';
