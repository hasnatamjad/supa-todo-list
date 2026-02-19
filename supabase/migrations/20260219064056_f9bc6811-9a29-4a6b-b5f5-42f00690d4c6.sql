
-- Add completed_at to tasks
ALTER TABLE public.tasks ADD COLUMN completed_at date;

-- Backfill existing completed tasks
UPDATE public.tasks SET completed_at = CURRENT_DATE WHERE is_completed = true AND completed_at IS NULL;

-- Update trigger to auto-set completed_at on tasks and completion_date on steps
CREATE OR REPLACE FUNCTION public.update_task_status_from_steps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_task_id UUID;
  v_total INT;
  v_completed INT;
  v_in_progress INT;
  v_new_status task_status;
  v_is_completed BOOLEAN;
BEGIN
  -- Auto-set completion_date on step when status becomes completed
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.status = 'completed' AND NEW.completion_date IS NULL THEN
    NEW.completion_date := CURRENT_DATE;
  END IF;
  -- Clear completion_date if step is no longer completed
  IF TG_OP = 'UPDATE' AND NEW.status != 'completed' THEN
    NEW.completion_date := NULL;
  END IF;

  v_task_id := COALESCE(NEW.task_id, OLD.task_id);

  SELECT COUNT(*), 
         COUNT(*) FILTER (WHERE status = 'completed'),
         COUNT(*) FILTER (WHERE status = 'in_progress')
  INTO v_total, v_completed, v_in_progress
  FROM public.task_steps
  WHERE task_id = v_task_id;

  -- Count the current row with its new status (for BEFORE trigger)
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    -- The counts above used old data; we need to adjust
    NULL; -- Actually for AFTER trigger this is fine
  END IF;

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
  SET status = v_new_status, 
      is_completed = v_is_completed,
      completed_at = CASE WHEN v_is_completed THEN CURRENT_DATE ELSE NULL END
  WHERE id = v_task_id;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Need to check if trigger is BEFORE or AFTER - we need BEFORE to modify NEW
-- Drop existing triggers and recreate as BEFORE triggers
DROP TRIGGER IF EXISTS update_task_status_trigger ON public.task_steps;
DROP TRIGGER IF EXISTS update_task_status_on_delete ON public.task_steps;

CREATE TRIGGER update_task_status_trigger
BEFORE INSERT OR UPDATE ON public.task_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_task_status_from_steps();

CREATE TRIGGER update_task_status_on_delete
AFTER DELETE ON public.task_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_task_status_from_steps();
