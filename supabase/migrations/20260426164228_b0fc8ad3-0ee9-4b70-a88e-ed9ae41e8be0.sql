CREATE TABLE public.health_training_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  training_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT health_training_days_user_date_unique UNIQUE (user_id, training_date)
);

ALTER TABLE public.health_training_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training days"
ON public.health_training_days
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own training days"
ON public.health_training_days
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training days"
ON public.health_training_days
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own training days"
ON public.health_training_days
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_health_training_days_user_date ON public.health_training_days (user_id, training_date);

CREATE TRIGGER update_health_training_days_updated_at
BEFORE UPDATE ON public.health_training_days
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();