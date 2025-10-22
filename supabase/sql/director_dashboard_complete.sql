-- Complete Director Dashboard Schema
-- Created: 2025-10-21
-- Extends existing director_dashboard_tables.sql with full feature set

-- =============================================
-- SECTION 1: Core Organization Tables
-- =============================================

-- Extend organizations table if needed (already exists from previous migration)
-- ALTER TABLE organizations ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Organization members and roles
CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'director', 'staff', 'viewer')),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON org_members(user_id);

-- =============================================
-- SECTION 2: Extended Deal Tables
-- =============================================

-- Deal messages (deal-scoped communication)
CREATE TABLE IF NOT EXISTS deal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deal_messages_deal_id ON deal_messages(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_messages_org_id ON deal_messages(org_id);

-- Deal tasks and workflow
CREATE TABLE IF NOT EXISTS deal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('approval', 'compliance_check', 'payment', 'document', 'follow_up', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assignee_id UUID REFERENCES profiles(id),
  assignee_name TEXT,
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deal_tasks_deal_id ON deal_tasks(deal_id, status);
CREATE INDEX IF NOT EXISTS idx_deal_tasks_org_id ON deal_tasks(org_id, due_at);
CREATE INDEX IF NOT EXISTS idx_deal_tasks_assignee ON deal_tasks(assignee_id, status);

-- =============================================
-- SECTION 3: System Tables
-- =============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deal_update', 'message', 'task_assigned', 'compliance_alert', 'payment', 'system')),
  title TEXT NOT NULL,
  message TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON audit_log(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_subject ON audit_log(subject_type, subject_id);

-- User insights (dismissible insights)
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  insight_key TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, insight_key)
);

CREATE INDEX IF NOT EXISTS idx_user_insights_user_id ON user_insights(user_id, dismissed_at);

-- Scheduled reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('deals', 'compliance', 'finance', 'full')),
  recipients TEXT[] NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT true,
  filters JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_org_id ON scheduled_reports(org_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run_at) WHERE enabled = true;

-- Athlete compliance profiles
CREATE TABLE IF NOT EXISTS athlete_compliance_profiles (
  athlete_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  disclosure_training_completed BOOLEAN DEFAULT false,
  disclosure_training_date TIMESTAMPTZ,
  kyc_verified BOOLEAN DEFAULT false,
  kyc_verified_date TIMESTAMPTZ,
  tax_docs_submitted BOOLEAN DEFAULT false,
  tax_docs_date TIMESTAMPTZ,
  quiz_completed BOOLEAN DEFAULT false,
  quiz_completed_date TIMESTAMPTZ,
  overall_status TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN disclosure_training_completed AND kyc_verified AND tax_docs_submitted AND quiz_completed THEN 'ready'
      WHEN disclosure_training_completed OR kyc_verified OR tax_docs_submitted OR quiz_completed THEN 'partial'
      ELSE 'pending'
    END
  ) STORED,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_compliance_org_id ON athlete_compliance_profiles(org_id, overall_status);

-- =============================================
-- SECTION 4: RLS Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_compliance_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (wrapped in DO block to handle errors gracefully)
DO $$ 
BEGIN
  -- Drop org_members policies
  DROP POLICY IF EXISTS "Users can view org members in their org" ON org_members;
  DROP POLICY IF EXISTS "Directors can manage org members" ON org_members;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Drop deal_messages policies
  DROP POLICY IF EXISTS "Users can view messages in their org deals" ON deal_messages;
  DROP POLICY IF EXISTS "Users can create messages in their org deals" ON deal_messages;
  DROP POLICY IF EXISTS "Authors can update their own messages" ON deal_messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Drop deal_tasks policies
  DROP POLICY IF EXISTS "Users can view tasks in their org" ON deal_tasks;
  DROP POLICY IF EXISTS "Directors can manage tasks" ON deal_tasks;
  DROP POLICY IF EXISTS "Assignees can update their tasks" ON deal_tasks;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Drop notifications policies
  DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Drop audit_log policies
  DROP POLICY IF EXISTS "Directors can view audit logs for their org" ON audit_log;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Drop user_insights policies
  DROP POLICY IF EXISTS "Users can manage their own insights" ON user_insights;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Drop scheduled_reports policies
  DROP POLICY IF EXISTS "Directors can manage scheduled reports" ON scheduled_reports;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Drop athlete_compliance_profiles policies
  DROP POLICY IF EXISTS "Athletes can view their own profile" ON athlete_compliance_profiles;
  DROP POLICY IF EXISTS "Directors can view profiles in their org" ON athlete_compliance_profiles;
  DROP POLICY IF EXISTS "Directors can manage profiles in their org" ON athlete_compliance_profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- org_members policies
CREATE POLICY "Users can view org members in their org" ON org_members
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Directors can manage org members" ON org_members
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('director', 'admin')
    )
  );

