import type { ReactNode } from "react";

type TaskButtonVariant = "start" | "stop" | "delete";

type TaskButtonProps = {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  variant: TaskButtonVariant;
};

const variantClasses: Record<TaskButtonVariant, string> = {
  start: "bg-[var(--accent)] text-white hover:bg-[var(--hover)]",
  stop: "bg-[var(--surface2)] text-[var(--text)] hover:border-[var(--hover)] hover:bg-[var(--surface2)]",
  delete:
    "bg-transparent text-[var(--muted)] hover:border-[var(--hover)] hover:text-[var(--text)]",
};

export function TaskButton({ label, onClick, icon, variant }: TaskButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-medium transition ${variantClasses[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
}