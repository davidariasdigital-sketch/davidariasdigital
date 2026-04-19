ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS priority_id uuid REFERENCES public.priorities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_priority_id ON public.tasks(priority_id);