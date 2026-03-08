
-- Enums
CREATE TYPE public.quotation_status AS ENUM ('borrador', 'enviada', 'aceptada', 'rechazada');
CREATE TYPE public.project_status AS ENUM ('pendiente', 'en_progreso', 'completado');
CREATE TYPE public.task_priority AS ENUM ('baja', 'media', 'alta');

-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own clients" ON public.clients FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Quotations
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.quotation_status NOT NULL DEFAULT 'borrador',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quotations" ON public.quotations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status public.project_status NOT NULL DEFAULT 'pendiente',
  progress INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  priority public.task_priority NOT NULL DEFAULT 'media',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
