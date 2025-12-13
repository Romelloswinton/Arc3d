-- =============================================
-- Arc3D Database Schema - Tables
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE (extends auth.users)
-- =============================================

CREATE TABLE profiles (
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
CREATE INDEX idx_profiles_tier ON profiles(tier);
CREATE INDEX idx_profiles_email ON profiles(email);

-- =============================================
-- 2. PROJECTS TABLE
-- =============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Overlay',
  description TEXT,
  thumbnail_url TEXT,

  -- Canvas settings
  canvas_width INTEGER NOT NULL DEFAULT 1920,
  canvas_height INTEGER NOT NULL DEFAULT 1080,
  canvas_background_color TEXT DEFAULT '#000000',

  -- Project state (serialized JSON)
  project_data JSONB NOT NULL DEFAULT '{"shapes": [], "layers": []}'::jsonb,

  -- Metadata
  is_template BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  category TEXT,
  tags TEXT[],

  -- Collaboration (future)
  collaborative BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_opened_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for projects
CREATE INDEX idx_projects_owner ON projects(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_updated ON projects(updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_template ON projects(is_template) WHERE is_template = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_projects_public ON projects(is_public) WHERE is_public = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_projects_category ON projects(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);

-- Full text search on name and description
CREATE INDEX idx_projects_search ON projects USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- =============================================
-- 3. PROJECT VERSIONS TABLE
-- =============================================

CREATE TABLE project_versions (
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
CREATE INDEX idx_versions_project ON project_versions(project_id, version_number DESC);
CREATE INDEX idx_versions_created ON project_versions(created_at DESC);

-- =============================================
-- 4. ASSET CATEGORIES TABLE
-- =============================================

CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(owner_id, name)
);

-- Indexes for asset_categories
CREATE INDEX idx_asset_categories_owner ON asset_categories(owner_id);
CREATE INDEX idx_asset_categories_system ON asset_categories(is_system) WHERE is_system = TRUE;

-- Seed system categories
INSERT INTO asset_categories (name, icon, is_system, display_order) VALUES
  ('Overlays', 'Layers', TRUE, 1),
  ('Badges', 'Award', TRUE, 2),
  ('Widgets', 'Box', TRUE, 3),
  ('Templates', 'FileText', TRUE, 4),
  ('Components', 'Component', TRUE, 5),
  ('Presets', 'Palette', TRUE, 6);

-- =============================================
-- 5. ASSETS TABLE
-- =============================================

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('component', 'template', 'preset')),
  category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,

  -- Asset data (shapes, layers, or style presets)
  asset_data JSONB NOT NULL,

  -- Thumbnails stored in Supabase Storage
  thumbnail_url TEXT,
  preview_urls TEXT[],

  -- Metadata
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[],
  download_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for assets
CREATE INDEX idx_assets_owner ON assets(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_category ON assets(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_type ON assets(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_public ON assets(is_public) WHERE is_public = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_assets_tags ON assets USING GIN(tags);
CREATE INDEX idx_assets_search ON assets USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- =============================================
-- 6. USER FAVORITES TABLE
-- =============================================

CREATE TABLE user_favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, asset_id)
);

CREATE INDEX idx_favorites_user ON user_favorites(user_id, created_at DESC);
CREATE INDEX idx_favorites_asset ON user_favorites(asset_id);

-- =============================================
-- 7. PROJECT COLLABORATORS TABLE (Future)
-- =============================================

CREATE TABLE project_collaborators (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_collaborators_user ON project_collaborators(user_id);
CREATE INDEX idx_collaborators_project ON project_collaborators(project_id);

-- =============================================
-- 8. PROJECT ACTIVITY TABLE (Audit Log)
-- =============================================

CREATE TABLE project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_project ON project_activity(project_id, created_at DESC);
CREATE INDEX idx_activity_user ON project_activity(user_id, created_at DESC);
