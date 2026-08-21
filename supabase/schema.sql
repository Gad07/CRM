-- ===================================================
-- CRM ADAPTABLE & EDITABLE EN ETAPAS - ESQUEMA SUPABASE
-- Execute this script in your Supabase SQL Editor
-- ===================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PIPELINES (Embudos de venta)
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  industry_preset TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PIPELINE STAGES (Etapas editables de cada embudo)
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  order_index INT NOT NULL DEFAULT 0,
  win_probability INT DEFAULT 50, -- Porcentaje 0 - 100%
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPANIES (Empresas del directorio)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  size TEXT,
  address TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONTACTS (Contactos principales)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DEALS / LEADS (Negocios en el pipeline)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  value NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  expected_close_date DATE,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  order_index INT DEFAULT 0,
  status TEXT CHECK (status IN ('open', 'won', 'lost')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CUSTOM FIELD DEFINITIONS (Definiciones de campos adaptables por empresa)
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT CHECK (entity_type IN ('deal', 'contact', 'company')) NOT NULL,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT CHECK (field_type IN ('text', 'number', 'select', 'date', 'boolean')) NOT NULL,
  options JSONB DEFAULT '[]'::jsonb, -- Para listas desplegables
  required BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACTIVITIES / TASKS (Agenda y seguimiento)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('call', 'meeting', 'email', 'task', 'note')) NOT NULL DEFAULT 'task',
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies - Enable public access for initial dev/demo or configure auth
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on pipelines" ON pipelines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on pipeline_stages" ON pipeline_stages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on deals" ON deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on custom_field_definitions" ON custom_field_definitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on activities" ON activities FOR ALL USING (true) WITH CHECK (true);

-- INDICES PARA ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_stages_pipeline ON pipeline_stages(pipeline_id, order_index);
