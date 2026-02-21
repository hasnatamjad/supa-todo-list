import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Expense {
  id: string;
  user_id: string;
  expense_name: string;
  package: string | null;
  notes: string | null;
  position: number | null;
  created_at: string;
}

export function useExpenses() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const addExpense = useMutation({
    mutationFn: async (expense: { expense_name: string; package?: string; notes?: string }) => {
      const maxPos = expenses.length > 0 ? Math.max(...expenses.map(e => e.position ?? 0)) + 1 : 0;
      const { error } = await supabase.from("expenses").insert({
        ...expense,
        user_id: user!.id,
        position: maxPos,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const reorderExpenses = useMutation({
    mutationFn: async (updates: { id: string; position: number }[]) => {
      for (const u of updates) {
        const { error } = await supabase.from("expenses").update({ position: u.position } as any).eq("id", u.id);
        if (error) throw error;
      }
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ["expenses"] });
      const prev = qc.getQueryData<Expense[]>(["expenses"]);
      if (prev) {
        const posMap = new Map(updates.map(u => [u.id, u.position]));
        const next = [...prev]
          .map(e => posMap.has(e.id) ? { ...e, position: posMap.get(e.id)! } : e)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        qc.setQueryData(["expenses"], next);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["expenses"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });

  return { expenses, isLoading, addExpense, deleteExpense, reorderExpenses };
}
