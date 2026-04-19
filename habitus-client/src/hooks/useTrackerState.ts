import { useCallback, useEffect, useMemo, useState } from "react";
import { taskColors } from "../constants/tracker";
import type { SavedState } from "../types/tracker";
import {
  commitElapsedToTask,
  createEmptyState,
  loadState,
  parseSignedMinutes,
  sanitizeTaskText,
  uid,
} from "../utils/tracker";

export type UseTrackerStateResult = {
  state: SavedState;
  taskTitle: string;
  setTaskTitle: (value: string) => void;
  projectTitle: string;
  setProjectTitle: (value: string) => void;
  minutesDrafts: Record<string, string>;
  updateMinutesDraft: (taskId: string, value: string) => void;
  isRunning: boolean;
  activeElapsedMs: number;
  totalTracked: number;
  liveTotalTracked: number;
  addTask: () => void;
  startTask: (taskId: string) => void;
  stopTask: (taskId: string) => void;
  addMinutesToTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  resetAll: () => void;
};

export function useTrackerState(): UseTrackerStateResult {
  const [state, setState] = useState<SavedState>(loadState);
  const [now, setNow] = useState(() => Date.now());

  const [taskTitle, setTaskTitle] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [minutesDrafts, setMinutesDrafts] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("time-tracker-minimal", JSON.stringify(state));
  }, [state]);

  const isRunning = state.activeTaskId !== null && state.startedAt !== null;

  const activeElapsedMs = isRunning
    ? Math.max(0, now - (state.startedAt as number))
    : 0;

  const totalTracked = useMemo(
    () => state.tasks.reduce((sum, task) => sum + task.totalMs, 0),
    [state.tasks],
  );

  const liveTotalTracked = totalTracked + activeElapsedMs;

  const updateMinutesDraft = useCallback((taskId: string, value: string) => {
    if (!/^-?\d{0,3}$/.test(value)) return;
    setMinutesDrafts((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  }, []);

  const addTask = useCallback(() => {
    const title = sanitizeTaskText(taskTitle) || "Тест";
    const project = sanitizeTaskText(projectTitle) || "Общее";

    const task = {
      id: uid(),
      title,
      project,
      color: taskColors[state.tasks.length % taskColors.length],
      totalMs: 0,
    };

    setState((prev) => ({
      ...prev,
      tasks: [task, ...prev.tasks],
    }));

    setTaskTitle("");
    setProjectTitle("");
  }, [projectTitle, state.tasks.length, taskTitle]);

  const startTask = useCallback((taskId: string) => {
    const nowLocal = Date.now();

    setState((prev) => {
      if (prev.activeTaskId === taskId && prev.startedAt !== null) return prev;

      let nextTasks = prev.tasks;

      if (
        prev.activeTaskId !== null &&
        prev.startedAt !== null &&
        prev.activeTaskId !== taskId
      ) {
        nextTasks = commitElapsedToTask(
          prev.tasks,
          prev.activeTaskId,
          prev.startedAt,
          nowLocal,
        );
      }

      return {
        ...prev,
        tasks: nextTasks,
        activeTaskId: taskId,
        startedAt: nowLocal,
      };
    });

    setNow(nowLocal);
  }, []);

  const stopTask = useCallback((taskId: string) => {
    const nowLocal = Date.now();

    setState((prev) => {
      if (prev.activeTaskId !== taskId) return prev;

      if (prev.startedAt === null) {
        return {
          ...prev,
          activeTaskId: null,
          startedAt: null,
        };
      }

      return {
        ...prev,
        tasks: commitElapsedToTask(prev.tasks, taskId, prev.startedAt, nowLocal),
        activeTaskId: null,
        startedAt: null,
      };
    });

    setNow(nowLocal);
  }, []);

  const addMinutesToTask = useCallback(
    (taskId: string) => {
      const raw = minutesDrafts[taskId] ?? "";
      const minutes = parseSignedMinutes(raw);

      if (minutes === 0) return;

      const deltaMs = minutes * 60_000;

      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                totalMs: Math.max(0, task.totalMs + deltaMs),
              }
            : task,
        ),
      }));

      setMinutesDrafts((prev) => ({
        ...prev,
        [taskId]: "",
      }));
    },
    [minutesDrafts],
  );

  const deleteTask = useCallback((taskId: string) => {
    setState((prev) => {
      const isDeletingActive = prev.activeTaskId === taskId;

      return {
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== taskId),
        activeTaskId: isDeletingActive ? null : prev.activeTaskId,
        startedAt: isDeletingActive ? null : prev.startedAt,
      };
    });

    setMinutesDrafts((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setState(createEmptyState());
    setMinutesDrafts({});
    setNow(Date.now());
  }, []);

  return {
    state,
    taskTitle,
    setTaskTitle,
    projectTitle,
    setProjectTitle,
    minutesDrafts,
    updateMinutesDraft,
    isRunning,
    activeElapsedMs,
    totalTracked,
    liveTotalTracked,
    addTask,
    startTask,
    stopTask,
    addMinutesToTask,
    deleteTask,
    resetAll,
  };
}