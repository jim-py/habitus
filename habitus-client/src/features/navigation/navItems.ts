import type { IconType } from "react-icons";
import {
  FaHouse,
  FaRightToBracket,
  FaCircleInfo,
  FaCalendarDays,
  FaListCheck,
  FaClock,
  FaSquareRootVariable,
  FaUser,
} from "react-icons/fa6";

import type { Page } from "@/types/pages";

export interface NavItem {
  page: Page;
  icon: IconType;
  title: string;
}

export const navItemsLoggedOut: NavItem[] = [
  { page: "home", icon: FaHouse, title: "Main" },
  { page: "login", icon: FaRightToBracket, title: "Log in" },
  { page: "about", icon: FaCircleInfo, title: "Info" },
];

export const navItemsLoggedIn: NavItem[] = [
  { page: "habitus", icon: FaCalendarDays, title: "Habitus" },
  { page: "todos", icon: FaListCheck, title: "Todo" },
  { page: "pomodoro", icon: FaClock, title: "Pomodoro" },
  { page: "math", icon: FaSquareRootVariable, title: "Math" },
  { page: "profile", icon: FaUser, title: "Profile" },
  { page: "about", icon: FaCircleInfo, title: "Info" },
];