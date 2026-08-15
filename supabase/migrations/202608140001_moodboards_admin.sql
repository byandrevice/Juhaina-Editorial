alter table public.assets drop constraint if exists assets_byte_size_check;
alter table public.assets add constraint assets_byte_size_check
  check (byte_size > 0 and byte_size <= 26214400);

update storage.buckets set file_size_limit = 26214400 where id = 'editorial-images';

create table public.moodboard_categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index moodboard_categories_owner_name_unique
  on public.moodboard_categories (owner_id, lower(name));
create unique index moodboard_categories_owner_position_unique
  on public.moodboard_categories (owner_id, position);

create table public.moodboard_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  author_id uuid not null references auth.users(id),
  category_id uuid not null references public.moodboard_categories(id),
  published_category_id uuid references public.moodboard_categories(id),
  position integer not null default 1 check (position > 0),
  status public.publication_status not null default 'draft',
  working_revision_id uuid,
  published_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.moodboard_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.moodboard_posts(id) on delete cascade,
  revision_number integer not null,
  title text not null check (char_length(title) between 1 and 160),
  background_color text not null check (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  preview_asset_id uuid references public.assets(id) on delete set null,
  full_asset_id uuid references public.assets(id) on delete set null,
  immutable boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, revision_number)
);

create table public.moodboard_layers (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.moodboard_revisions(id) on delete cascade,
  stable_layer_id uuid not null default gen_random_uuid(),
  position integer not null check (position between 1 and 50),
  asset_id uuid references public.assets(id) on delete set null,
  name text not null check (char_length(name) between 1 and 180),
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  x numeric(8,2) not null check (x between -1600 and 3200),
  y numeric(8,2) not null check (y between -900 and 1800),
  layer_width numeric(8,2) not null check (layer_width between 24 and 3200),
  layer_height numeric(8,2) not null check (layer_height between 24 and 1800),
  rotation numeric(6,2) not null default 0 check (rotation between -180 and 180),
  opacity numeric(4,3) not null default 1 check (opacity between .05 and 1),
  visible boolean not null default true,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  unique (revision_id, position),
  unique (revision_id, stable_layer_id)
);

alter table public.moodboard_posts
  add constraint moodboard_posts_working_revision_fkey
  foreign key (working_revision_id) references public.moodboard_revisions(id),
  add constraint moodboard_posts_published_revision_fkey
  foreign key (published_revision_id) references public.moodboard_revisions(id);

create trigger protect_published_moodboard_revision
before update or delete on public.moodboard_revisions
for each row execute function public.protect_published_revision();

create or replace function public.protect_published_moodboard_layer()
returns trigger language plpgsql set search_path = public
as $$
declare protected boolean;
begin
  select immutable into protected from public.moodboard_revisions
  where id = case when tg_op = 'DELETE' then old.revision_id else new.revision_id end;
  if protected then raise exception 'published moodboard layers are immutable'; end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger protect_published_moodboard_layer
before insert or update or delete on public.moodboard_layers
for each row execute function public.protect_published_moodboard_layer();

create or replace function public.publish_moodboard(target_post_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare source_revision public.moodboard_revisions;
declare published_id uuid;
declare next_revision integer;
declare layer_count integer;
begin
  if not public.is_active_admin() then raise exception 'not authorized'; end if;
  select r.* into source_revision
  from public.moodboard_posts p
  join public.moodboard_revisions r on r.id = p.working_revision_id
  where p.id = target_post_id and p.author_id = auth.uid();
  if source_revision.id is null then raise exception 'working revision not found'; end if;
  if source_revision.preview_asset_id is null or source_revision.full_asset_id is null then
    raise exception 'rendered moodboard images are required';
  end if;
  select count(*) into layer_count from public.moodboard_layers where revision_id = source_revision.id;
  if layer_count > 50 then raise exception 'a moodboard can contain no more than 50 layers'; end if;
  if exists (
    select 1 from public.moodboard_layers
    where revision_id = source_revision.id and asset_id is not null and btrim(alt_text) = ''
  ) then raise exception 'image descriptions are required before publishing'; end if;
  select coalesce(max(revision_number), 0) + 1 into next_revision
    from public.moodboard_revisions where post_id = target_post_id;
  insert into public.moodboard_revisions (
    post_id, revision_number, title, background_color, preview_asset_id, full_asset_id,
    immutable, created_by
  ) values (
    target_post_id, next_revision, source_revision.title, source_revision.background_color,
    source_revision.preview_asset_id, source_revision.full_asset_id, false, auth.uid()
  ) returning id into published_id;
  insert into public.moodboard_layers (
    revision_id, stable_layer_id, position, asset_id, name, alt_text, x, y,
    layer_width, layer_height, rotation, opacity, visible, locked
  ) select published_id, stable_layer_id, position, asset_id, name, alt_text, x, y,
    layer_width, layer_height, rotation, opacity, visible, locked
    from public.moodboard_layers where revision_id = source_revision.id order by position;
  update public.moodboard_revisions set immutable = true where id = published_id;
  update public.moodboard_posts set published_revision_id = published_id,
    published_category_id = category_id,
    status = 'published', updated_at = now() where id = target_post_id;
  return published_id;
end;
$$;

alter table public.moodboard_categories enable row level security;
alter table public.moodboard_posts enable row level security;
alter table public.moodboard_revisions enable row level security;
alter table public.moodboard_layers enable row level security;

create policy "admins manage moodboard categories" on public.moodboard_categories
for all to authenticated using (public.is_active_admin() and owner_id = auth.uid())
with check (public.is_active_admin() and owner_id = auth.uid());
create policy "public reads moodboard categories" on public.moodboard_categories
for select to anon using (true);
create policy "admins manage moodboard posts" on public.moodboard_posts
for all to authenticated using (public.is_active_admin() and author_id = auth.uid())
with check (public.is_active_admin() and author_id = auth.uid());
create policy "public reads published moodboard identities" on public.moodboard_posts
for select to anon using (status in ('published','published_with_changes'));
create policy "admins manage moodboard revisions" on public.moodboard_revisions
for all to authenticated using (public.is_active_admin() and created_by = auth.uid())
with check (public.is_active_admin() and created_by = auth.uid());
create policy "public reads promoted moodboard revisions" on public.moodboard_revisions
for select to anon using (
  exists (select 1 from public.moodboard_posts p where p.published_revision_id = moodboard_revisions.id)
);
create policy "admins manage moodboard layers" on public.moodboard_layers
for all to authenticated using (
  exists (select 1 from public.moodboard_revisions r where r.id = moodboard_layers.revision_id
    and r.created_by = auth.uid() and public.is_active_admin())
) with check (
  exists (select 1 from public.moodboard_revisions r where r.id = moodboard_layers.revision_id
    and r.created_by = auth.uid() and public.is_active_admin())
);
create policy "public reads promoted moodboard layers" on public.moodboard_layers
for select to anon using (
  exists (select 1 from public.moodboard_posts p where p.published_revision_id = moodboard_layers.revision_id
    and p.status in ('published','published_with_changes'))
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
  );
$$;
