import { CheckCheck, Folder, Plus } from "lucide-react";

type TaskFormProps = {
  taskTitle: string;
  projectTitle: string;
  onTaskTitleChange: (value: string) => void;
  onProjectTitleChange: (value: string) => void;
  onAddTask: () => void;
};

export function TaskForm({
  taskTitle,
  projectTitle,
  onTaskTitleChange,
  onProjectTitleChange,
  onAddTask,
}: TaskFormProps) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <div className="relative">
        <input
          value={taskTitle}
          onChange={(e) => onTaskTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddTask();
          }}
          placeholder="Название задачи"
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--inputBg)] px-4 py-3 pl-11 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
        <CheckCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
      </div>

      <div className="relative">
        <input
          value={projectTitle}
          onChange={(e) => onProjectTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAddTask();
          }}
          placeholder="Название проекта"
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--inputBg)] px-4 py-3 pl-11 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
        <Folder className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
      </div>
    </div>
  );
}