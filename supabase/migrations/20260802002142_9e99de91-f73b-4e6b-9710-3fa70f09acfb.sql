CREATE POLICY "Team can read files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'files');
CREATE POLICY "Team can upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'files');
CREATE POLICY "Team can update files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'files') WITH CHECK (bucket_id = 'files');
CREATE POLICY "Team can delete files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'files');