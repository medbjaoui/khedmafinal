
-- Create the 'cvs' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'cover_letters' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cover_letters', 'cover_letters', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies for 'cvs' bucket
CREATE POLICY "Allow authenticated users to upload CVs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cvs' AND auth.uid() = owner);
CREATE POLICY "Allow authenticated users to view CVs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'cvs' AND auth.uid() = owner);
CREATE POLICY "Allow authenticated users to update CVs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'cvs' AND auth.uid() = owner);
CREATE POLICY "Allow authenticated users to delete CVs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cvs' AND auth.uid() = owner);

-- Set up policies for 'cover_letters' bucket
CREATE POLICY "Allow authenticated users to upload cover letters" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cover_letters' AND auth.uid() = owner);
CREATE POLICY "Allow authenticated users to view cover letters" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'cover_letters' AND auth.uid() = owner);
CREATE POLICY "Allow authenticated users to update cover letters" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'cover_letters' AND auth.uid() = owner);
CREATE POLICY "Allow authenticated users to delete cover letters" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cover_letters' AND auth.uid() = owner);
