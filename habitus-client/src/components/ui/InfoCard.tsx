import React from "react";

interface InfoCardProps {
  title: string;
  text: string;
  icon?: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, text, icon }) => {
  return (
    <div className="rounded-2xl border border-black/5 bg-[#f5f5f5] p-5 dark:border-white/10 dark:bg-[#0b0d10] flex items-start gap-3">
      {icon && (
        <div className="text-[#5f99e8] dark:text-[#7fb0f8] mt-1">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-[#11151c] dark:text-white">{title}</h3>
        <div className="mt-2 text-sm leading-6 text-[#555555] dark:text-[#a0a0a0]">{text}</div>
      </div>
    </div>
  );
};