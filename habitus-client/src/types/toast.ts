type ToastType = "info" | "success" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];
let id = 0;

export function subscribeToast(listener: (toasts: Toast[]) => void) {
  listeners.push(listener);
  listener(toasts);

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function emit() {
  listeners.forEach((l) => l([...toasts]));
}

export function toast(message: string, type: ToastType = "info") {
  const item: Toast = {
    id: ++id,
    message,
    type,
  };

  toasts.push(item);
  emit();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== item.id);
    emit();
  }, 3000);
}