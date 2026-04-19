import { AnimatePresence, motion } from "framer-motion";
import { TimerReset } from "lucide-react";
import { useEffect, type CSSProperties } from "react";
import { palette } from "../constants/tracker";
import { TaskCard } from "../components/ui/TaskCard";
import { TaskForm } from "../components/forms/TaskForm";
import { useSystemTheme } from "../hooks/useSystemTheme";
import { useTrackerState } from "../hooks/useTrackerState";
import { formatDecimalHours, formatDuration } from "../utils/tracker";

export default function App() {
  const theme = useSystemTheme();
  const colors = palette[theme];

  const {
    state,
    taskTitle,
    setTaskTitle,
    projectTitle,
    setProjectTitle,
    minutesDrafts,
    updateMinutesDraft,
    isRunning,
    activeElapsedMs,
    liveTotalTracked,
    addTask,
    startTask,
    stopTask,
    addMinutesToTask,
    deleteTask,
    resetAll,
  } = useTrackerState();

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
    document.body.style.background = colors.bg;
    document.body.style.color = colors.text;
    document.body.style.fontFamily = "'Montserrat', sans-serif";
  }, [colors.bg, colors.text, theme]);

  const cssVars = {
    ["--bg"]: colors.bg,
    ["--surface"]: colors.surface,
    ["--surface2"]: colors.surface2,
    ["--border"]: colors.border,
    ["--text"]: colors.text,
    ["--muted"]: colors.muted,
    ["--accent"]: colors.accent,
    ["--hover"]: colors.hover,
    ["--inputBg"]: colors.inputBg,
    ["--danger"]: colors.danger,
  } as CSSProperties;

  return (
    <div
      style={cssVars}
      className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased font-['Montserrat',sans-serif]"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 pt-24 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Задачи</h2>
            </div>

            <div className="rounded-full border border-[var(--border)] bg-[var(--surface2)] px-3 py-1 text-xs text-[var(--muted)]">
              Всего: {formatDuration(liveTotalTracked)} ·{" "}
              {formatDecimalHours(liveTotalTracked)} ч
            </div>
          </div>

          <TaskForm
            taskTitle={taskTitle}
            projectTitle={projectTitle}
            onTaskTitleChange={setTaskTitle}
            onProjectTitleChange={setProjectTitle}
            onAddTask={addTask}
          />

          <div className="mt-5 grid gap-3">
            <AnimatePresence initial={false}>
              {state.tasks.map((task) => {
                const taskIsRunning = task.id === state.activeTaskId && isRunning;

                const displayTime =
                  task.totalMs + (taskIsRunning ? activeElapsedMs : 0);

                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isRunning={taskIsRunning}
                    displayTime={displayTime}
                    minutesDraft={minutesDrafts[task.id] ?? ""}
                    onStart={() => startTask(task.id)}
                    onStop={() => stopTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onMinutesDraftChange={(value) =>
                      updateMinutesDraft(task.id, value)
                    }
                    onAddMinutes={() => addMinutesToTask(task.id)}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </motion.section>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--hover)] hover:text-[var(--text)]"
          >
            <TimerReset className="h-4 w-4" />
            Сбросить всё
          </button>
        </div>
      </div>
    </div>
  );
}