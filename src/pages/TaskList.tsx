import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useTaskSteps } from "@/hooks/useTaskSteps";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

const stepStatuses = [
  { value: "unstarted", label: "Unstarted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

interface DraftStep {
  step_name: string;
  status: string;
  completion_date: string;
  comment: string;
}

const emptyDraft = (): DraftStep => ({ step_name: "", status: "unstarted", completion_date: "", comment: "" });

export default function TaskList() {
  const { tasks, isLoading: tasksLoading } = useTasks(false);
  const multiStepTasks = tasks.filter((t) => t.task_type === "multi_step");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { steps, isLoading: stepsLoading, addStep, updateStep } = useTaskSteps(selectedTaskId);
  const [draft, setDraft] = useState<DraftStep>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Record<string, any>>({});

  const handleAddStep = () => {
    if (!draft.step_name.trim() || !selectedTaskId) return;
    addStep.mutate({
      task_id: selectedTaskId,
      step_name: draft.step_name,
      status: draft.status as any,
      completion_date: draft.completion_date || null,
      comment: draft.comment || null,
    });
    setDraft(emptyDraft());
  };

  const startEdit = (step: any) => {
    setEditingId(step.id);
    setEditRow({ ...step });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateStep.mutate({
      id: editingId,
      step_name: editRow.step_name,
      status: editRow.status,
      completion_date: editRow.completion_date || null,
      comment: editRow.comment || null,
    });
    setEditingId(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Task List</h1>

      <div className="mb-6 max-w-xs">
        <label className="text-sm font-medium text-foreground mb-1.5 block">Select Multi-Step Task</label>
        <Select value={selectedTaskId || ""} onValueChange={(v) => setSelectedTaskId(v)}>
          <SelectTrigger><SelectValue placeholder="Choose a task…" /></SelectTrigger>
          <SelectContent>
            {tasksLoading ? (
              <SelectItem value="_loading" disabled>Loading…</SelectItem>
            ) : multiStepTasks.length === 0 ? (
              <SelectItem value="_none" disabled>No multi-step tasks</SelectItem>
            ) : (
              multiStepTasks.map((t) => <SelectItem key={t.id} value={t.id}>{t.task_name}</SelectItem>)
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedTaskId && (
        <div className="rounded-lg border border-border overflow-auto">
          {stepsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading steps…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Step Name</TableHead>
                  <TableHead className="min-w-[130px]">Status</TableHead>
                  <TableHead className="min-w-[140px]">Completion Date</TableHead>
                  <TableHead className="min-w-[200px]">Comment</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.map((step) =>
                  editingId === step.id ? (
                    <TableRow key={step.id}>
                      <TableCell><Input value={editRow.step_name} onChange={(e) => setEditRow({ ...editRow, step_name: e.target.value })} className="h-8" /></TableCell>
                      <TableCell>
                        <Select value={editRow.status} onValueChange={(v) => setEditRow({ ...editRow, status: v })}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>{stepStatuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><Input type="date" value={editRow.completion_date || ""} onChange={(e) => setEditRow({ ...editRow, completion_date: e.target.value })} className="h-8" /></TableCell>
                      <TableCell><Input value={editRow.comment || ""} onChange={(e) => setEditRow({ ...editRow, comment: e.target.value })} className="h-8" /></TableCell>
                      <TableCell><Button size="sm" variant="ghost" onClick={saveEdit}><Check className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={step.id} className="cursor-pointer" onDoubleClick={() => startEdit(step)}>
                      <TableCell className="font-medium">{step.step_name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          step.status === "in_progress" ? "bg-primary/10 text-primary" :
                          step.status === "completed" ? "bg-accent/10 text-accent" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {stepStatuses.find((s) => s.value === step.status)?.label}
                        </span>
                      </TableCell>
                      <TableCell>{step.completion_date || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{step.comment || "—"}</TableCell>
                      <TableCell />
                    </TableRow>
                  )
                )}
                {/* New step row */}
                <TableRow>
                  <TableCell><Input placeholder="New step…" value={draft.step_name} onChange={(e) => setDraft({ ...draft, step_name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleAddStep()} className="h-8" /></TableCell>
                  <TableCell>
                    <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{stepStatuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input type="date" value={draft.completion_date} onChange={(e) => setDraft({ ...draft, completion_date: e.target.value })} className="h-8" /></TableCell>
                  <TableCell><Input placeholder="Comment" value={draft.comment} onChange={(e) => setDraft({ ...draft, comment: e.target.value })} className="h-8" /></TableCell>
                  <TableCell>
                    <Button size="sm" onClick={handleAddStep} disabled={!draft.step_name.trim() || addStep.isPending} className="text-xs h-7">
                      {addStep.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {!selectedTaskId && !tasksLoading && (
        <p className="text-sm text-muted-foreground py-12 text-center">Select a multi-step task above to manage its steps.</p>
      )}
      <p className="text-xs text-muted-foreground mt-3">Double-click a row to edit inline. Step status changes automatically update the parent task.</p>
    </div>
  );
}
