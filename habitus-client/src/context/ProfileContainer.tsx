import React from "react";
import { ProfilePage } from "@/pages/ProfilePage";
import type { Page } from "@/types/pages";

interface User {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
}

interface ProfileContainerProps {
  user: User | null;
  loading: boolean;
}

export const ProfileContainer: React.FC<ProfileContainerProps & { onPageChange: (page: Page) => void }> = ({ user, loading, onPageChange }) => {
  if (loading) return <div className="text-[#e0e0e0] dark:text-[#a0a0a0]">Загрузка...</div>;
  if (!user) return <div className="text-[#e0e0e0] dark:text-[#a0a0a0]">Пользователь не найден</div>;

  return <ProfilePage user={user} onPageChange={onPageChange} />;
};