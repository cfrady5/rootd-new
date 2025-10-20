-- Migration: init_tables.sql
-- Run this in your Supabase SQL editor (make sure you're in the correct project)

-- enable gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Minimal profiles table (used by auth and FKs)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns to profiles table
DO $$
BEGIN
  -- Basic profile fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='school'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN school text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='sport'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN sport text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='location'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN location text;
  END IF;
  -- Social media follower counts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='instagram'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN instagram integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='tiktok'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN tiktok integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='youtube'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN youtube integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='x'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN x integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='linkedin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN linkedin integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='facebook'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN facebook integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='total_followers'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN total_followers integer DEFAULT 0;
  END IF;
END$$;

-- Ensure quiz_responses exists and has the 'answers' column used by older clients
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers jsonb,
  version int DEFAULT 1,
  model_version text,
  normalized jsonb,
  components jsonb,
  rootd_score numeric,
  created_at timestamptz DEFAULT now()
);

-- Add answers column if table already exists but is missing it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='quiz_responses' AND column_name='answers'
  ) THEN
    ALTER TABLE public.quiz_responses ADD COLUMN answers jsonb;
  END IF;
END$$;

-- Ensure common location and meta columns exist (lat/lng, preferred_radius_miles, athlete_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='quiz_responses' AND column_name='lat'
  ) THEN
    ALTER TABLE public.quiz_responses ADD COLUMN lat double precision;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='quiz_responses' AND column_name='lng'
  ) THEN
    ALTER TABLE public.quiz_responses ADD COLUMN lng double precision;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='quiz_responses' AND column_name='preferred_radius_miles'
  ) THEN
    ALTER TABLE public.quiz_responses ADD COLUMN preferred_radius_miles numeric;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='quiz_responses' AND column_name='athlete_id'
  ) THEN
    ALTER TABLE public.quiz_responses ADD COLUMN athlete_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Ensure 'school' and 'sport' columns exist (used in normalized payload)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='quiz_responses' AND column_name='school'
  ) THEN
    ALTER TABLE public.quiz_responses ADD COLUMN school text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='quiz_responses' AND column_name='sport'
  ) THEN
    ALTER TABLE public.quiz_responses ADD COLUMN sport text;
  END IF;
END$$;

-- Ensure 'user_id' column exists (some function versions write user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='quiz_responses' AND column_name='user_id'
  ) THEN
    ALTER TABLE public.quiz_responses ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END$$;

-- business_matches table used by process-quiz upserts
CREATE TABLE IF NOT EXISTS public.business_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_place_id text,
  source text,
  name text,
  category text,
  address text,
  city text,
  website text,
  business_rating numeric,
  types jsonb,
  match_score numeric,
  reason text,
  is_verified boolean,
  distance_meters numeric,
  photo_url text,
  rootd_biz_score numeric,
  score_components jsonb,
  normalized jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE (athlete_id, business_place_id)
);

-- End of migration

-- Additional app tables (conservative schemas)
CREATE TABLE IF NOT EXISTS public.athlete_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  avatar_url text,
  school text,
  sport text,
  preferred_radius numeric,
  availability text,
  compensation text,
  rootd_score numeric,
  completion_percent int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  title text,
  type text,
  date text,
  link text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  business_name text,
  value text,
  stage text,
  last_activity timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid,
  athlete_id uuid REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  business_name text,
  body text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  title text,
  done boolean DEFAULT false,
  due date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  title text,
  body text,
  read boolean DEFAULT false,
  type text,
  created_at timestamptz DEFAULT now()
);

-- Social media accounts table
CREATE TABLE IF NOT EXISTS public.socials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  username text NOT NULL,
  followers integer DEFAULT 0,
  following integer DEFAULT 0,
  posts integer DEFAULT 0,
  engagement_rate decimal DEFAULT 0,
  connected_at timestamptz DEFAULT now(),
  last_refreshed timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable row level security
ALTER TABLE public.socials ENABLE ROW LEVEL SECURITY;

-- RLS policies for socials (idempotent via pg_policies checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'socials' AND policyname = 'Users can view own socials'
  ) THEN
    CREATE POLICY "Users can view own socials" ON public.socials
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'socials' AND policyname = 'Users can insert own socials'
  ) THEN
    CREATE POLICY "Users can insert own socials" ON public.socials
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'socials' AND policyname = 'Users can update own socials'
  ) THEN
    CREATE POLICY "Users can update own socials" ON public.socials
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'socials' AND policyname = 'Users can delete own socials'
  ) THEN
    CREATE POLICY "Users can delete own socials" ON public.socials
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END$$;

