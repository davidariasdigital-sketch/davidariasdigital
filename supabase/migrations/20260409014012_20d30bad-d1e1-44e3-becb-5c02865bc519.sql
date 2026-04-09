CREATE TABLE public.service_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL DEFAULT '',
  service text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  unit text DEFAULT 'por servicio',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own service costs"
  ON public.service_costs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);