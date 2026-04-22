-- Tabla para guardar el progreso diario/semanal de rutinas por usuario
CREATE TABLE public.routine_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  routine_key text NOT NULL,
  value integer NOT NULL DEFAULT 0,
  period_start date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, routine_key, period_start)
);

ALTER TABLE public.routine_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own routine progress"
ON public.routine_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_routine_progress_user_period ON public.routine_progress (user_id, period_start);

CREATE TRIGGER update_routine_progress_updated_at
BEFORE UPDATE ON public.routine_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();