import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";

type StepRow = Database["public"]["Tables"]["task_steps"]["Row"];
type StepInsert = Database["public"]["Tables"]["task_steps"]["Insert"];
type StepUpdate = Database["public"]["Tables"]["task_steps"]["Update"];

export function useTaskSteps(taskId: string | null) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: steps = [], isLoading } = useQuery<StepRow[]>({
    queryKey: ["task_steps", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_steps")
        .select("*")
        .eq("task_id", taskId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!taskId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!taskId) return;
    const channel = supabase
      .channel(`steps-${taskId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_steps", filter: `task_id=eq.${taskId}` }, () => {
        qc.invalidateQueries({ queryKey: ["task_steps", taskId] });
        qc.invalidateQueries({ queryKey: ["tasks"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [taskId, qc]);

  const addStep = useMutation({
    mutationFn: async (step: Omit<StepInsert, "user_id">) => {
      const { error } = await supabase.from("task_steps").insert({ ...step, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task_steps", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateStep = useMutation({
    mutationFn: async ({ id, ...updates }: StepUpdate & { id: string }) => {
      const { error } = await supabase.from("task_steps").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task_steps", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteStep = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("task_steps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task_steps", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const reorderSteps = useMutation({
    mutationFn: async (updates: { id: string; position: number }[]) => {
      for (const u of updates) {
        const { error } = await supabase.from("task_steps").update({ position: u.position }).eq("id", u.id);
        if (error) throw error;
      }
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ["task_steps", taskId] });
      const prev = qc.getQueryData<StepRow[]>(["task_steps", taskId]);
      if (prev) {
        const posMap = new Map(updates.map(u => [u.id, u.position]));
        const next = [...prev].map(s => posMap.has(s.id) ? { ...s, position: posMap.get(s.id)! } : s)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        qc.setQueryData(["task_steps", taskId], next);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["task_steps", taskId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["task_steps", taskId] }),
  });

  return { steps, isLoading, addStep, updateStep, deleteStep, reorderSteps };
}
