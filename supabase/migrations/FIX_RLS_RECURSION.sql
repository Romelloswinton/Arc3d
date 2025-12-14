-- =============================================
-- FIX: Infinite Recursion in RLS Policies
-- =============================================
-- Run this in Supabase SQL Editor to fix the recursion issue
-- =============================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Recreate simplified policies without recursion
-- These policies avoid checking project_collaborators during the policy evaluation

-- 1. SELECT policy - simplified to avoid recursion
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = owner_id
    OR is_public = TRUE
  );

-- 2. INSERT policy - simple check
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- 3. UPDATE policy - simplified
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id);

-- 4. DELETE policy - simple check
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================
-- Verification
-- =============================================

-- Check that policies were recreated
SELECT
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;
