
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS objective_color text;

CREATE TABLE IF NOT EXISTS public.content_objectives (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT '',
  sub_label text,
  color text NOT NULL DEFAULT '#ec4899',
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.content_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own objectives"
ON public.content_objectives
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
