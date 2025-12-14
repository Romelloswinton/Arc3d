# 🔧 Migration Troubleshooting Guide

## Common Errors & Solutions

### ❌ Error: "permission denied for schema auth"

**Cause:** The trigger `handle_new_user()` tries to access `auth.users` table

**Solution:** This is NORMAL and expected. The function has `SECURITY DEFINER` which gives it the necessary permissions. The migration should still succeed.

**Verify:** Check if the trigger was created:
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

### ❌ Error: "extension uuid-ossp does not exist"

**Cause:** UUID extension not installed

**Solution 1:** The migration includes this line at the top:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Solution 2:** If it still fails, run separately first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

Then re-run the full migration.

---

### ❌ Error: "relation storage.buckets does not exist"

**Cause:** Storage schema might not be accessible via SQL in some Supabase setups

**Solution:** Create storage buckets manually via Dashboard:

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Create these 4 buckets:

   **Bucket 1: project-thumbnails**
   - Name: `project-thumbnails`
   - Public: ✅ Yes
   - File size limit: `5 MB`
   - Allowed MIME types: `image/png, image/jpeg, image/webp`

   **Bucket 2: asset-media**
   - Name: `asset-media`
   - Public: ✅ Yes
   - File size limit: `10 MB`
   - Allowed MIME types: `image/png, image/jpeg, image/webp, image/svg+xml, video/mp4`

   **Bucket 3: exports**
   - Name: `exports`
   - Public: ❌ No (Private)
   - File size limit: `50 MB`
   - Allowed MIME types: `image/png, image/jpeg, image/svg+xml, application/zip`

   **Bucket 4: avatars**
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: `2 MB`
   - Allowed MIME types: `image/png, image/jpeg, image/webp`

4. After creating, run this to add RLS policies:
   ```sql
   -- Copy the storage RLS policies section from the migration file
   ```

---

### ❌ Error: "duplicate key value violates unique constraint"

**Cause:** You're running the migration a second time and tables/data already exist

**Solution 1 - Skip duplicates:** The combined migration uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`, so it should be safe to re-run.

**Solution 2 - Fresh start:** If you want to start over:
```sql
-- ⚠️ WARNING: This deletes ALL data! ⚠️
DROP TABLE IF EXISTS project_activity CASCADE;
DROP TABLE IF EXISTS project_collaborators CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS asset_categories CASCADE;
DROP TABLE IF EXISTS project_versions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Then run the migration again
```

---

### ❌ Error: "cannot execute ... in a read-only transaction"

**Cause:** Query is in read-only mode

**Solution:** Make sure you click the **"Run"** button (or press `Ctrl+Enter`), not just viewing the SQL.

---

### ❌ Error: "syntax error at or near..."

**Cause:** SQL syntax issue or incomplete copy-paste

**Solution:**
1. Make sure you copied the **entire** migration file
2. Check for any cut-off text at the beginning or end
3. Try copying from the file again
4. Make sure no extra characters were added

---

### ⚠️ Warning: "Only X policies found (expected 20+)"

**Cause:** Some RLS policies might have failed to create

**Solution:** Check which policies are missing:
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

Then manually create any missing policies from the migration file.

---

### ⚠️ Warning: Storage bucket policies not created

**Cause:** Storage policies require buckets to exist first

**Solution:**
1. Create buckets manually (see above)
2. Then run just the storage policies section:
   ```sql
   -- Copy the "Storage RLS Policies" section from the migration file
   ```

---

## Verification Checklist

After running the migration, verify:

- [ ] **8 tables created** - Run: `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';`
- [ ] **6 system categories** - Run: `SELECT COUNT(*) FROM asset_categories WHERE is_system = true;`
- [ ] **RLS enabled** - Run: `SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;`
- [ ] **~20+ RLS policies** - Run: `SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';`
- [ ] **5+ triggers** - Run: `SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public';`
- [ ] **3 functions** - Run verification query
- [ ] **4 storage buckets** - Check Dashboard → Storage

---

## Testing the Migration

### Test 1: Create a test user
1. Go to **Authentication** → **Users** → **Add User**
2. Add email: `test@example.com`, password: `testpassword123`
3. Check if profile was auto-created:
   ```sql
   SELECT * FROM profiles WHERE email = 'test@example.com';
   ```
   Should return 1 row ✅

### Test 2: Create a test project
```sql
-- Get test user ID
SELECT id FROM profiles WHERE email = 'test@example.com';

-- Create test project (replace USER_ID_HERE)
INSERT INTO projects (owner_id, name)
VALUES ('USER_ID_HERE', 'Test Project')
RETURNING *;
```
Should succeed ✅

### Test 3: Verify RLS works
```sql
-- Try to view another user's project (should fail)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'different-user-id';
SELECT * FROM projects WHERE owner_id != 'different-user-id';
-- Should return no rows ✅
```

---

## Still Having Issues?

### Get Detailed Error Info

Run this to see the full error details:
```sql
SELECT
  current_database() as database,
  current_user as user,
  version() as postgres_version;
```

### Check Supabase Logs

1. Go to **Logs** in Supabase Dashboard
2. Filter by **Database Logs**
3. Look for errors during migration time

### Manual Step-by-Step

If the combined migration fails, run each part separately:

1. Run `01_create_tables.sql`
2. Wait for success ✅
3. Run `02_create_functions_triggers.sql`
4. Wait for success ✅
5. Run `03_enable_rls.sql`
6. Wait for success ✅
7. Create storage buckets manually in Dashboard
8. Run storage policies section

---

## Need More Help?

If you're still stuck:

1. **Check the error message** - Copy the full error text
2. **Run verification script** - `VERIFY_MIGRATION.sql`
3. **Check which step failed** - Look at the verification results
4. **Share the error** - Provide:
   - Full error message
   - Which migration file/section failed
   - Verification script results
   - Supabase logs (if available)

---

## Success Indicators

You'll know the migration succeeded when:

✅ All verification checks pass (green checkmarks)
✅ You can sign up a new user and profile is auto-created
✅ You can create a project via the app
✅ Templates work (Cherry Blossoms, Alert Box)
✅ No console errors when using the app
✅ Storage uploads work (thumbnails, assets)

---

## Rollback (Nuclear Option)

If everything goes wrong and you want to start fresh:

```sql
-- ⚠️⚠️⚠️ THIS DELETES EVERYTHING! ⚠️⚠️⚠️
-- Only use this if you're absolutely sure

-- Drop all tables
DROP TABLE IF EXISTS project_activity CASCADE;
DROP TABLE IF EXISTS project_collaborators CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS asset_categories CASCADE;
DROP TABLE IF EXISTS project_versions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS set_version_number CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Delete storage buckets (manual in Dashboard)
-- Then re-run the full migration
```
