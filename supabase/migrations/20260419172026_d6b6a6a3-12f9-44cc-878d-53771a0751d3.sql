-- content_goals: 1 row per user
CREATE TABLE public.content_goals (
  user_id UUID NOT NULL PRIMARY KEY,
  ig_goal INTEGER NOT NULL DEFAULT 0,
  tiktok_goal INTEGER NOT NULL DEFAULT 0,
  solar_goal INTEGER NOT NULL DEFAULT 0,
  ideas_goal INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own content goals"
ON public.content_goals
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- follower_snapshots
CREATE TABLE public.follower_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.follower_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own follower snapshots"
ON public.follower_snapshots
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_follower_snapshots_user_platform_date
ON public.follower_snapshots (user_id, platform, snapshot_date DESC);

CREATE UNIQUE INDEX idx_follower_snapshots_unique_day
ON public.follower_snapshots (user_id, platform, snapshot_date);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_content_goals_updated_at
BEFORE UPDATE ON public.content_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();