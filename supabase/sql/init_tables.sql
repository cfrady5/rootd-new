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
