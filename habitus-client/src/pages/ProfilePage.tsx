import { FiEdit2, FiLogOut, FiBell, FiLink, FiCpu, FiShield } from "react-icons/fi";
import { motion } from "framer-motion";
import { PageShell } from "../components/ui/PageShell";
import { InfoCard } from "../components/ui/InfoCard";
import React from "react";
import type { Page } from "@/types/pages";

interface ProfilePageProps {
  user?: {
    displayName?: string;
    username: string;
    email?: string;
    avatarUrl?: string;
  };
  onPageChange: (page: Page, isLoggedIn?: boolean) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onPageChange }) => {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      onPageChange("home", false);
    } catch (err) {
      console.error("Ошибка выхода:", err);
    }
  };

  if (!user) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-[60vh] text-[#e0e0e0] dark:text-[#a0a0a0]">
          Пользователь не найден
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-2">
        {/* Заголовок */}
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center rounded-full border border-[#5f99e8]/30 bg-[#5f99e8]/10 px-3 py-1 text-sm font-medium text-[#5f99e8] dark:text-[#7fb0f8]">
            Профиль
          </div>
        </div>

        {/* Карточка профиля */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center bg-white dark:bg-[#11151c] space-y-4"
        >
          {/* Информация пользователя */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <h2 className="text-xl font-semibold text-black dark:text-[#ffffff]">
              @{user.username}
            </h2>
            {user.email && (
              <p className="text-sm text-[#a0a0a0] dark:text-[#a0a0a0]">
                {user.email}
              </p>
            )}
          </div>

          {/* Кнопки под данными */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button className="inline-flex items-center gap-1 rounded-lg bg-[#5f99e8] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7fb0f8] active:scale-[0.98]">
              <FiEdit2 /> Редактировать
            </button>

            {/* Кнопка logout с привязкой handleLogout */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200 active:scale-[0.98]"
            >
              <FiLogOut /> Выйти
            </button>
          </div>

          {/* Статистика */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <InfoCard
              title="Активные сессии"
              text="Количество активных устройств и сеансов входа."
              icon={<FiCpu />}
            />
            <InfoCard
              title="Безопасность"
              text="Управляйте паролями, токенами и двухфакторной аутентификацией."
              icon={<FiShield />}
            />
            <InfoCard
              title="Уведомления"
              text="Настройте email и push уведомления."
              icon={<FiBell />}
            />
            <InfoCard
              title="Привязанные аккаунты"
              text="Соедините с Google, GitHub и другими сервисами."
              icon={<FiLink />}
            />
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
};