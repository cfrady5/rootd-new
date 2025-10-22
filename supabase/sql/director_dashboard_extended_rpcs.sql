-- Extended Director Dashboard RPC Functions
-- Created: 2025-10-21
-- Adds brand, athlete, compliance, and insights RPCs

-- =============================================
-- 7. org_brand_breakdown
-- Returns deal metrics grouped by brand
-- =============================================
CREATE OR REPLACE FUNCTION org_brand_breakdown(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  brand_id TEXT,
  brand_name TEXT,
  deal_count BIGINT,
  total_spend_cents BIGINT,
  avg_deal_cents NUMERIC,
  compliance_pass_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to this org
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND org_id = p_org_id 
    AND COALESCE(role, 'athlete') IN ('director', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to organization data';
  END IF;

  RETURN QUERY
  SELECT 
    df.brand_id,
    df.brand_name,
    COUNT(df.id)::BIGINT as deal_count,
    COALESCE(SUM(df.payout_amount * 100), 0)::BIGINT as total_spend_cents,
    COALESCE(AVG(df.payout_amount * 100), 0)::NUMERIC as avg_deal_cents,
    COALESCE(
      (COUNT(CASE WHEN df.compliance_status = 'compliant' THEN 1 END)::NUMERIC / 
       NULLIF(COUNT(df.id), 0)::NUMERIC) * 100, 
      0
    )::NUMERIC as compliance_pass_rate
  FROM deal_fact df
  WHERE df.org_id = p_org_id
    AND (p_start_date IS NULL OR df.created_at >= p_start_date)
    AND (p_end_date IS NULL OR df.created_at <= p_end_date)
  GROUP BY df.brand_id, df.brand_name
  ORDER BY total_spend_cents DESC;
END;
$$;

-- =============================================
-- 8. org_athlete_rollup
-- Returns athlete activity and earnings
-- =============================================
CREATE OR REPLACE FUNCTION org_athlete_rollup(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  athlete_id TEXT,
  athlete_name TEXT,
  active_deals BIGINT,
  total_earnings_cents BIGINT,
  compliance_status TEXT,
  quiz_completed BOOLEAN,
  readiness_status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to this org
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND org_id = p_org_id 
    AND COALESCE(role, 'athlete') IN ('director', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to organization data';
  END IF;

  RETURN QUERY
  SELECT 
    df.athlete_id,
    df.athlete_name,
    COUNT(CASE WHEN df.status = 'active' THEN 1 END)::BIGINT as active_deals,
    COALESCE(SUM(CASE WHEN df.status IN ('active', 'completed') THEN df.payout_amount * 100 ELSE 0 END), 0)::BIGINT as total_earnings_cents,
    COALESCE(
      CASE 
        WHEN COUNT(CASE WHEN df.compliance_status = 'violation' THEN 1 END) > 0 THEN 'violation'
        WHEN COUNT(CASE WHEN df.compliance_status = 'warning' THEN 1 END) > 0 THEN 'warning'
        ELSE 'compliant'
      END,
      'unknown'
    ) as compliance_status,
    EXISTS(SELECT 1 FROM quiz_responses qr WHERE qr.athlete_id::TEXT = df.athlete_id LIMIT 1) as quiz_completed,
    COALESCE(acp.overall_status, 'pending') as readiness_status
  FROM deal_fact df
  LEFT JOIN athlete_compliance_profiles acp ON acp.athlete_id::TEXT = df.athlete_id
  WHERE df.org_id = p_org_id
    AND (p_start_date IS NULL OR df.created_at >= p_start_date)
    AND (p_end_date IS NULL OR df.created_at <= p_end_date)
  GROUP BY df.athlete_id, df.athlete_name, acp.overall_status
  ORDER BY active_deals DESC, total_earnings_cents DESC;
END;
$$;

-- =============================================
-- 9. org_compliance_details
-- Returns detailed compliance violations
-- =============================================
CREATE OR REPLACE FUNCTION org_compliance_details(
  p_org_id UUID,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  deal_id UUID,
  deal_name TEXT,
  athlete_name TEXT,
  brand_name TEXT,
  compliance_status TEXT,
  compliance_notes TEXT,
  age_days INTEGER,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to this org
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND org_id = p_org_id 
    AND COALESCE(role, 'athlete') IN ('director', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to organization data';
  END IF;

  RETURN QUERY
  SELECT 
    df.id as deal_id,
    df.deal_name,
    df.athlete_name,
    df.brand_name,
    df.compliance_status,
    df.compliance_notes,
    df.age_days,
    df.created_at
  FROM deal_fact df
  WHERE df.org_id = p_org_id
    AND df.compliance_status IS NOT NULL
    AND (p_status IS NULL OR df.compliance_status = p_status)
  ORDER BY 
    CASE df.compliance_status
      WHEN 'violation' THEN 1
      WHEN 'warning' THEN 2
      ELSE 3
    END,
    df.age_days DESC;
END;
$$;

-- =============================================
-- 10. org_top_performers
-- Returns top performing athletes by earnings
-- =============================================
CREATE OR REPLACE FUNCTION org_top_performers(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  athlete_id TEXT,
  athlete_name TEXT,
  total_deals BIGINT,
  total_earnings_cents BIGINT,
  avg_deal_cents NUMERIC,
  compliance_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to this org
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND org_id = p_org_id 
    AND COALESCE(role, 'athlete') IN ('director', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to organization data';
  END IF;

  RETURN QUERY
  SELECT 
    df.athlete_id,
    df.athlete_name,
    COUNT(df.id)::BIGINT as total_deals,
    COALESCE(SUM(df.payout_amount * 100), 0)::BIGINT as total_earnings_cents,
    COALESCE(AVG(df.payout_amount * 100), 0)::NUMERIC as avg_deal_cents,
    COALESCE(
      (COUNT(CASE WHEN df.compliance_status = 'compliant' THEN 1 END)::NUMERIC / 
       NULLIF(COUNT(df.id), 0)::NUMERIC) * 100,
      0
    )::NUMERIC as compliance_rate
  FROM deal_fact df
  WHERE df.org_id = p_org_id
    AND (p_start_date IS NULL OR df.created_at >= p_start_date)
    AND (p_end_date IS NULL OR df.created_at <= p_end_date)
  GROUP BY df.athlete_id, df.athlete_name
  ORDER BY total_earnings_cents DESC
  LIMIT p_limit;
END;
$$;

-- =============================================
-- 11. org_deal_insights
-- Returns actionable insights based on deal data
-- =============================================
CREATE OR REPLACE FUNCTION org_deal_insights(
  p_org_id UUID
)
RETURNS TABLE (
  insight_key TEXT,
  insight_type TEXT,
  title TEXT,
  description TEXT,
  metric_value NUMERIC,
  severity TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg_approval_days NUMERIC;
  v_open_violations INTEGER;
  v_payment_lag_days NUMERIC;
  v_active_no_activity INTEGER;
BEGIN
  -- Verify user has access to this org
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND org_id = p_org_id 
    AND COALESCE(role, 'athlete') IN ('director', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to organization data';
  END IF;

  -- Calculate metrics
  SELECT AVG(age_days) INTO v_avg_approval_days
  FROM deal_fact
  WHERE org_id = p_org_id AND status = 'pending';

  SELECT COUNT(*) INTO v_open_violations
  FROM deal_fact
  WHERE org_id = p_org_id AND compliance_status = 'violation';

  SELECT AVG(age_days) INTO v_payment_lag_days
  FROM deal_fact
  WHERE org_id = p_org_id 
    AND status = 'completed' 
    AND (payout_amount - paid_to_date) > 0;

  SELECT COUNT(*) INTO v_active_no_activity
  FROM deal_fact df
  WHERE df.org_id = p_org_id 
    AND df.status = 'active'
    AND df.updated_at < NOW() - INTERVAL '14 days';

  -- Return insights
  IF v_avg_approval_days > 7 THEN
    RETURN QUERY SELECT 
      'approval_time'::TEXT,
      'performance'::TEXT,
      'Slow approval times'::TEXT,
      format('Average approval time is %s days. Consider earlier compliance review.', ROUND(v_avg_approval_days, 1))::TEXT,
      v_avg_approval_days,
      'warning'::TEXT;
  END IF;

  IF v_open_violations > 0 THEN
    RETURN QUERY SELECT 
      'open_violations'::TEXT,
      'compliance'::TEXT,
      'Open compliance violations'::TEXT,
      format('You have %s open compliance violations that need attention.', v_open_violations)::TEXT,
      v_open_violations::NUMERIC,
      'critical'::TEXT;
  END IF;

  IF v_payment_lag_days > 30 THEN
    RETURN QUERY SELECT 
      'payment_lag'::TEXT,
      'financial'::TEXT,
      'Payment delays'::TEXT,
      format('Average payment lag is %s days. Review payment processes.', ROUND(v_payment_lag_days, 1))::TEXT,
      v_payment_lag_days,
      'warning'::TEXT;
  END IF;

  IF v_active_no_activity > 0 THEN
    RETURN QUERY SELECT 
      'stale_deals'::TEXT,
      'workflow'::TEXT,
      'Stale active deals'::TEXT,
      format('%s active deals have had no activity in 14+ days.', v_active_no_activity)::TEXT,
      v_active_no_activity::NUMERIC,
      'info'::TEXT;
  END IF;

  -- If no insights, return a positive message
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      'all_clear'::TEXT,
      'performance'::TEXT,
      'Operations running smoothly'::TEXT,
      'No critical issues detected. Great work!'::TEXT,
      0::NUMERIC,
      'success'::TEXT;
  END IF;
END;
$$;

-- =============================================
-- 12. org_deal_messages_for_deal
-- Returns messages for a specific deal
-- =============================================
CREATE OR REPLACE FUNCTION org_deal_messages_for_deal(
  p_deal_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  author_name TEXT,
  content TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get org_id for the deal and verify access
  SELECT dm.org_id INTO v_org_id
  FROM deal_messages dm
  WHERE dm.deal_id = p_deal_id
  LIMIT 1;

  IF v_org_id IS NULL THEN
    -- Try to get from deal_fact
    SELECT df.org_id INTO v_org_id
    FROM deal_fact df
    WHERE df.id = p_deal_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND org_id = v_org_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to deal messages';
  END IF;

  RETURN QUERY
  SELECT 
    dm.id,
    dm.author_id,
    dm.author_name,
    dm.content,
    dm.attachments,
    dm.created_at,
    dm.updated_at
  FROM deal_messages dm
  WHERE dm.deal_id = p_deal_id
    AND dm.deleted_at IS NULL
  ORDER BY dm.created_at DESC
  LIMIT p_limit;
END;
$$;

-- =============================================
-- 13. org_deal_tasks_for_deal
-- Returns tasks for a specific deal
-- =============================================
CREATE OR REPLACE FUNCTION org_deal_tasks_for_deal(
  p_deal_id UUID
)
RETURNS TABLE (
  id UUID,
  kind TEXT,
  title TEXT,
  description TEXT,
  status TEXT,
  assignee_id UUID,
  assignee_name TEXT,
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_overdue BOOLEAN,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get org_id for the deal and verify access
  SELECT dt.org_id INTO v_org_id
  FROM deal_tasks dt
  WHERE dt.deal_id = p_deal_id
  LIMIT 1;

  IF v_org_id IS NULL THEN
    -- Try to get from deal_fact
    SELECT df.org_id INTO v_org_id
    FROM deal_fact df
    WHERE df.id = p_deal_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND org_id = v_org_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to deal tasks';
  END IF;

  RETURN QUERY
  SELECT 
    dt.id,
    dt.kind,
    dt.title,
    dt.description,
    dt.status,
    dt.assignee_id,
    dt.assignee_name,
    dt.due_at,
    dt.completed_at,
    (dt.due_at < NOW() AND dt.status != 'completed')::BOOLEAN as is_overdue,
    dt.created_at
  FROM deal_tasks dt
  WHERE dt.deal_id = p_deal_id
  ORDER BY 
    CASE 
      WHEN dt.status = 'pending' THEN 1
      WHEN dt.status = 'in_progress' THEN 2
      WHEN dt.status = 'completed' THEN 3
      ELSE 4
    END,
    dt.due_at NULLS LAST,
    dt.created_at DESC;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION org_brand_breakdown TO authenticated;
GRANT EXECUTE ON FUNCTION org_athlete_rollup TO authenticated;
GRANT EXECUTE ON FUNCTION org_compliance_details TO authenticated;
GRANT EXECUTE ON FUNCTION org_top_performers TO authenticated;
GRANT EXECUTE ON FUNCTION org_deal_insights TO authenticated;
GRANT EXECUTE ON FUNCTION org_deal_messages_for_deal TO authenticated;
GRANT EXECUTE ON FUNCTION org_deal_tasks_for_deal TO authenticated;
