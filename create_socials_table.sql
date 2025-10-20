-- Creating socials table
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

-- Enable RLS
ALTER TABLE public.socials ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS "Users can view own socials" ON public.socials;
CREATE POLICY "Users can view own socials" ON public.socials
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own socials" ON public.socials;
CREATE POLICY "Users can insert own socials" ON public.socials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own socials" ON public.socials;
CREATE POLICY "Users can update own socials" ON public.socials
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own socials" ON public.socials;
CREATE POLICY "Users can delete own socials" ON public.socials
  FOR DELETE USING (auth.uid() = user_id);
