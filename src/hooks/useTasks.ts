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

  const statusOrder: Record<string, number> = { finished: 0, in_progress: 1, paused: 2, unstarted: 3 };

  const { data: tasks = [], isLoading } = useQuery<TaskRow[]>({
    queryKey: ["tasks", completedFilter],
    queryFn: async () => {
      let q = supabase.from("tasks").select("*").order("position", { ascending: true });
      if (completedFilter !== undefined) q = q.eq("is_completed", completedFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));
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

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const reorderTasks = useMutation({
    mutationFn: async (updates: { id: string; position: number }[]) => {
      for (const u of updates) {
        const { error } = await supabase.from("tasks").update({ position: u.position }).eq("id", u.id);
        if (error) throw error;
      }
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ["tasks", completedFilter] });
      const prev = qc.getQueryData<TaskRow[]>(["tasks", completedFilter]);
      if (prev) {
        const posMap = new Map(updates.map(u => [u.id, u.position]));
        const next = [...prev].map(t => posMap.has(t.id) ? { ...t, position: posMap.get(t.id)! } : t)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        qc.setQueryData(["tasks", completedFilter], next);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks", completedFilter], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return { tasks, isLoading, addTask, updateTask, deleteTask, reorderTasks };
}
