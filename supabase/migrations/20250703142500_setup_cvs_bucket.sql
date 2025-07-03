-- This script sets up the 'cvs' bucket and its security policies.

-- 1. Create the bucket if it doesn't exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to prevent conflicts during reset.
DROP POLICY IF EXISTS "Allow authenticated select on cvs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert on cvs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on cvs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on cvs" ON storage.objects;

-- 3. Create policies for the 'cvs' bucket.
-- Users can only access files within their own folder, identified by their user ID.

-- Allow SELECT for authenticated users on their own files.
CREATE POLICY "Allow authenticated select on cvs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow INSERT for authenticated users into their own folder.
CREATE POLICY "Allow authenticated insert on cvs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow UPDATE for authenticated users on their own files.
CREATE POLICY "Allow authenticated update on cvs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow DELETE for authenticated users on their own files.
CREATE POLICY "Allow authenticated delete on cvs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cvs' AND auth.uid() = (storage.foldername(name))[1]::uuid);
