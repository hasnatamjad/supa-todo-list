import { useTodos } from "@/hooks/useTodos";
import { AddTodo } from "@/components/AddTodo";
import { TodoItem } from "@/components/TodoItem";
import { ClipboardList } from "lucide-react";

const Index = () => {
  const { todos, isLoading, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Todos of Hasnat Testing 2 way Sync</h1>
        </div>

        <div className="mb-6">
          <AddTodo
            onAdd={(title) => addTodo.mutate(title)}
            isAdding={addTodo.isPending}
          />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : todos.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No todos yet. Add one above!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={(id, completed) => toggleTodo.mutate({ id, completed })}
                onDelete={(id) => deleteTodo.mutate(id)}
              />
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {todos.filter((t) => !t.completed).length} remaining
        </p>
      </div>
    </div>
  );
};

export default Index;
