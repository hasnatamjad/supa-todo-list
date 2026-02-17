
-- Create enums
CREATE TYPE public.task_type AS ENUM ('single_step', 'multi_step');
CREATE TYPE public.task_status AS ENUM ('unstarted', 'in_progress', 'paused', 'finished');
CREATE TYPE public.daily_time AS ENUM ('30_min', '1_hour', '1_5_hour', '2_hour', '2_5_hour', '3_hour', '3_5_hour', '4_hour', '5_hour', '6_hour');
CREATE TYPE public.step_status AS ENUM ('unstarted', 'in_progress', 'completed');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  category TEXT,
  task_type public.task_type NOT NULL DEFAULT 'single_step',
  status public.task_status NOT NULL DEFAULT 'unstarted',
  daily_dedicated_time public.daily_time,
  notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create task_steps table
CREATE TABLE public.task_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  status public.step_status NOT NULL DEFAULT 'unstarted',
  completion_date DATE,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_steps ENABLE ROW LEVEL SECURITY;

-- Tasks RLS policies
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Task steps RLS policies
CREATE POLICY "Users can view own steps" ON public.task_steps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own steps" ON public.task_steps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own steps" ON public.task_steps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own steps" ON public.task_steps FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-update task status based on steps
CREATE OR REPLACE FUNCTION public.update_task_status_from_steps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task_id UUID;
  v_total INT;
  v_completed INT;
  v_in_progress INT;
  v_new_status task_status;
  v_is_completed BOOLEAN;
BEGIN
  v_task_id := COALESCE(NEW.task_id, OLD.task_id);

  SELECT COUNT(*), 
         COUNT(*) FILTER (WHERE status = 'completed'),
         COUNT(*) FILTER (WHERE status = 'in_progress')
  INTO v_total, v_completed, v_in_progress
  FROM public.task_steps
  WHERE task_id = v_task_id;

  IF v_total = 0 THEN
    v_new_status := 'unstarted';
    v_is_completed := false;
  ELSIF v_total = v_completed THEN
    v_new_status := 'finished';
    v_is_completed := true;
  ELSIF v_in_progress > 0 THEN
    v_new_status := 'in_progress';
    v_is_completed := false;
  ELSIF v_completed > 0 THEN
    v_new_status := 'paused';
    v_is_completed := false;
  ELSE
    v_new_status := 'unstarted';
    v_is_completed := false;
  END IF;

  UPDATE public.tasks
  SET status = v_new_status, is_completed = v_is_completed
  WHERE id = v_task_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger on task_steps changes
CREATE TRIGGER on_step_change
AFTER INSERT OR UPDATE OR DELETE ON public.task_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_task_status_from_steps();

-- Indexes
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_is_completed ON public.tasks(is_completed);
CREATE INDEX idx_task_steps_task_id ON public.task_steps(task_id);
CREATE INDEX idx_task_steps_user_id ON public.task_steps(user_id);
