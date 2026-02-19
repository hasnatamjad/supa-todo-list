import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useTaskSteps } from "@/hooks/useTaskSteps";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

function StepAdder({ taskId }: { taskId: string }) {
  const { steps, addStep } = useTaskSteps(taskId);
  const [stepName, setStepName] = useState("");

  const handleAdd = () => {
    if (!stepName.trim()) return;
    addStep.mutate({ task_id: taskId, step_name: stepName, status: "unstarted" as any });
    setStepName("");
  };

  return (
    <div className="pl-8 py-2 space-y-1">
      {steps.map((s) => (
        <div key={s.id} className="text-xs text-muted-foreground flex gap-2">
          <span className={`inline-flex rounded-full px-1.5 py-0.5 ${s.status === "completed" ? "bg-accent/10 text-accent" : "bg-muted"}`}>{s.status}</span>
          <span>{s.step_name}</span>
          {s.completion_date && <span className="text-muted-foreground/60">({s.completion_date})</span>}
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <Input placeholder="Add new step to reactivate…" value={stepName} onChange={(e) => setStepName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="h-7 text-xs" />
        <Button size="sm" onClick={handleAdd} disabled={!stepName.trim() || addStep.isPending} className="text-xs h-7">Add</Button>
      </div>
    </div>
  );
}

export default function FinishedTasks() {
  const { tasks, isLoading, deleteTask } = useTasks(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Finished Tasks</h1>
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">No finished tasks yet.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="min-w-[200px]">Task Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Daily Time</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <>
                  <TableRow key={task.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}>
                    <TableCell>
                      {task.task_type === "multi_step" ? (
                        expandedId === task.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                      ) : null}
                    </TableCell>
                    <TableCell className="font-medium">{task.task_name}</TableCell>
                    <TableCell>{task.category || "—"}</TableCell>
                    <TableCell>{task.task_type === "multi_step" ? "Multi Step" : "Single Step"}</TableCell>
                    <TableCell>{times.find((t) => t.value === task.daily_dedicated_time)?.label || "—"}</TableCell>
                    <TableCell className="text-xs">{(task as any).completed_at || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{task.notes || "—"}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 px-1.5 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete task?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{task.task_name}" and all its steps.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTask.mutate(task.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                  {expandedId === task.id && task.task_type === "multi_step" && (
                    <TableRow key={`${task.id}-steps`}>
                      <TableCell colSpan={8}>
                        <StepAdder taskId={task.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-3">Click a multi-step task to view steps. Adding a new step will reactivate the task.</p>
    </div>
  );
}
