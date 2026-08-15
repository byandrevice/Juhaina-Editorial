alter table public.film_revisions
  add column cover_zoom numeric(4,2) not null default 1
  check (cover_zoom between 1 and 3);

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
    cover_position_x, cover_position_y, cover_zoom, film_title, director, film_year,
    featured, published_at, immutable, created_by
  ) values (
    target_post_id, next_revision, source_revision.title, source_revision.subtitle,
    source_revision.body, source_revision.cover_asset_id, source_revision.cover_position_x,
    source_revision.cover_position_y, source_revision.cover_zoom, source_revision.film_title,
    source_revision.director, source_revision.film_year, source_revision.featured,
    coalesce(source_revision.published_at, current_date), true, auth.uid()
  ) returning id into published_id;

  update public.film_posts set
    published_revision_id = published_id,
    status = 'published', updated_at = now()
  where id = target_post_id;
  return published_id;
end;
$$;
