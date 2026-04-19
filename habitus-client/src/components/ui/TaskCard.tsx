import { motion } from "framer-motion";
import { Clock3, Play, Square, Trash2 } from "lucide-react";
import type { Task } from "../../types/tracker";
import {
  formatDecimalHours,
  formatDuration,
  truncateText,
} from "../../utils/tracker";
import { TaskButton } from "./TaskButton";

type TaskCardProps = {
  task: Task;
  isRunning: boolean;
  displayTime: number;
  minutesDraft: string;
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
  onMinutesDraftChange: (value: string) => void;
  onAddMinutes: () => void;
};

export function TaskCard({
  task,
  isRunning,
  displayTime,
  minutesDraft,
  onStart,
  onStop,
  onDelete,
  onMinutesDraftChange,
  onAddMinutes,
}: TaskCardProps) {
  const titleDisplay = truncateText(task.title, 60);
  const projectDisplay = truncateText(task.project, 60);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className={`rounded-2xl border p-4 transition ${
        isRunning
          ? "border-[var(--accent)] bg-[var(--surface2)]"
          : "border-[var(--border)] bg-transparent hover:border-[var(--hover)] hover:bg-[var(--surface2)]"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {isRunning ? (
              <TaskButton
                label="Стоп"
                icon={<Square className="h-4 w-4" />}
                onClick={onStop}
                variant="stop"
              />
            ) : (
              <TaskButton
                label="Старт"
                icon={<Play className="h-4 w-4" />}
                onClick={onStart}
                variant="start"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: task.color }}
              />
              <div
                className="truncate text-base font-medium"
                title={task.title}
              >
                {titleDisplay}
              </div>

              {isRunning && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/15 px-2 py-1 text-[11px] font-medium text-[var(--accent)]">
                  <Clock3 className="h-3 w-3" />
                  Запущена
                </span>
              )}
            </div>

            <div
              className="mt-1 truncate text-sm text-[var(--muted)]"
              title={task.project}
            >
              {projectDisplay}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step={1}
              min={-999}
              max={999}
              inputMode="numeric"
              value={minutesDraft}
              onChange={(e) => onMinutesDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddMinutes();
              }}
              placeholder="мин"
              className="w-20 rounded-xl border border-[var(--border)] bg-[var(--inputBg)] px-3 py-2 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <div className="font-mono text-3xl font-semibold leading-none tracking-tight tabular-nums sm:text-4xl">
                {formatDuration(displayTime)}
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                {formatDecimalHours(displayTime)} ч
              </div>
            </div>
          </div>

          <TaskButton
            label="Удалить"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={onDelete}
            variant="delete"
          />
        </div>
      </div>
    </motion.div>
  );
}
