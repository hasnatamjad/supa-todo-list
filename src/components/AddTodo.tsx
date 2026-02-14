import { useState } from "react";
import { Plus } from "lucide-react";

interface AddTodoProps {
  onAdd: (title: string) => void;
  isAdding: boolean;
}

export function AddTodo({ onAdd, isAdding }: AddTodoProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        disabled={isAdding}
      />
      <button
        type="submit"
        disabled={isAdding || !title.trim()}
        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Add
      </button>
    </form>
  );
}
