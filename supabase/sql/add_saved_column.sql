-- Add saved column to business_matches table
-- This allows athletes to mark matches as "saved" or "favorited"

ALTER TABLE public.business_matches 
ADD COLUMN IF NOT EXISTS saved boolean DEFAULT false;

-- Create an index for faster queries on saved matches
CREATE INDEX IF NOT EXISTS idx_business_matches_saved 
ON public.business_matches(athlete_id, saved) 
WHERE saved = true;
