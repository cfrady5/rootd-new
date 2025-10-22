-- Director Dashboard RPC Functions
-- Created: 2025-10-21

-- =============================================
-- 1. org_deal_status_breakdown
-- Returns count and total payout by status for an org
-- =============================================
CREATE OR REPLACE FUNCTION org_deal_status_breakdown(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  status TEXT,
  deal_count BIGINT,
  total_payout NUMERIC
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
    df.status,
    COUNT(df.id)::BIGINT as deal_count,
    COALESCE(SUM(df.payout_amount), 0)::NUMERIC as total_payout
  FROM deal_fact df
  WHERE df.org_id = p_org_id
    AND (p_start_date IS NULL OR df.created_at >= p_start_date)
    AND (p_end_date IS NULL OR df.created_at <= p_end_date)
  GROUP BY df.status
  ORDER BY deal_count DESC;
END;
$$;

-- =============================================
-- 2. org_stage_age_days
-- Returns average age in days by stage/status
-- =============================================
CREATE OR REPLACE FUNCTION org_stage_age_days(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  status TEXT,
  avg_age_days NUMERIC,
  min_age_days INTEGER,
  max_age_days INTEGER,
  deal_count BIGINT
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
    df.status,
    ROUND(AVG(df.age_days), 2)::NUMERIC as avg_age_days,
    MIN(df.age_days)::INTEGER as min_age_days,
    MAX(df.age_days)::INTEGER as max_age_days,
    COUNT(df.id)::BIGINT as deal_count
  FROM deal_fact df
  WHERE df.org_id = p_org_id
    AND (p_start_date IS NULL OR df.created_at >= p_start_date)
    AND (p_end_date IS NULL OR df.created_at <= p_end_date)
  GROUP BY df.status
  ORDER BY avg_age_days DESC;
END;
$$;

-- =============================================
-- 3. org_money_summary
-- Returns financial summary metrics
-- =============================================
CREATE OR REPLACE FUNCTION org_money_summary(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_payout_committed NUMERIC,
  total_paid_to_date NUMERIC,
  total_remaining NUMERIC,
  avg_deal_size NUMERIC,
  active_deals_count BIGINT,
  completed_deals_count BIGINT
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
    COALESCE(SUM(df.payout_amount), 0)::NUMERIC as total_payout_committed,
    COALESCE(SUM(df.paid_to_date), 0)::NUMERIC as total_paid_to_date,
    COALESCE(SUM(df.payout_amount - df.paid_to_date), 0)::NUMERIC as total_remaining,
    COALESCE(AVG(df.payout_amount), 0)::NUMERIC as avg_deal_size,
    COUNT(CASE WHEN df.status = 'active' THEN 1 END)::BIGINT as active_deals_count,
    COUNT(CASE WHEN df.status = 'completed' THEN 1 END)::BIGINT as completed_deals_count
  FROM deal_fact df
  WHERE df.org_id = p_org_id
    AND (p_start_date IS NULL OR df.created_at >= p_start_date)
    AND (p_end_date IS NULL OR df.created_at <= p_end_date);
END;
$$;

-- =============================================
-- 4. org_compliance_summary
-- Returns compliance metrics and violations
-- =============================================
CREATE OR REPLACE FUNCTION org_compliance_summary(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  compliance_status TEXT,
  deal_count BIGINT,
  percentage NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_count BIGINT;
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

  -- Get total count for percentage calculation
  SELECT COUNT(*) INTO v_total_count
  FROM deal_fact df
  WHERE df.org_id = p_org_id
    AND df.compliance_status IS NOT NULL
    AND (p_start_date IS NULL OR df.created_at >= p_start_date)
    AND (p_end_date IS NULL OR df.created_at <= p_end_date);

  IF v_total_count = 0 THEN
    v_total_count := 1; -- Avoid division by zero
  END IF;

  RETURN QUERY
  SELECT 
    df.compliance_status,
    COUNT(df.id)::BIGINT as deal_count,
    ROUND((COUNT(df.id)::NUMERIC / v_total_count::NUMERIC) * 100, 2) as percentage
  FROM deal_fact df
  WHERE df.org_id = p_org_id
    AND df.compliance_status IS NOT NULL
    AND (p_start_date IS NULL OR df.created_at >= p_start_date)
    AND (p_end_date IS NULL OR df.created_at <= p_end_date)
  GROUP BY df.compliance_status
  ORDER BY 
    CASE df.compliance_status
      WHEN 'violation' THEN 1
      WHEN 'warning' THEN 2
      WHEN 'compliant' THEN 3
      ELSE 4
    END;
END;
$$;

-- =============================================
-- 5. org_deals_per_week
-- Returns deal creation count per week
-- =============================================
CREATE OR REPLACE FUNCTION org_deals_per_week(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  week_start DATE,
  deal_count BIGINT,
  total_payout NUMERIC
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
    DATE_TRUNC('week', df.created_at)::DATE as week_start,
    COUNT(df.id)::BIGINT as deal_count,
    COALESCE(SUM(df.payout_amount), 0)::NUMERIC as total_payout
  FROM deal_fact df
  WHERE df.org_id = p_org_id
    AND (p_start_date IS NULL OR df.created_at >= p_start_date)
    AND (p_end_date IS NULL OR df.created_at <= p_end_date)
  GROUP BY DATE_TRUNC('week', df.created_at)
  ORDER BY week_start DESC
  LIMIT 12; -- Last 12 weeks
END;
$$;

-- =============================================
-- 6. org_committed_vs_paid_timeline
-- Returns committed vs paid over time for line chart
-- =============================================
CREATE OR REPLACE FUNCTION org_committed_vs_paid_timeline(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  period DATE,
  cumulative_committed NUMERIC,
  cumulative_paid NUMERIC
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
  WITH daily_totals AS (
    SELECT 
      df.created_at::DATE as deal_date,
      SUM(df.payout_amount) as daily_committed,
      SUM(df.paid_to_date) as daily_paid
    FROM deal_fact df
    WHERE df.org_id = p_org_id
      AND (p_start_date IS NULL OR df.created_at >= p_start_date)
      AND (p_end_date IS NULL OR df.created_at <= p_end_date)
    GROUP BY df.created_at::DATE
  )
  SELECT 
    deal_date as period,
    SUM(daily_committed) OVER (ORDER BY deal_date)::NUMERIC as cumulative_committed,
    SUM(daily_paid) OVER (ORDER BY deal_date)::NUMERIC as cumulative_paid
  FROM daily_totals
  ORDER BY deal_date;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION org_deal_status_breakdown TO authenticated;
GRANT EXECUTE ON FUNCTION org_stage_age_days TO authenticated;
GRANT EXECUTE ON FUNCTION org_money_summary TO authenticated;
GRANT EXECUTE ON FUNCTION org_compliance_summary TO authenticated;
GRANT EXECUTE ON FUNCTION org_deals_per_week TO authenticated;
GRANT EXECUTE ON FUNCTION org_committed_vs_paid_timeline TO authenticated;

