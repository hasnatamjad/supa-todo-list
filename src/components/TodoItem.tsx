import { Check, Trash2 } from "lucide-react";
import type { Todo } from "@/hooks/useTodos";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md">
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          todo.completed
            ? "border-accent bg-accent text-accent-foreground"
            : "border-muted-foreground/40 hover:border-primary"
        }`}
      >
        {todo.completed && <Check className="h-3.5 w-3.5" />}
      </button>
      <span
        className={`flex-1 text-sm transition-colors ${
          todo.completed ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-muted-foreground/0 transition-colors group-hover:text-destructive"
        aria-label="Delete todo"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
