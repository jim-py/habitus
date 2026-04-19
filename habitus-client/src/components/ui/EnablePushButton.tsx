import { subscribePush } from "@/push/subscribe";

export function EnablePushButton({ userId }: { userId: string }) {
  return (
    <button
      onClick={() => subscribePush(userId)}
      className="px-4 py-2 bg-black text-white rounded"
    >
      Включить уведомления
    </button>
  );
}