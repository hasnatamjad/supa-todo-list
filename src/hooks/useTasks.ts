import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export function useTasks(completedFilter?: boolean) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<TaskRow[]>({
    queryKey: ["tasks", completedFilter],
    queryFn: async () => {
      let q = supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (completedFilter !== undefined) q = q.eq("is_completed", completedFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addTask = useMutation({
    mutationFn: async (task: Omit<TaskInsert, "user_id">) => {
      const { error } = await supabase.from("tasks").insert({ ...task, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { error } = await supabase.from("tasks").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return { tasks, isLoading, addTask, updateTask };
}