-- deal_messages policies
CREATE POLICY "Users can view messages in their org deals" ON deal_messages
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create messages in their org deals" ON deal_messages
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    AND author_id = auth.uid()
  );

CREATE POLICY "Authors can update their own messages" ON deal_messages
  FOR UPDATE USING (author_id = auth.uid());

-- deal_tasks policies
CREATE POLICY "Users can view tasks in their org" ON deal_tasks
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Directors can manage tasks" ON deal_tasks
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('director', 'admin')
    )
  );

CREATE POLICY "Assignees can update their tasks" ON deal_tasks
  FOR UPDATE USING (assignee_id = auth.uid());

-- notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- audit_log policies
CREATE POLICY "Directors can view audit logs for their org" ON audit_log
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('director', 'admin')
    )
  );

-- user_insights policies
CREATE POLICY "Users can manage their own insights" ON user_insights
  FOR ALL USING (user_id = auth.uid());

-- scheduled_reports policies
CREATE POLICY "Directors can manage scheduled reports" ON scheduled_reports
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('director', 'admin')
    )
  );

-- athlete_compliance_profiles policies
CREATE POLICY "Athletes can view their own profile" ON athlete_compliance_profiles
  FOR SELECT USING (athlete_id = auth.uid());

CREATE POLICY "Directors can view profiles in their org" ON athlete_compliance_profiles
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('director', 'admin')
    )
  );

CREATE POLICY "Directors can manage profiles in their org" ON athlete_compliance_profiles
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid() 
      AND COALESCE(role, 'athlete') IN ('director', 'admin')
    )
  );

-- =============================================
-- SECTION 5: Triggers
-- =============================================

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON org_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deal_messages_updated_at
  BEFORE UPDATE ON deal_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deal_tasks_updated_at
  BEFORE UPDATE ON deal_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON scheduled_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_athlete_compliance_updated_at
  BEFORE UPDATE ON athlete_compliance_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create notification on new message
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify deal participants (simplified - would need deal participants table)
  -- Only insert if notifications table exists and has proper structure
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'user_id'
  ) THEN
    INSERT INTO notifications (user_id, org_id, type, title, message, action_url)
    SELECT 
      p.id,
      NEW.org_id,
      'message',
      'New message on deal',
      NEW.author_name || ' posted a message',
      '/director/deals?id=' || NEW.deal_id
    FROM profiles p
    WHERE p.org_id = NEW.org_id
      AND p.id != NEW.author_id
      AND COALESCE(p.role, 'athlete') IN ('director', 'admin');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS notify_on_deal_message ON deal_messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create trigger
CREATE TRIGGER notify_on_deal_message
  AFTER INSERT ON deal_messages
  FOR EACH ROW EXECUTE FUNCTION notify_on_new_message();

-- =============================================
-- SECTION 6: Sample Data
-- =============================================

-- Note: Sample data insertion requires existing profiles with org_id set
-- Run these statements manually after setting up test users

-- Example: Insert sample org member
-- INSERT INTO org_members (user_id, org_id, role, joined_at)
-- SELECT 
--   p.id,
--   p.org_id,
--   COALESCE(p.role, 'director'),
--   NOW()
-- FROM profiles p
-- WHERE p.org_id IS NOT NULL
--   AND NOT EXISTS (
--     SELECT 1 FROM org_members om 
--     WHERE om.user_id = p.id AND om.org_id = p.org_id
--   );

-- Example: Insert sample compliance profiles
-- INSERT INTO athlete_compliance_profiles (athlete_id, org_id, disclosure_training_completed, kyc_verified, tax_docs_submitted, quiz_completed)
-- SELECT 
--   p.id,
--   p.org_id,
--   true,
--   true,
--   (random() > 0.3), -- 70% have tax docs
--   EXISTS(SELECT 1 FROM quiz_responses qr WHERE qr.athlete_id = p.id LIMIT 1)
-- FROM profiles p
-- WHERE p.org_id IS NOT NULL
--   AND NOT EXISTS (
--     SELECT 1 FROM athlete_compliance_profiles acp WHERE acp.athlete_id = p.id
--   )
-- ON CONFLICT (athlete_id) DO NOTHING;

COMMENT ON TABLE org_members IS 'Organization membership and roles';
COMMENT ON TABLE deal_messages IS 'Deal-scoped messages between participants';
COMMENT ON TABLE deal_tasks IS 'Tasks and workflow items for deals';
COMMENT ON TABLE notifications IS 'User notifications across the system';
COMMENT ON TABLE audit_log IS 'System-wide audit trail';
COMMENT ON TABLE scheduled_reports IS 'Automated report configurations';
COMMENT ON TABLE athlete_compliance_profiles IS 'Athlete readiness and compliance tracking';
