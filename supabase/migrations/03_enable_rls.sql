-- =============================================
-- Arc3D Database Schema - Enable RLS
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
-- PROFILES POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Profiles can be created (via trigger)
CREATE POLICY "Profiles can be created"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- PROJECTS POLICIES
-- =============================================

-- Users can view their own projects, public projects, or shared projects
CREATE POLICY "Users can view accessible projects"
  ON projects FOR SELECT
  USING (
    owner_id = auth.uid() OR
    is_public = TRUE OR
    EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = projects.id
        AND user_id = auth.uid()
        AND accepted_at IS NOT NULL
    )
  );

-- Users can insert their own projects
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Users can update their own projects or projects they have editor access to
CREATE POLICY "Users can update accessible projects"
  ON projects FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = projects.id
        AND user_id = auth.uid()
        AND role IN ('owner', 'editor')
        AND accepted_at IS NOT NULL
    )
  );

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (owner_id = auth.uid());

-- =============================================
-- PROJECT VERSIONS POLICIES
-- =============================================

-- Users can view versions of projects they have access to
CREATE POLICY "Users can view accessible versions"
  ON project_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_versions.project_id
        AND (
          projects.owner_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM project_collaborators
            WHERE project_collaborators.project_id = projects.id
              AND project_collaborators.user_id = auth.uid()
              AND accepted_at IS NOT NULL
          )
        )
    )
  );

-- Users can create versions for projects they can edit
CREATE POLICY "Users can create versions"
  ON project_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_versions.project_id
        AND (
          projects.owner_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM project_collaborators
            WHERE project_collaborators.project_id = projects.id
              AND project_collaborators.user_id = auth.uid()
              AND role IN ('owner', 'editor')
              AND accepted_at IS NOT NULL
          )
        )
    )
  );

-- =============================================
-- ASSET CATEGORIES POLICIES
-- =============================================

-- Everyone can view system categories, users can view their own
CREATE POLICY "Users can view accessible categories"
  ON asset_categories FOR SELECT
  USING (is_system = TRUE OR owner_id = auth.uid());

-- Users can create their own categories
CREATE POLICY "Users can create categories"
  ON asset_categories FOR INSERT
  WITH CHECK (owner_id = auth.uid() AND is_system = FALSE);

-- Users can update their own categories
CREATE POLICY "Users can update own categories"
  ON asset_categories FOR UPDATE
  USING (owner_id = auth.uid() AND is_system = FALSE);

-- Users can delete their own categories
CREATE POLICY "Users can delete own categories"
  ON asset_categories FOR DELETE
  USING (owner_id = auth.uid() AND is_system = FALSE);

-- =============================================
-- ASSETS POLICIES
-- =============================================

-- Users can view their own assets and public assets
CREATE POLICY "Users can view accessible assets"
  ON assets FOR SELECT
  USING (owner_id = auth.uid() OR is_public = TRUE);

-- Users can create their own assets
CREATE POLICY "Users can create assets"
  ON assets FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Users can update their own assets
CREATE POLICY "Users can update own assets"
  ON assets FOR UPDATE
  USING (owner_id = auth.uid());

-- Users can delete their own assets
CREATE POLICY "Users can delete own assets"
  ON assets FOR DELETE
  USING (owner_id = auth.uid());

-- =============================================
-- USER FAVORITES POLICIES
-- =============================================

CREATE POLICY "Users can manage own favorites"
  ON user_favorites FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- PROJECT COLLABORATORS POLICIES
-- =============================================

-- Users can view collaborators for projects they have access to
CREATE POLICY "Users can view project collaborators"
  ON project_collaborators FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_collaborators.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Only project owners can add collaborators
CREATE POLICY "Owners can add collaborators"
  ON project_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- =============================================
-- PROJECT ACTIVITY POLICIES
-- =============================================

-- Users can view activity for projects they have access to
CREATE POLICY "Users can view project activity"
  ON project_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_activity.project_id
        AND (
          projects.owner_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM project_collaborators
            WHERE project_collaborators.project_id = projects.id
              AND project_collaborators.user_id = auth.uid()
              AND accepted_at IS NOT NULL
          )
        )
    )
  );

-- System can insert activity logs
CREATE POLICY "Activity can be logged"
  ON project_activity FOR INSERT
  WITH CHECK (true);
