CREATE TABLE public.health_weight_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT health_weight_entries_weight_range CHECK (weight_kg > 0 AND weight_kg < 400),
  CONSTRAINT health_weight_entries_user_date_unique UNIQUE (user_id, entry_date)
);

ALTER TABLE public.health_weight_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health weights"
ON public.health_weight_entries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own health weights"
ON public.health_weight_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health weights"
ON public.health_weight_entries
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health weights"
ON public.health_weight_entries
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_health_weight_entries_user_date
ON public.health_weight_entries (user_id, entry_date);

CREATE TRIGGER update_health_weight_entries_updated_at
BEFORE UPDATE ON public.health_weight_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.health_routine_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  routine_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT health_routine_items_type_check CHECK (routine_type IN ('food', 'exercise')),
  CONSTRAINT health_routine_items_title_length CHECK (char_length(title) <= 120),
  CONSTRAINT health_routine_items_description_length CHECK (description IS NULL OR char_length(description) <= 500)
);

ALTER TABLE public.health_routine_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health routines"
ON public.health_routine_items
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own health routines"
ON public.health_routine_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health routines"
ON public.health_routine_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health routines"
ON public.health_routine_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_health_routine_items_user_type_order
ON public.health_routine_items (user_id, routine_type, sort_order);

CREATE TRIGGER update_health_routine_items_updated_at
BEFORE UPDATE ON public.health_routine_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();