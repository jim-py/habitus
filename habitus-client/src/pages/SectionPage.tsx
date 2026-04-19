import React from "react";
import { PageShell } from "../components/ui/PageShell";

interface SectionPageProps {
  title: string;
  description: string;
}

export const SectionPage: React.FC<SectionPageProps> = ({ title, description }) => {
  return (
    <PageShell>
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-[#5f99e8]/20 bg-[#5f99e8]/10 px-3 py-1 text-sm font-medium text-[#3d7bd9] dark:text-[#7fb0f8]">
          Раздел
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#11151c] dark:text-white sm:text-4xl">
          {title}
        </h1>

        <p className="max-w-2xl text-base leading-7 text-[#555555] dark:text-[#a0a0a0]">
          {description}
        </p>

        <div className="mt-6 rounded-2xl border border-dashed border-[#5f99e8]/30 bg-[#f5f5f5] p-6 dark:border-[#5f99e8]/20 dark:bg-[#0b0d10]">
          <p className="text-sm leading-6 text-[#555555] dark:text-[#a0a0a0]">
            Здесь будет реальный экран раздела. Сейчас это аккуратная заглушка, уже оформленная под твою систему цветов и стек проекта.
          </p>
        </div>
      </div>
    </PageShell>
  );
};