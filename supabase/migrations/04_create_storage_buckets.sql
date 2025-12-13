-- =============================================
-- Arc3D Database Schema - Storage Buckets
-- =============================================

-- Note: Run this in Supabase SQL Editor OR use Supabase Dashboard
-- to create storage buckets manually

-- =============================================
-- CREATE STORAGE BUCKETS
-- =============================================

-- Project thumbnails (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-thumbnails',
  'project-thumbnails',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Asset media (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'asset-media',
  'asset-media',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Exports (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exports',
  'exports',
  false,
  52428800, -- 50MB
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- User avatars (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE RLS POLICIES
-- =============================================

-- Project thumbnails: Users can upload for their own projects
CREATE POLICY "Users can upload project thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update project thumbnails"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete project thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Project thumbnails are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-thumbnails');

-- Asset media: Users can upload for their own assets
CREATE POLICY "Users can upload asset media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'asset-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update asset media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'asset-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete asset media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'asset-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Asset media is publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'asset-media');

-- Exports: Users can only access their own
CREATE POLICY "Users can upload own exports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own exports"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own exports"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own exports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
