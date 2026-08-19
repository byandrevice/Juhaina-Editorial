create table public.fixture_visibility (
  section text not null check (section in ('films','lists','moodboards','projections')),
  fixture_key text not null,
  hidden boolean not null default true,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  primary key (section, fixture_key)
);

alter table public.fixture_visibility enable row level security;

create policy "public reads sample visibility" on public.fixture_visibility
for select to anon using (true);

create policy "admins manage sample visibility" on public.fixture_visibility
for all to authenticated
using (public.is_active_admin())
with check (public.is_active_admin() and updated_by = auth.uid());

create table public.projection_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  author_id uuid not null references auth.users(id),
  status public.publication_status not null default 'draft',
  working_revision_id uuid,
  published_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projection_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.projection_posts(id) on delete cascade,
  revision_number integer not null,
  title text not null check (char_length(title) between 1 and 160),
  excerpt text not null default '' check (char_length(excerpt) <= 280),
  body jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  cover_asset_id uuid references public.assets(id) on delete set null,
  cover_position_x numeric(5,2) not null default 50 check (cover_position_x between 0 and 100),
  cover_position_y numeric(5,2) not null default 50 check (cover_position_y between 0 and 100),
  cover_zoom numeric(4,2) not null default 1 check (cover_zoom between 1 and 3),
  image_alt text not null default '' check (char_length(image_alt) <= 300),
  subject_title text not null default '' check (char_length(subject_title) <= 160),
  creator text not null default '' check (char_length(creator) <= 160),
  subject_year integer check (subject_year between 1000 and 2200),
  reading_time integer not null default 5 check (reading_time between 1 and 120),
  published_at date,
  immutable boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, revision_number)
);

alter table public.projection_posts
  add constraint projection_posts_working_revision_fkey
  foreign key (working_revision_id) references public.projection_revisions(id),
  add constraint projection_posts_published_revision_fkey
  foreign key (published_revision_id) references public.projection_revisions(id);

create trigger protect_published_projection_revision
before update or delete on public.projection_revisions
for each row execute function public.protect_published_revision();

create or replace function public.publish_projection(target_post_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare source_revision public.projection_revisions;
declare published_id uuid;
declare next_revision integer;
begin
  if not public.is_active_admin() then raise exception 'not authorized'; end if;

  select r.* into source_revision
  from public.projection_posts p
  join public.projection_revisions r on r.id = p.working_revision_id
  where p.id = target_post_id and p.author_id = auth.uid();

  if source_revision.id is null then raise exception 'working revision not found'; end if;
  if source_revision.cover_asset_id is null then raise exception 'cover image is required'; end if;
  if btrim(source_revision.image_alt) = '' then raise exception 'image description is required'; end if;
  if coalesce(jsonb_array_length(source_revision.body->'content'), 0) = 0 then raise exception 'article body is required'; end if;

  select coalesce(max(revision_number), 0) + 1 into next_revision
  from public.projection_revisions where post_id = target_post_id;

  insert into public.projection_revisions (
    post_id, revision_number, title, excerpt, body, cover_asset_id,
    cover_position_x, cover_position_y, cover_zoom, image_alt, subject_title,
    creator, subject_year, reading_time, published_at, immutable, created_by
  ) values (
    target_post_id, next_revision, source_revision.title, source_revision.excerpt,
    source_revision.body, source_revision.cover_asset_id, source_revision.cover_position_x,
    source_revision.cover_position_y, source_revision.cover_zoom, source_revision.image_alt,
    source_revision.subject_title, source_revision.creator, source_revision.subject_year,
    source_revision.reading_time, coalesce(source_revision.published_at, current_date),
    true, auth.uid()
  ) returning id into published_id;

  update public.projection_posts set
    published_revision_id = published_id,
    status = 'published', updated_at = now()
  where id = target_post_id;

  return published_id;
end;
$$;

alter table public.projection_posts enable row level security;
alter table public.projection_revisions enable row level security;

create policy "admins manage projection posts" on public.projection_posts
for all to authenticated
using (public.is_active_admin() and author_id = auth.uid())
with check (public.is_active_admin() and author_id = auth.uid());

create policy "public reads published projection identities" on public.projection_posts
for select to anon using (status in ('published','published_with_changes'));

create policy "admins manage projection revisions" on public.projection_revisions
for all to authenticated
using (public.is_active_admin() and created_by = auth.uid())
with check (public.is_active_admin() and created_by = auth.uid());

create policy "public reads promoted projection revisions" on public.projection_revisions
for select to anon using (
  exists (
    select 1 from public.projection_posts p
    where p.published_revision_id = projection_revisions.id
      and p.status in ('published','published_with_changes')
  )
);

create or replace function public.is_published_asset(path_to_check text)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.assets a
    join public.film_revisions r on r.cover_asset_id = a.id
    join public.film_posts p on p.published_revision_id = r.id
    where a.storage_path = path_to_check and p.status in ('published','published_with_changes')
  ) or exists (
    select 1 from public.assets a
    join public.list_items i on i.image_asset_id = a.id
    join public.list_posts p on p.published_revision_id = i.revision_id
    where a.storage_path = path_to_check and p.status in ('published','published_with_changes')
  ) or exists (
    select 1 from public.assets a
    join public.moodboard_revisions r on r.preview_asset_id = a.id or r.full_asset_id = a.id
    join public.moodboard_posts p on p.published_revision_id = r.id
    where a.storage_path = path_to_check and p.status in ('published','published_with_changes')
  ) or exists (
    select 1 from public.assets a
    join public.moodboard_layers l on l.asset_id = a.id
    join public.moodboard_posts p on p.published_revision_id = l.revision_id
    where a.storage_path = path_to_check and p.status in ('published','published_with_changes')
  ) or exists (
    select 1 from public.assets a
    join public.projection_revisions r on r.cover_asset_id = a.id
    join public.projection_posts p on p.published_revision_id = r.id
    where a.storage_path = path_to_check and p.status in ('published','published_with_changes')
  );
$$;
