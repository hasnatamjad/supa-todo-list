import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useExpenses } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ExpenseTracker() {
  const { expenses, isLoading, addExpense, deleteExpense, reorderExpenses } = useExpenses();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ expense_name: "", package: "", notes: "" });

  const handleAdd = () => {
    if (!form.expense_name.trim()) {
      toast({ title: "Expense name is required", variant: "destructive" });
      return;
    }
    addExpense.mutate(
      { expense_name: form.expense_name.trim(), package: form.package.trim() || undefined, notes: form.notes.trim() || undefined },
      {
        onSuccess: () => {
          setForm({ expense_name: "", package: "", notes: "" });
          setShowAdd(false);
          toast({ title: "Expense added" });
        },
      }
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = [...expenses];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    reorderExpenses.mutate(reordered.map((e, i) => ({ id: e.id, position: i })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Expense Tracker</h1>
        <Button size="sm" onClick={() => setShowAdd(true)} disabled={showAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Expense
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Expense Name</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="expenses">
              {(provided) => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                  {showAdd && (
                    <TableRow>
                      <TableCell />
                      <TableCell>
                        <Input
                          placeholder="Expense name"
                          value={form.expense_name}
                          onChange={(e) => setForm(f => ({ ...f, expense_name: e.target.value }))}
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Package"
                          value={form.package}
                          onChange={(e) => setForm(f => ({ ...f, package: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Notes"
                          value={form.notes}
                          onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleAdd} disabled={addExpense.isPending}>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>✕</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading…</TableCell>
                    </TableRow>
                  ) : expenses.length === 0 && !showAdd ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No expenses yet</TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense, index) => (
                      <Draggable key={expense.id} draggableId={expense.id} index={index}>
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={snapshot.isDragging ? "bg-muted" : ""}
                          >
                            <TableCell>
                              <span {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{expense.expense_name}</TableCell>
                            <TableCell>{expense.package ?? "—"}</TableCell>
                            <TableCell>{expense.notes ?? "—"}</TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteExpense.mutate(expense.id, { onSuccess: () => toast({ title: "Expense deleted" }) })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </div>
    </div>
  );
}
