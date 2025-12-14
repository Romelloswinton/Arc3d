-- =============================================
-- MIGRATION VERIFICATION SCRIPT
-- =============================================
-- Run these queries AFTER running the migration to verify everything worked
-- =============================================

-- =============================================
-- 1. CHECK ALL TABLES EXIST
-- =============================================

SELECT
  '✅ TABLES CHECK' as test,
  CASE
    WHEN COUNT(*) = 8 THEN '✅ PASS: All 8 tables created'
    ELSE '❌ FAIL: Expected 8 tables, found ' || COUNT(*)
  END as result
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'projects', 'project_versions',
    'asset_categories', 'assets', 'user_favorites',
    'project_collaborators', 'project_activity'
  );

-- List all tables
SELECT
  '📋 TABLE LIST' as info,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =============================================
-- 2. CHECK SYSTEM CATEGORIES SEEDED
-- =============================================

SELECT
  '✅ SYSTEM CATEGORIES CHECK' as test,
  CASE
    WHEN COUNT(*) = 6 THEN '✅ PASS: All 6 system categories created'
    ELSE '❌ FAIL: Expected 6 categories, found ' || COUNT(*)
  END as result
FROM asset_categories
WHERE is_system = true;

-- List system categories
SELECT
  '📋 SYSTEM CATEGORIES' as info,
  name,
  icon,
  description
FROM asset_categories
WHERE is_system = true
ORDER BY display_order;

-- =============================================
-- 3. CHECK ROW LEVEL SECURITY ENABLED
-- =============================================

SELECT
  '✅ RLS CHECK' as test,
  CASE
    WHEN COUNT(*) = 8 AND COUNT(*) = COUNT(CASE WHEN rowsecurity THEN 1 END)
    THEN '✅ PASS: RLS enabled on all 8 tables'
    ELSE '❌ FAIL: RLS not enabled on all tables'
  END as result
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'projects', 'project_versions',
    'asset_categories', 'assets', 'user_favorites',
    'project_collaborators', 'project_activity'
  );

-- List RLS status per table
SELECT
  '📋 RLS STATUS' as info,
  tablename as table_name,
  CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================
-- 4. CHECK RLS POLICIES CREATED
-- =============================================

SELECT
  '✅ RLS POLICIES CHECK' as test,
  CASE
    WHEN COUNT(*) >= 20 THEN '✅ PASS: ' || COUNT(*) || ' RLS policies created'
    ELSE '⚠️ WARNING: Only ' || COUNT(*) || ' policies found (expected ~20+)'
  END as result
FROM pg_policies
WHERE schemaname = 'public';

-- List policies per table
SELECT
  '📋 POLICIES BY TABLE' as info,
  tablename as table_name,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =============================================
-- 5. CHECK TRIGGERS CREATED
-- =============================================

SELECT
  '✅ TRIGGERS CHECK' as test,
  CASE
    WHEN COUNT(*) >= 5 THEN '✅ PASS: ' || COUNT(*) || ' triggers created'
    ELSE '⚠️ WARNING: Only ' || COUNT(*) || ' triggers found (expected 5+)'
  END as result
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- List all triggers
SELECT
  '📋 TRIGGER LIST' as info,
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation as event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =============================================
-- 6. CHECK FUNCTIONS CREATED
-- =============================================

SELECT
  '✅ FUNCTIONS CHECK' as test,
  CASE
    WHEN COUNT(*) >= 3 THEN '✅ PASS: ' || COUNT(*) || ' functions created'
    ELSE '⚠️ WARNING: Only ' || COUNT(*) || ' functions found (expected 3)'
  END as result
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN ('update_updated_at_column', 'set_version_number', 'handle_new_user');

-- List functions
SELECT
  '📋 FUNCTION LIST' as info,
  proname as function_name
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN ('update_updated_at_column', 'set_version_number', 'handle_new_user');

-- =============================================
-- 7. CHECK STORAGE BUCKETS
-- =============================================
-- Note: This query might fail if storage schema doesn't exist

SELECT
  '✅ STORAGE BUCKETS CHECK' as test,
  CASE
    WHEN COUNT(*) = 4 THEN '✅ PASS: All 4 storage buckets created'
    WHEN COUNT(*) = 0 THEN '⚠️ INFO: No buckets found - you may need to create them manually'
    ELSE '⚠️ WARNING: Expected 4 buckets, found ' || COUNT(*)
  END as result
FROM storage.buckets
WHERE id IN ('project-thumbnails', 'asset-media', 'exports', 'avatars');

-- List storage buckets
SELECT
  '📋 STORAGE BUCKETS' as info,
  id as bucket_id,
  name,
  CASE WHEN public THEN '✅ Public' ELSE '🔒 Private' END as access,
  file_size_limit / 1048576 || ' MB' as size_limit
FROM storage.buckets
ORDER BY id;

-- =============================================
-- 8. CHECK INDEXES CREATED
-- =============================================

SELECT
  '✅ INDEXES CHECK' as test,
  CASE
    WHEN COUNT(*) >= 15 THEN '✅ PASS: ' || COUNT(*) || ' indexes created'
    ELSE '⚠️ WARNING: Only ' || COUNT(*) || ' indexes found (expected ~15+)'
  END as result
FROM pg_indexes
WHERE schemaname = 'public';

-- Count indexes per table
SELECT
  '📋 INDEXES BY TABLE' as info,
  tablename as table_name,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =============================================
-- SUMMARY REPORT
-- =============================================

SELECT
  '════════════════════════════════════════' as separator,
  '📊 MIGRATION SUMMARY REPORT' as title,
  '════════════════════════════════════════' as separator2;

SELECT
  'Total Tables' as metric,
  COUNT(*)::text as value
FROM information_schema.tables
WHERE table_schema = 'public'
UNION ALL
SELECT
  'System Categories',
  COUNT(*)::text
FROM asset_categories
WHERE is_system = true
UNION ALL
SELECT
  'RLS Policies',
  COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT
  'Triggers',
  COUNT(*)::text
FROM information_schema.triggers
WHERE trigger_schema = 'public'
UNION ALL
SELECT
  'Functions',
  COUNT(*)::text
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN ('update_updated_at_column', 'set_version_number', 'handle_new_user')
UNION ALL
SELECT
  'Storage Buckets',
  COALESCE(COUNT(*)::text, 'N/A')
FROM storage.buckets
WHERE id IN ('project-thumbnails', 'asset-media', 'exports', 'avatars');

-- =============================================
-- FINAL STATUS
-- =============================================

SELECT
  '════════════════════════════════════════' as separator,
  CASE
    WHEN (
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') = 8
      AND (SELECT COUNT(*) FROM asset_categories WHERE is_system = true) = 6
      AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 20
    )
    THEN '✅✅✅ MIGRATION SUCCESSFUL! ✅✅✅'
    ELSE '⚠️ MIGRATION COMPLETED WITH WARNINGS ⚠️'
  END as status,
  '════════════════════════════════════════' as separator2;

-- =============================================
-- NEXT STEPS
-- =============================================

SELECT '📝 NEXT STEPS:' as info
UNION ALL SELECT '1. If storage buckets failed, create them manually in Dashboard → Storage'
UNION ALL SELECT '2. Test authentication by signing up a test user'
UNION ALL SELECT '3. Verify profile auto-creation works'
UNION ALL SELECT '4. Try creating a test project'
UNION ALL SELECT '5. Check that RLS policies work correctly';
