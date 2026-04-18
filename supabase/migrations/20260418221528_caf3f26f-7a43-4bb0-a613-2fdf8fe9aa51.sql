CREATE TABLE public.priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'briefcase',
  color text DEFAULT 'primary',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own priorities"
  ON public.priorities
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);