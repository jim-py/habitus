export type ThemeMode = "light" | "dark";

export type Task = {
  id: string;
  title: string;
  project: string;
  color: string;
  totalMs: number;
};

export type SavedState = {
  tasks: Task[];
  activeTaskId: string | null;
  startedAt: number | null;
};