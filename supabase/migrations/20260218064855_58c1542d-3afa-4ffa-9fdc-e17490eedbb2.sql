
ALTER TABLE public.tasks ADD COLUMN position INT DEFAULT 0;
ALTER TABLE public.task_steps ADD COLUMN position INT DEFAULT 0;

-- Backfill existing rows with sequential positions
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.tasks
)
UPDATE public.tasks SET position = numbered.rn FROM numbered WHERE tasks.id = numbered.id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY created_at) as rn
  FROM public.task_steps
)
UPDATE public.task_steps SET position = numbered.rn FROM numbered WHERE task_steps.id = numbered.id;
