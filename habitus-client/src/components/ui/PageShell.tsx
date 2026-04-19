import React from "react";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({ children, className = "" }) => {
  return (
    <div className="min-h-screen px-4 pt-24 pb-10 sm:px-6 lg:px-8">
      <div
        className={[
          "mx-auto max-w-[1100px] rounded-[28px] border p-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)] backdrop-blur-md",
          "border-black/5 bg-white/90 dark:border-white/10 dark:bg-[#11151c]/95",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
};