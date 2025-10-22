-- Director Dashboard Tables and RLS Policies
-- Created: 2025-10-21

-- =============================================
-- 1. Organizations Table (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. Add org_id and role to profiles FIRST (before RLS policies)
-- =============================================
DO $$ 
BEGIN
  -- Add org_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'org_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN org_id UUID REFERENCES organizations(id);
  END IF;
  
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'athlete';
  END IF;
END $$;

-- Add constraint separately (in case column already exists but constraint doesn't)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'profiles' 
    AND constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
      CHECK (role IN ('athlete', 'director', 'admin'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =============================================
-- 3. Org Daily Metrics Table
-- =============================================
CREATE TABLE IF NOT EXISTS org_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_deals INTEGER DEFAULT 0,
  active_deals INTEGER DEFAULT 0,
  completed_deals INTEGER DEFAULT 0,
  total_payout_committed NUMERIC(10, 2) DEFAULT 0,
  total_paid_to_date NUMERIC(10, 2) DEFAULT 0,
  open_violations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, metric_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_daily_metrics_org_id ON org_daily_metrics(org_id);
CREATE INDEX IF NOT EXISTS idx_org_daily_metrics_date ON org_daily_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_org_daily_metrics_org_date ON org_daily_metrics(org_id, metric_date DESC);

-- RLS Policies
ALTER TABLE org_daily_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_daily_metrics_select_policy" ON org_daily_metrics;
CREATE POLICY "org_daily_metrics_select_policy" ON org_daily_metrics
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('director', 'admin')
    )
  );

DROP POLICY IF EXISTS "org_daily_metrics_insert_policy" ON org_daily_metrics;
CREATE POLICY "org_daily_metrics_insert_policy" ON org_daily_metrics
  FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('admin')
    )
  );

DROP POLICY IF EXISTS "org_daily_metrics_update_policy" ON org_daily_metrics;
CREATE POLICY "org_daily_metrics_update_policy" ON org_daily_metrics
  FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('admin')
    )
  );

-- =============================================
-- 4. Deal Fact Table
-- =============================================
CREATE TABLE IF NOT EXISTS deal_fact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_name TEXT NOT NULL,
  athlete_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  athlete_name TEXT,
  brand_id UUID,
  brand_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'proposed', 'negotiating', 'active', 'completed', 'cancelled')),
  payout_amount NUMERIC(10, 2) DEFAULT 0,
  paid_to_date NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  stage TEXT,
  age_days INTEGER,
  compliance_status TEXT CHECK (compliance_status IN ('compliant', 'warning', 'violation', null)),
  compliance_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_fact_org_id ON deal_fact(org_id);
CREATE INDEX IF NOT EXISTS idx_deal_fact_athlete_id ON deal_fact(athlete_id);
CREATE INDEX IF NOT EXISTS idx_deal_fact_brand_id ON deal_fact(brand_id);
CREATE INDEX IF NOT EXISTS idx_deal_fact_status ON deal_fact(status);
CREATE INDEX IF NOT EXISTS idx_deal_fact_created_at ON deal_fact(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_fact_org_status ON deal_fact(org_id, status);
CREATE INDEX IF NOT EXISTS idx_deal_fact_org_created ON deal_fact(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_fact_compliance ON deal_fact(compliance_status) WHERE compliance_status IS NOT NULL;

-- RLS Policies
ALTER TABLE deal_fact ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deal_fact_select_policy" ON deal_fact;
CREATE POLICY "deal_fact_select_policy" ON deal_fact
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('director', 'admin')
    )
  );

DROP POLICY IF EXISTS "deal_fact_insert_policy" ON deal_fact;
CREATE POLICY "deal_fact_insert_policy" ON deal_fact
  FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('director', 'admin')
    )
  );

DROP POLICY IF EXISTS "deal_fact_update_policy" ON deal_fact;
CREATE POLICY "deal_fact_update_policy" ON deal_fact
  FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('director', 'admin')
    )
  );

DROP POLICY IF EXISTS "deal_fact_delete_policy" ON deal_fact;
CREATE POLICY "deal_fact_delete_policy" ON deal_fact
  FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') = 'admin'
    )
  );

-- =============================================
-- 5. Triggers for automatic updates
-- =============================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to calculate age_days for deal_fact
CREATE OR REPLACE FUNCTION calculate_deal_age_days()
RETURNS TRIGGER AS $$
BEGIN
  NEW.age_days = EXTRACT(DAY FROM (COALESCE(NEW.completed_at, NOW()) - NEW.created_at))::INTEGER;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at to org_daily_metrics
CREATE TRIGGER update_org_daily_metrics_updated_at
  BEFORE UPDATE ON org_daily_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply update_updated_at to deal_fact
CREATE TRIGGER update_deal_fact_updated_at
  BEFORE UPDATE ON deal_fact
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply calculate_deal_age_days to deal_fact on INSERT and UPDATE
DROP TRIGGER IF EXISTS calculate_deal_age_days_trigger ON deal_fact;
CREATE TRIGGER calculate_deal_age_days_trigger
  BEFORE INSERT OR UPDATE ON deal_fact
  FOR EACH ROW
  EXECUTE FUNCTION calculate_deal_age_days();

-- =============================================
-- 6. Sample Data (for testing)
-- =============================================
-- Create sample organization
INSERT INTO organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Sample University')
ON CONFLICT (id) DO NOTHING;

-- Create sample deals
INSERT INTO deal_fact (org_id, deal_name, athlete_name, brand_name, status, payout_amount, paid_to_date, compliance_status, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Nike Partnership Q1', 'John Athlete', 'Nike', 'active', 5000.00, 2500.00, 'compliant', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000001', 'Gatorade Sponsorship', 'Jane Player', 'Gatorade', 'active', 3000.00, 3000.00, 'compliant', NOW() - INTERVAL '60 days'),
  ('00000000-0000-0000-0000-000000000001', 'Local Gym Deal', 'Mike Runner', 'City Fitness', 'completed', 1000.00, 1000.00, 'compliant', NOW() - INTERVAL '90 days'),
  ('00000000-0000-0000-0000-000000000001', 'Restaurant Promo', 'Sarah Swift', 'Campus Eats', 'negotiating', 2000.00, 0.00, null, NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000001', 'Apparel Deal', 'Tom Jump', 'Sports Gear Co', 'proposed', 4000.00, 0.00, null, NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000001', 'Social Media Campaign', 'Lisa Fast', 'Energy Drink Brand', 'active', 2500.00, 1000.00, 'warning', NOW() - INTERVAL '45 days')
ON CONFLICT DO NOTHING;
