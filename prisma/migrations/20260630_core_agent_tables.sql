-- Migration: Core Agent Tables (Hypotheses, Finances, GTM, CRM, Roadmap, Canvas)
-- À exécuter après le schema initial

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- HYPOTHESES (Module 6)
-- ==========================================
CREATE TYPE hypothesis_status AS ENUM ('draft', 'testing', 'validated', 'invalidated', 'pivoted');
CREATE TYPE hypothesis_risk AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE hypothesis_category AS ENUM ('problem', 'solution', 'channel', 'revenue', 'segment');

CREATE TABLE hypotheses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Formulation
    statement TEXT NOT NULL,
    category hypothesis_category NOT NULL,
    risk_level hypothesis_risk NOT NULL,
    
    -- Build phase
    test_method TEXT NOT NULL,
    success_criteria TEXT NOT NULL,
    deadline DATE,
    cost NUMERIC(10,2),
    
    -- Measure phase
    measure_notes TEXT,
    
    -- Learn phase
    status hypothesis_status DEFAULT 'draft',
    actual_result TEXT,
    learnings TEXT,
    next_action TEXT,
    
    -- Pivot tracking
    pivoted_from_id UUID REFERENCES hypotheses(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hypotheses_user ON hypotheses(user_id);
CREATE INDEX idx_hypotheses_status ON hypotheses(user_id, status);

-- ==========================================
-- FINANCES (Module 7)
-- ==========================================
CREATE TYPE expense_category AS ENUM (
    'Infrastructure', 
    'API IA', 
    'Auth & Data', 
    'Observabilité', 
    'Email', 
    'Outils SaaS', 
    'Marketing', 
    'Divers'
);
CREATE TYPE expense_frequency AS ENUM ('monthly', 'annual', 'one-time');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TABLE monthly_finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- "YYYY-MM"
    revenue NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, month)
);

CREATE TABLE finance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    monthly_finance_id UUID NOT NULL REFERENCES monthly_finances(id) ON DELETE CASCADE,
    
    label TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    category expense_category NOT NULL,
    frequency expense_frequency DEFAULT 'monthly',
    type transaction_type NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE finance_one_time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    label TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL, -- Positif = revenu, Négatif = dépense
    category TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE finance_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    target_mrr NUMERIC(12,2) DEFAULT 0,
    first_revenue_date DATE,
    first_revenue_amount NUMERIC(12,2),
    cash_available NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_monthly_finances_user ON monthly_finances(user_id);
CREATE INDEX idx_finance_entries_user ON finance_entries(user_id);
CREATE INDEX idx_finance_one_time_user ON finance_one_time_entries(user_id);

-- ==========================================
-- GTM STRATEGY (Go-To-Market)
-- ==========================================
CREATE TABLE gtm_strategies (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- StoryBrand
    sb_hero TEXT,
    sb_problem TEXT,
    sb_guide TEXT,
    
    -- Obviously Awesome
    oa_alternatives TEXT,
    oa_unique_attributes TEXT,
    oa_value TEXT,
    
    -- 1-Page Marketing Plan
    omp_target TEXT,
    omp_message TEXT,
    omp_media TEXT,
    
    -- Cold Start Problem
    cs_atomic_network TEXT,
    
    -- Online Writing / Build in Public
    ow_cadence TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CRM LITE (Module 11)
-- ==========================================
CREATE TYPE contact_type AS ENUM ('candidat', 'entreprise', 'investisseur', 'école');
CREATE TYPE contact_status AS ENUM ('À contacter', 'En discussion', 'Qualifié', 'Client', 'Perdu');

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type contact_type,
    role TEXT,
    company TEXT,
    email TEXT,
    linkedin TEXT,
    status contact_status DEFAULT 'À contacter',
    last_contact_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_action_date DATE,
    next_action_label TEXT,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_status ON contacts(user_id, status);

-- ==========================================
-- ROADMAP
-- ==========================================
CREATE TYPE roadmap_status AS ENUM ('todo', 'doing', 'done');
CREATE TYPE roadmap_priority AS ENUM ('high', 'medium', 'low');

CREATE TABLE roadmap_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status roadmap_status DEFAULT 'todo',
    priority roadmap_priority DEFAULT 'medium',
    week VARCHAR(10), -- ex: "S7"
    start_date DATE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roadmap_user ON roadmap_items(user_id);
CREATE INDEX idx_roadmap_status ON roadmap_items(user_id, status);

-- ==========================================
-- LEAN CANVAS
-- ==========================================
CREATE TYPE canvas_section AS ENUM (
    'problem', 'solution', 'keyMetrics', 'uvp', 
    'unfairAdvantage', 'channels', 'customerSegments', 
    'costStructure', 'revenueStreams'
);

CREATE TABLE lean_canvas_sections (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    section_id canvas_section NOT NULL,
    content TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (user_id, section_id)
);

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Hypotheses
ALTER TABLE hypotheses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own hypotheses" ON hypotheses FOR ALL USING (auth.uid() = user_id);

-- Monthly Finances
ALTER TABLE monthly_finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own monthly finances" ON monthly_finances FOR ALL USING (auth.uid() = user_id);

-- Finance Entries
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own finance entries" ON finance_entries FOR ALL USING (auth.uid() = user_id);

-- Finance One-time
ALTER TABLE finance_one_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own one-time entries" ON finance_one_time_entries FOR ALL USING (auth.uid() = user_id);

-- Finance Settings
ALTER TABLE finance_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own finance settings" ON finance_settings FOR ALL USING (auth.uid() = user_id);

-- GTM
ALTER TABLE gtm_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own GTM" ON gtm_strategies FOR ALL USING (auth.uid() = user_id);

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);

-- Roadmap
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own roadmap" ON roadmap_items FOR ALL USING (auth.uid() = user_id);

-- Canvas
ALTER TABLE lean_canvas_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own canvas" ON lean_canvas_sections FOR ALL USING (auth.uid() = user_id);