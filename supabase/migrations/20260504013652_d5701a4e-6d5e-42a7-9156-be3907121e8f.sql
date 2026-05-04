
-- restrict listing on project-files: only owner can list their folder
DROP POLICY IF EXISTS "project_files_public_read" ON storage.objects;
CREATE POLICY "project_files_owner_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "project_files_admin_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'project-files' AND public.has_role(auth.uid(), 'admin'));

-- restrict listing on mentor-photos: only admins can list (public URLs still work without listing)
DROP POLICY IF EXISTS "mentor_photos_public_read" ON storage.objects;
CREATE POLICY "mentor_photos_admin_list" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'mentor-photos' AND public.has_role(auth.uid(), 'admin'));

-- internal trigger function should not be callable by clients
REVOKE EXECUTE ON FUNCTION public.enforce_session_capacity() FROM PUBLIC, anon, authenticated;
