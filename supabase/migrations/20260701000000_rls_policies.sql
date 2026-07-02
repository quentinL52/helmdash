-- Migration: RLS Policies for all user-scoped tables
-- Ensures every table with user_id has Row Level Security enabled.
-- Prisma (service_role) bypasses RLS — these policies protect direct Supabase API access.

-- ==========================================
-- Hypotheses (via Prisma)
-- ==========================================
ALTER TABLE hypotheses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own hypotheses" ON hypotheses 
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Roadmap (via Prisma)
-- ==========================================
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own roadmap" ON roadmap_items 
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- GTM (via Prisma)
-- ==========================================
ALTER TABLE gtm_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own gtm" ON gtm_strategies 
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Lean Canvas (via Prisma)
-- ==========================================
ALTER TABLE canvas_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own canvas" ON canvas_sections 
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- AI Settings (via Prisma)
-- ==========================================
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own ai settings" ON ai_settings 
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Journal / Mood Entries (via Prisma)
-- ==========================================
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own mood entries" ON mood_entries 
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- User Encryption Keys
-- ==========================================
ALTER TABLE user_encryption_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own encryption key" ON user_encryption_keys 
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Streaks
-- ==========================================
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own streaks" ON streaks 
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Monthly Finances
-- ==========================================
ALTER TABLE monthly_finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own monthly finances" ON monthly_finances 
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Users table (limited — users can only see/update their own row)
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON users 
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users 
    FOR UPDATE USING (auth.uid() = id);

-- Note: Prisma (service_role) bypasses these policies.
-- These RLS policies protect against direct Supabase API access (PostgREST anon key).