import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

const taskTypes = [
  { value: "single_step", label: "Single Step" },
  { value: "multi_step", label: "Multi Step" },
];
const statuses = [
  { value: "unstarted", label: "Unstarted" },
  { value: "in_progress", label: "In Progress" },
  { value: "paused", label: "Paused" },
  { value: "finished", label: "Finished" },
];
const times = [
  { value: "30_min", label: "30 min" },
  { value: "1_hour", label: "1 hr" },
  { value: "1_5_hour", label: "1.5 hr" },
  { value: "2_hour", label: "2 hr" },
  { value: "2_5_hour", label: "2.5 hr" },
  { value: "3_hour", label: "3 hr" },
  { value: "3_5_hour", label: "3.5 hr" },
  { value: "4_hour", label: "4 hr" },
  { value: "5_hour", label: "5 hr" },
  { value: "6_hour", label: "6 hr" },
];

interface DraftRow {
  task_name: string;
  category: string;
  task_type: string;
  status: string;
  daily_dedicated_time: string;
  notes: string;
}

const emptyDraft = (): DraftRow => ({ task_name: "", category: "", task_type: "single_step", status: "unstarted", daily_dedicated_time: "", notes: "" });

export default function TaskRegistry() {
  const { tasks, isLoading, addTask, updateTask } = useTasks(false);
  const [draft, setDraft] = useState<DraftRow>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Record<string, any>>({});

  const handleAddRow = () => {
    if (!draft.task_name.trim()) return;
    addTask.mutate({
      task_name: draft.task_name,
      category: draft.category || null,
      task_type: draft.task_type as any,
      status: draft.status as any,
      daily_dedicated_time: draft.daily_dedicated_time as any || null,
      notes: draft.notes || null,
    });
    setDraft(emptyDraft());
  };

  const startEdit = (task: any) => {
    setEditingId(task.id);
    setEditRow({ ...task });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateTask.mutate({
      id: editingId,
      task_name: editRow.task_name,
      category: editRow.category,
      task_type: editRow.task_type,
      status: editRow.status,
      daily_dedicated_time: editRow.daily_dedicated_time,
      notes: editRow.notes,
    });
    setEditingId(null);
  };

  const markFinished = (id: string) => {
    updateTask.mutate({ id, is_completed: true, status: "finished" as any });
  };

  // Auto-add when draft is filled
  useEffect(() => {
    if (draft.task_name.trim() && addTask.isSuccess) {
      setDraft(emptyDraft());
    }
  }, [addTask.isSuccess]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Task Registry</h1>
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Task Name</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[130px]">Type</TableHead>
                <TableHead className="min-w-[130px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Daily Time</TableHead>
                <TableHead className="min-w-[160px]">Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) =>
                editingId === task.id ? (
                  <TableRow key={task.id}>
                    <TableCell><Input value={editRow.task_name} onChange={(e) => setEditRow({ ...editRow, task_name: e.target.value })} className="h-8" /></TableCell>
                    <TableCell><Input value={editRow.category || ""} onChange={(e) => setEditRow({ ...editRow, category: e.target.value })} className="h-8" /></TableCell>
                    <TableCell>
                      <Select value={editRow.task_type} onValueChange={(v) => setEditRow({ ...editRow, task_type: v })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{taskTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={editRow.status} onValueChange={(v) => setEditRow({ ...editRow, status: v })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={editRow.daily_dedicated_time || ""} onValueChange={(v) => setEditRow({ ...editRow, daily_dedicated_time: v })}>
                        <SelectTrigger className="h-8"><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>{times.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input value={editRow.notes || ""} onChange={(e) => setEditRow({ ...editRow, notes: e.target.value })} className="h-8" /></TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={saveEdit}><Check className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={task.id} className="cursor-pointer" onDoubleClick={() => startEdit(task)}>
                    <TableCell className="font-medium">{task.task_name}</TableCell>
                    <TableCell>{task.category || "—"}</TableCell>
                    <TableCell>{task.task_type === "multi_step" ? "Multi Step" : "Single Step"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        task.status === "in_progress" ? "bg-primary/10 text-primary" :
                        task.status === "paused" ? "bg-yellow-100 text-yellow-800" :
                        task.status === "finished" ? "bg-accent/10 text-accent" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {statuses.find((s) => s.value === task.status)?.label}
                      </span>
                    </TableCell>
                    <TableCell>{times.find((t) => t.value === task.daily_dedicated_time)?.label || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{task.notes || "—"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => markFinished(task.id)} className="text-xs h-7">
                        Finish
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
              {/* New row */}
              <TableRow>
                <TableCell><Input placeholder="New task…" value={draft.task_name} onChange={(e) => setDraft({ ...draft, task_name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleAddRow()} className="h-8" /></TableCell>
                <TableCell><Input placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="h-8" /></TableCell>
                <TableCell>
                  <Select value={draft.task_type} onValueChange={(v) => setDraft({ ...draft, task_type: v })}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{taskTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={draft.daily_dedicated_time} onValueChange={(v) => setDraft({ ...draft, daily_dedicated_time: v })}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{times.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Input placeholder="Notes" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className="h-8" /></TableCell>
                <TableCell>
                  <Button size="sm" onClick={handleAddRow} disabled={!draft.task_name.trim() || addTask.isPending} className="text-xs h-7">
                    {addTask.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-3">Double-click a row to edit inline.</p>
    </div>
  );
}
