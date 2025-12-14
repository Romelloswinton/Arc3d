-- =============================================
-- Arc3D - COMBINED DATABASE MIGRATION
-- =============================================
--
-- This file combines all 4 migration files into one.
-- Run this ONCE in your Supabase SQL Editor.
--
-- After running, verify using the verification queries at the bottom.
-- =============================================

-- =============================================
-- PART 1: CREATE TABLES
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  tier TEXT NOT NULL DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PRO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Overlay',
  description TEXT,
  thumbnail_url TEXT,

  -- Canvas settings
  canvas_width INTEGER NOT NULL DEFAULT 1920,
  canvas_height INTEGER NOT NULL DEFAULT 1080,
  canvas_background_color TEXT DEFAULT '#1a1a2e',

  -- Project state (serialized JSON)
  project_data JSONB NOT NULL DEFAULT '{"shapes": [], "layers": []}'::jsonb,

  -- Metadata
  is_template BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  category TEXT,
  tags TEXT[],
  collaborative BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_opened_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- 3. PROJECT_VERSIONS TABLE
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  project_data JSONB NOT NULL,
  change_description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(project_id, version_number)
);

-- Indexes for project_versions
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_created_at ON project_versions(created_at DESC);

-- 4. ASSET_CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for asset_categories
CREATE INDEX IF NOT EXISTS idx_asset_categories_is_system ON asset_categories(is_system);
CREATE INDEX IF NOT EXISTS idx_asset_categories_owner_id ON asset_categories(owner_id);

-- Seed system categories
INSERT INTO asset_categories (name, icon, description, is_system, display_order)
VALUES
  ('Overlays', 'layers', 'Full overlay templates', TRUE, 1),
  ('Badges', 'award', 'Custom badges and icons', TRUE, 2),
  ('Widgets', 'cpu', 'Interactive stream widgets', TRUE, 3),
  ('Templates', 'grid', 'Reusable design templates', TRUE, 4),
  ('Components', 'package', 'UI components', TRUE, 5),
  ('Presets', 'sparkles', 'Style presets', TRUE, 6)
ON CONFLICT (name) DO NOTHING;

-- 5. ASSETS TABLE
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('component', 'template', 'preset')),
  category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
  asset_data JSONB NOT NULL,
  thumbnail_url TEXT,
  preview_urls TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[],
  download_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for assets
CREATE INDEX IF NOT EXISTS idx_assets_owner_id ON assets(owner_id);
CREATE INDEX IF NOT EXISTS idx_assets_category_id ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_is_public ON assets(is_public);
CREATE INDEX IF NOT EXISTS idx_assets_deleted_at ON assets(deleted_at);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);

-- 6. USER_FAVORITES TABLE
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, asset_id)
);

-- Indexes for user_favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_asset_id ON user_favorites(asset_id);

-- 7. PROJECT_COLLABORATORS TABLE
CREATE TABLE IF NOT EXISTS project_collaborators (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  PRIMARY KEY (project_id, user_id)
);

-- Indexes for project_collaborators
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);

-- 8. PROJECT_ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'shared', 'exported')),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for project_activity
CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_user_id ON project_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_created_at ON project_activity(created_at DESC);

-- =============================================
-- PART 2: CREATE FUNCTIONS & TRIGGERS
-- =============================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-set version number
CREATE OR REPLACE FUNCTION set_version_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.version_number IS NULL THEN
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO NEW.version_number
    FROM project_versions
    WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Handle new user signup (auto-create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers: Auto-update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-set version number
DROP TRIGGER IF EXISTS set_project_version_number ON project_versions;
CREATE TRIGGER set_project_version_number
  BEFORE INSERT ON project_versions
  FOR EACH ROW
  EXECUTE FUNCTION set_version_number();

-- Trigger: Handle new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- PART 3: ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: PROFILES
-- =============================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- RLS POLICIES: PROJECTS
-- =============================================

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = owner_id
    OR is_public = TRUE
    OR EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = id AND user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================
-- RLS POLICIES: PROJECT_VERSIONS
-- =============================================

DROP POLICY IF EXISTS "Users can view project versions" ON project_versions;
CREATE POLICY "Users can view project versions"
  ON project_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND (
        projects.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_collaborators
          WHERE project_collaborators.project_id = projects.id
          AND project_collaborators.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create project versions" ON project_versions;
CREATE POLICY "Users can create project versions"
  ON project_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND (
        projects.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_collaborators
          WHERE project_collaborators.project_id = projects.id
          AND project_collaborators.user_id = auth.uid()
          AND role IN ('owner', 'editor')
        )
      )
    )
  );

