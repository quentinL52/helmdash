-- Migration: Initial Schema for AIRH FounderOS (CRM, Content, Finances)
-- Prepared based on the Phase 1 cleanup and Phase 2 requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CRM
-- ==========================================
CREATE TYPE contact_type AS ENUM ('candidat', 'entreprise', 'investisseur', 'école');
CREATE TYPE contact_status AS ENUM ('À contacter', 'En discussion', 'Qualifié', 'Client', 'Perdu');

CREATE TABLE crm_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type contact_type,
    role TEXT,
    company TEXT,
    email TEXT,
    linkedin TEXT,
    status contact_status DEFAULT 'À contacter',
    last_contact_date DATE,
    next_action_date DATE,
    next_action_label TEXT,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CONTENT PIPELINE
-- ==========================================
CREATE TYPE content_channel AS ENUM ('LinkedIn', 'Article', 'Newsletter', 'Thread');
CREATE TYPE content_status AS ENUM ('idea', 'draft', 'scheduled', 'published');

CREATE TABLE content_pipeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    channel content_channel,
    status content_status DEFAULT 'idea',
    publication_date TIMESTAMPTZ,
    draft_url TEXT,
    image_url TEXT,
    content_body TEXT, -- Pour lire la totalité du contenu
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- FINANCES
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

CREATE TABLE finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL, -- Positif = Revenu, Négatif = Dépense
    type TEXT CHECK (type IN ('income', 'expense')),
    category expense_category,
    is_recurring BOOLEAN DEFAULT FALSE,
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings / Configuration pour les Finances (Break-even, Premier Revenu)
CREATE TABLE finance_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    target_mrr NUMERIC(12,2) DEFAULT 0,
    first_revenue_date DATE,
    first_revenue_amount NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies Setup
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own contacts" ON crm_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own content" ON content_pipeline FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own transactions" ON finance_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own finance settings" ON finance_settings FOR ALL USING (auth.uid() = user_id);
