-- Fix Row Level Security policies for founder_data and users tables
-- Required for Clerk native Supabase integration (JWKS)
-- auth.uid() returns the Clerk user ID (e.g. "user_2abc...")

-- ============================================================
-- TABLE: founder_data
-- ============================================================

ALTER TABLE founder_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own data" ON founder_data;
DROP POLICY IF EXISTS "Users can insert own data" ON founder_data;
DROP POLICY IF EXISTS "Users can update own data" ON founder_data;
DROP POLICY IF EXISTS "Users can delete own data" ON founder_data;

-- SELECT: user can read only their own row
CREATE POLICY "Users can view own data"
    ON founder_data FOR SELECT
    USING ((select auth.uid()::text) = user_id);

-- INSERT: user can only insert a row with their own user_id
CREATE POLICY "Users can insert own data"
    ON founder_data FOR INSERT
    WITH CHECK ((select auth.uid()::text) = user_id);

-- UPDATE: user can only update their own row
CREATE POLICY "Users can update own data"
    ON founder_data FOR UPDATE
    USING ((select auth.uid()::text) = user_id)
    WITH CHECK ((select auth.uid()::text) = user_id);

-- DELETE: user can only delete their own row
CREATE POLICY "Users can delete own data"
    ON founder_data FOR DELETE
    USING ((select auth.uid()::text) = user_id);


-- ============================================================
-- TABLE: users
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- SELECT: user can read only their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING ((select auth.uid()::text) = id);

-- INSERT: user can only insert their own profile row
CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK ((select auth.uid()::text) = id);

-- UPDATE: user can only update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING ((select auth.uid()::text) = id)
    WITH CHECK ((select auth.uid()::text) = id);
