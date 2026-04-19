import { STORAGE_KEY } from "../constants/tracker";
import type { SavedState, Task, ThemeMode } from "../types/tracker";

export function uid() {
  const c = globalThis.crypto;

  if (c?.randomUUID) return c.randomUUID();

  if (c?.getRandomValues) {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);

    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  return `task_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`;
}

export function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";

  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDecimalHours(ms: number) {
  return (ms / 3_600_000).toFixed(2);
}

export function createEmptyState(): SavedState {
  return {
    tasks: [],
    activeTaskId: null,
    startedAt: null,
  };
}

export function loadState(): SavedState {
  if (typeof window === "undefined") return createEmptyState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();

    const parsed = JSON.parse(raw) as Partial<SavedState>;

    const activeTaskId =
      typeof parsed.activeTaskId === "string" ? parsed.activeTaskId : null;
    const startedAt =
      typeof parsed.startedAt === "number" ? parsed.startedAt : null;

    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      activeTaskId: activeTaskId && startedAt !== null ? activeTaskId : null,
      startedAt: activeTaskId && startedAt !== null ? startedAt : null,
    };
  } catch {
    return createEmptyState();
  }
}

export function commitElapsedToTask(
  tasks: Task[],
  taskId: string,
  startedAt: number,
  now: number,
) {
  const delta = Math.max(0, now - startedAt);

  return tasks.map((task) =>
    task.id === taskId ? { ...task, totalMs: task.totalMs + delta } : task,
  );
}

export function sanitizeTaskText(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function truncateText(value: string, maxLength = 70) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export function parseSignedMinutes(value: string) {
  const n = Number(value);

  if (!Number.isFinite(n)) return 0;

  return Math.trunc(n);
}