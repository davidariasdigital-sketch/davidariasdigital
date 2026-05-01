CREATE TABLE public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram','tiktok')),
  username TEXT NOT NULL,
  access_token TEXT,
  account_id TEXT,
  follower_count INTEGER,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own social accounts" ON public.social_accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own social accounts" ON public.social_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own social accounts" ON public.social_accounts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own social accounts" ON public.social_accounts
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();