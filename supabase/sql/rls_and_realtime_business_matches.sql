-- Enable RLS and policies for business_matches and quiz_responses
-- Run this in your Supabase SQL editor for the same project your app points to.

-- business_matches: secure per-athlete access
ALTER TABLE public.business_matches ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS policies for business_matches
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_matches' AND policyname='Select own business_matches'
  ) THEN
    CREATE POLICY "Select own business_matches" ON public.business_matches
      FOR SELECT USING (auth.uid() = athlete_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_matches' AND policyname='Update own business_matches'
  ) THEN
    CREATE POLICY "Update own business_matches" ON public.business_matches
      FOR UPDATE USING (auth.uid() = athlete_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_matches' AND policyname='Insert own business_matches'
  ) THEN
    CREATE POLICY "Insert own business_matches" ON public.business_matches
      FOR INSERT WITH CHECK (auth.uid() = athlete_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='business_matches' AND policyname='Delete own business_matches'
  ) THEN
    CREATE POLICY "Delete own business_matches" ON public.business_matches
      FOR DELETE USING (auth.uid() = athlete_id);
  END IF;
END$$;

-- Add table to Realtime publication so postgres_changes works
DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.business_matches';
EXCEPTION WHEN others THEN
  -- ignore if already added
  NULL;
END$$;

-- quiz_responses: allow users to read their own latest quiz (by user_id or athlete_id)
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='quiz_responses' AND policyname='Select own quiz_responses'
  ) THEN
    CREATE POLICY "Select own quiz_responses" ON public.quiz_responses
      FOR SELECT USING (auth.uid() = user_id OR auth.uid() = athlete_id);
  END IF;
END$$;
