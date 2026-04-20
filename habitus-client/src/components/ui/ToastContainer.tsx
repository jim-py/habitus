import { useEffect, useState } from "react";
import { subscribeToast } from "@/types/toast";

type Toast = {
  id: number;
  message: string;
  type: "info" | "success" | "error";
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribeToast(setToasts);
  }, []);

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-[9999]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            px-4 py-2 rounded-lg text-white shadow-lg
            ${t.type === "success" ? "bg-green-500" : ""}
            ${t.type === "error" ? "bg-red-500" : ""}
            ${t.type === "info" ? "bg-blue-500" : ""}
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}