import { daysInMonth } from "@/features/habitus/model";

export const cellBorder = "border border-solid border-[rgb(161,161,161)]";

export const baseCell =
  "h-7 w-7 flex items-center justify-center select-none rounded-sm overflow-hidden";

export const todayIndex = new Date().getDate() - 1;

export const gridTemplateColumns = `auto repeat(${daysInMonth}, 24px)`;