import type { FC } from "react";
import type { Page } from "@/types/pages";

import {
  navItemsLoggedIn,
  navItemsLoggedOut,
} from "@/features/navigation/navItems";

interface NavbarProps {
  loggedIn: boolean;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Navbar: FC<NavbarProps> = ({
  loggedIn,
  currentPage,
  onNavigate,
}) => {
  const items = loggedIn ? navItemsLoggedIn : navItemsLoggedOut;

  const isAuthPage =
    currentPage === "login" ||
    currentPage === "register" ||
    currentPage === "forgot";

  return (
    <nav className="fixed left-1/2 top-0 z-50 -translate-x-1/2 rounded-2xl border border-slate-200/70 bg-white/85 px-3 py-2 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-black/70">
      <ul className="flex gap-1.5">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            currentPage === item.page ||
            (item.page === "login" && isAuthPage);

          return (
            <li key={item.page}>
              <button
                type="button"
                onClick={() => onNavigate(item.page)}
                title={item.title}
                className={[
                  "flex items-center justify-center rounded-xl p-2 text-lg transition-all duration-200",
                  active
                    ? "bg-[#5f99e8] text-white shadow-md"
                    : "text-slate-700 hover:bg-black/5 dark:text-slate-200 dark:hover:bg-white/10",
                ].join(" ")}
              >
                <Icon />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};