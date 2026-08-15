create policy "admins delete editorial images" on storage.objects
for delete to authenticated using (
  bucket_id = 'editorial-images' and public.is_active_admin()
);