-- =============================================
-- RLS POLICIES: ASSET_CATEGORIES
-- =============================================

DROP POLICY IF EXISTS "Anyone can view asset categories" ON asset_categories;
CREATE POLICY "Anyone can view asset categories"
  ON asset_categories FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Users can create custom categories" ON asset_categories;
CREATE POLICY "Users can create custom categories"
  ON asset_categories FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND is_system = FALSE);

DROP POLICY IF EXISTS "Users can update own categories" ON asset_categories;
CREATE POLICY "Users can update own categories"
  ON asset_categories FOR UPDATE
  USING (auth.uid() = owner_id AND is_system = FALSE);

DROP POLICY IF EXISTS "Users can delete own categories" ON asset_categories;
CREATE POLICY "Users can delete own categories"
  ON asset_categories FOR DELETE
  USING (auth.uid() = owner_id AND is_system = FALSE);

-- =============================================
-- RLS POLICIES: ASSETS
-- =============================================

DROP POLICY IF EXISTS "Users can view public and own assets" ON assets;
CREATE POLICY "Users can view public and own assets"
  ON assets FOR SELECT
  USING (
    is_public = TRUE
    OR auth.uid() = owner_id
  );

DROP POLICY IF EXISTS "Users can create assets" ON assets;
CREATE POLICY "Users can create assets"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own assets" ON assets;
CREATE POLICY "Users can update own assets"
  ON assets FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own assets" ON assets;
CREATE POLICY "Users can delete own assets"
  ON assets FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================
-- RLS POLICIES: USER_FAVORITES
-- =============================================

DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add favorites" ON user_favorites;
CREATE POLICY "Users can add favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove favorites" ON user_favorites;
CREATE POLICY "Users can remove favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES: PROJECT_COLLABORATORS
-- =============================================

DROP POLICY IF EXISTS "Users can view project collaborators" ON project_collaborators;
CREATE POLICY "Users can view project collaborators"
  ON project_collaborators FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Project owners can add collaborators" ON project_collaborators;
CREATE POLICY "Project owners can add collaborators"
  ON project_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Project owners can remove collaborators" ON project_collaborators;
CREATE POLICY "Project owners can remove collaborators"
  ON project_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id AND projects.owner_id = auth.uid()
    )
  );

-- =============================================
-- RLS POLICIES: PROJECT_ACTIVITY
-- =============================================

DROP POLICY IF EXISTS "Users can view project activity" ON project_activity;
CREATE POLICY "Users can view project activity"
  ON project_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND (
        projects.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_collaborators
          WHERE project_collaborators.project_id = projects.id
          AND project_collaborators.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create activity logs" ON project_activity;
CREATE POLICY "Users can create activity logs"
  ON project_activity FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND (
        projects.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_collaborators
          WHERE project_collaborators.project_id = projects.id
          AND project_collaborators.user_id = auth.uid()
        )
      )
    )
  );

-- =============================================
-- PART 4: CREATE STORAGE BUCKETS
-- =============================================
-- Note: Storage buckets may need to be created manually via the Supabase Dashboard
-- if the SQL commands fail. Go to Storage → New Bucket

-- Insert storage buckets (this might fail, see note above)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('project-thumbnails', 'project-thumbnails', TRUE, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]),
  ('asset-media', 'asset-media', TRUE, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'video/mp4']::text[]),
  ('exports', 'exports', FALSE, 52428800, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'application/zip']::text[]),
  ('avatars', 'avatars', TRUE, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Users can upload own thumbnails" ON storage.objects;
CREATE POLICY "Users can upload own thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-thumbnails'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can view thumbnails" ON storage.objects;
CREATE POLICY "Anyone can view thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-thumbnails');

DROP POLICY IF EXISTS "Users can upload own asset media" ON storage.objects;
CREATE POLICY "Users can upload own asset media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'asset-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can view asset media" ON storage.objects;
CREATE POLICY "Anyone can view asset media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'asset-media');

DROP POLICY IF EXISTS "Users can upload own exports" ON storage.objects;
CREATE POLICY "Users can upload own exports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view own exports" ON storage.objects;
CREATE POLICY "Users can view own exports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- =============================================
-- MIGRATION COMPLETE!
-- =============================================
-- Run the verification queries below to confirm everything worked.
