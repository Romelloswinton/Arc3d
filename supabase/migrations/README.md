# Database Migration Instructions

Run these SQL files **in order** in your Supabase SQL Editor.

## How to Run Migrations

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste each file's contents in order
5. Click **Run** (or press `Ctrl+Enter`)
6. Verify success message before moving to next file

## Migration Order

Run in this exact order:

### ✅ Step 1: Create Tables
**File:** `01_create_tables.sql`

Creates all 8 database tables:
- `profiles` - User profiles
- `projects` - Overlay designs
- `project_versions` - Version history
- `asset_categories` - Asset organization
- `assets` - Reusable components
- `user_favorites` - User's favorited assets
- `project_collaborators` - Sharing & collaboration
- `project_activity` - Audit log

**Also includes:** Indexes, seed data for system categories

---

### ✅ Step 2: Create Functions & Triggers
**File:** `02_create_functions_triggers.sql`

Creates:
- `update_updated_at_column()` - Auto-update timestamps
- `set_version_number()` - Auto-increment version numbers
- `handle_new_user()` - Auto-create profile on signup
- All necessary triggers

---

### ✅ Step 3: Enable Row Level Security
**File:** `03_enable_rls.sql`

Enables RLS on all tables and creates security policies:
- Users can only access their own data
- Public projects/assets are accessible to all
- Collaboration permissions enforced
- Prevents unauthorized access

---

### ✅ Step 4: Create Storage Buckets
**File:** `04_create_storage_buckets.sql`

Creates 4 storage buckets with RLS policies:
- `project-thumbnails` (public, 5MB limit)
- `asset-media` (public, 10MB limit)
- `exports` (private, 50MB limit)
- `avatars` (public, 2MB limit)

---

## Verification

After running all migrations, verify:

1. **Tables Created:**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```
   Should show: `asset_categories`, `assets`, `profiles`, `project_activity`, `project_collaborators`, `project_versions`, `projects`, `user_favorites`

2. **System Categories Exist:**
   ```sql
   SELECT name FROM asset_categories WHERE is_system = true;
   ```
   Should show: Overlays, Badges, Widgets, Templates, Components, Presets

3. **Storage Buckets Created:**
   Go to **Storage** in Supabase dashboard, should see 4 buckets

4. **RLS Enabled:**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```
   All tables should have `rowsecurity = true`

---

## Troubleshooting

**Error: "extension uuid-ossp does not exist"**
- Run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` first

**Error: "permission denied for schema auth"**
- You're running as service_role, this is fine. The `handle_new_user()` function has `SECURITY DEFINER` to handle this.

**Error: "relation storage.buckets does not exist"**
- Storage buckets might need to be created via Dashboard instead of SQL
- Go to **Storage** → **New Bucket** and create manually

**Error: "cannot execute ... in a read-only transaction"**
- Make sure you clicked **Run** button, not just viewing the query

---

## Next Steps

After successful migration:
1. ✅ Generate TypeScript types
2. ✅ Create Supabase client wrappers
3. ✅ Set up authentication

See main implementation plan for details.
