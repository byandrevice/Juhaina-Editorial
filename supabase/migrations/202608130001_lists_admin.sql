create table public.list_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  author_id uuid not null references auth.users(id),
  status public.publication_status not null default 'draft',
  working_revision_id uuid,
  published_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.list_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.list_posts(id) on delete cascade,
  revision_number integer not null,
  title text not null check (char_length(title) between 1 and 160),
  type_label text not null check (char_length(type_label) between 1 and 80),
  type_slug text not null check (type_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  period_label text not null check (char_length(period_label) between 1 and 80),
  period_slug text not null check (period_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  artwork_ratio text not null default 'poster_2_3'
    check (artwork_ratio in ('poster_2_3','book_5_8','square_1_1','landscape_16_9')),
  creator_label text not null default 'Creator' check (char_length(creator_label) between 1 and 50),
  show_ranks boolean not null default true,
  immutable boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, revision_number)
);

create table public.list_items (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.list_revisions(id) on delete cascade,
  stable_item_id uuid not null default gen_random_uuid(),
  position integer not null check (position between 1 and 20),
  title text not null check (char_length(title) between 1 and 180),
  creator text not null default '' check (char_length(creator) <= 180),
  item_year text not null default '' check (char_length(item_year) <= 80),
  image_asset_id uuid references public.assets(id) on delete set null,
  image_position_x numeric(5,2) not null default 50 check (image_position_x between 0 and 100),
  image_position_y numeric(5,2) not null default 50 check (image_position_y between 0 and 100),
  image_zoom numeric(4,2) not null default 1 check (image_zoom between 1 and 3),
  image_alt text not null default '' check (char_length(image_alt) <= 300),
  external_url text check (external_url is null or char_length(external_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (revision_id, position),
  unique (revision_id, stable_item_id)
);

alter table public.list_posts
  add constraint list_posts_working_revision_fkey
  foreign key (working_revision_id) references public.list_revisions(id),
  add constraint list_posts_published_revision_fkey
  foreign key (published_revision_id) references public.list_revisions(id);

create trigger protect_published_list_revision
before update or delete on public.list_revisions
for each row execute function public.protect_published_revision();

create or replace function public.protect_published_list_item()
returns trigger language plpgsql set search_path = public
as $$
declare protected boolean;
begin
  select immutable into protected from public.list_revisions
  where id = case when tg_op = 'DELETE' then old.revision_id else new.revision_id end;
  if protected then raise exception 'published list items are immutable'; end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger protect_published_list_item
before insert or update or delete on public.list_items
for each row execute function public.protect_published_list_item();

create or replace function public.publish_list(target_post_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare source_revision public.list_revisions;
declare published_id uuid;
declare next_revision integer;
declare item_count integer;
begin
  if not public.is_active_admin() then raise exception 'not authorized'; end if;

  select r.* into source_revision
  from public.list_posts p
  join public.list_revisions r on r.id = p.working_revision_id
  where p.id = target_post_id and p.author_id = auth.uid();

  if source_revision.id is null then raise exception 'working revision not found'; end if;
  select count(*) into item_count from public.list_items where revision_id = source_revision.id;
  if item_count < 1 then raise exception 'add at least one list item before publishing'; end if;
  if item_count > 20 then raise exception 'a list can contain no more than 20 items'; end if;

  if exists (
    select 1 from public.list_posts other
    join public.list_revisions promoted on promoted.id = other.published_revision_id
    where other.id <> target_post_id
      and other.status in ('published','published_with_changes')
      and promoted.type_slug = source_revision.type_slug
      and promoted.period_slug = source_revision.period_slug
  ) then
    raise exception 'another live list already uses this Type and Period';
  end if;

  select coalesce(max(revision_number), 0) + 1 into next_revision
  from public.list_revisions where post_id = target_post_id;

  insert into public.list_revisions (
    post_id, revision_number, title, type_label, type_slug, period_label, period_slug,
    artwork_ratio, creator_label, show_ranks, immutable, created_by
  ) values (
    target_post_id, next_revision, source_revision.title, source_revision.type_label,
    source_revision.type_slug, source_revision.period_label, source_revision.period_slug,
    source_revision.artwork_ratio, source_revision.creator_label, source_revision.show_ranks,
    false, auth.uid()
  ) returning id into published_id;

  insert into public.list_items (
    revision_id, stable_item_id, position, title, creator, item_year, image_asset_id,
    image_position_x, image_position_y, image_zoom, image_alt, external_url
  ) select
    published_id, stable_item_id, position, title, creator, item_year, image_asset_id,
    image_position_x, image_position_y, image_zoom, image_alt, external_url
  from public.list_items where revision_id = source_revision.id order by position;

  update public.list_revisions set immutable = true where id = published_id;

  update public.list_posts set
    published_revision_id = published_id,
    status = 'published', updated_at = now()
  where id = target_post_id;
  return published_id;
end;
$$;

alter table public.list_posts enable row level security;
alter table public.list_revisions enable row level security;
alter table public.list_items enable row level security;

create policy "admins manage list posts" on public.list_posts
for all to authenticated using (public.is_active_admin() and author_id = auth.uid())
with check (public.is_active_admin() and author_id = auth.uid());
create policy "public reads published list identities" on public.list_posts
for select to anon using (status in ('published','published_with_changes'));
create policy "admins manage list revisions" on public.list_revisions
for all to authenticated using (public.is_active_admin() and created_by = auth.uid())
with check (public.is_active_admin() and created_by = auth.uid());
create policy "public reads only promoted list revisions" on public.list_revisions
for select to anon using (
  exists (select 1 from public.list_posts p where p.published_revision_id = list_revisions.id)
);
create policy "admins manage list items" on public.list_items
for all to authenticated using (
  exists (
    select 1 from public.list_revisions r
    where r.id = list_items.revision_id and r.created_by = auth.uid() and public.is_active_admin()
  )
) with check (
  exists (
    select 1 from public.list_revisions r
    where r.id = list_items.revision_id and r.created_by = auth.uid() and public.is_active_admin()
  )
);
create policy "public reads promoted list items" on public.list_items
for select to anon using (
  exists (
    select 1 from public.list_posts p where p.published_revision_id = list_items.revision_id
      and p.status in ('published','published_with_changes')
  )
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
  ) or exists (
    select 1
    from public.assets a
    join public.list_items i on i.image_asset_id = a.id
    join public.list_posts p on p.published_revision_id = i.revision_id
    where a.storage_path = path_to_check
      and p.status in ('published', 'published_with_changes')
  );
$$;
