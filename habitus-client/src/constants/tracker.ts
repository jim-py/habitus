import type { ThemeMode } from "../types/tracker";

export const STORAGE_KEY = "time-tracker-minimal";

export const palette = {
  dark: {
    bg: "#0b0d10",
    surface: "#11151c",
    surface2: "#151b24",
    border: "rgba(255,255,255,0.08)",
    text: "#e0e0e0",
    muted: "#a0a0a0",
    accent: "#5f99e8",
    hover: "#7fb0f8",
    inputBg: "rgba(255,255,255,0.03)",
    danger: "#ff7b7b",
  },
  light: {
    bg: "#f5f5f5",
    surface: "#ffffff",
    surface2: "#f7f8fb",
    border: "rgba(17,21,28,0.10)",
    text: "#11151c",
    muted: "#555555",
    accent: "#5f99e8",
    hover: "#3d7bd9",
    inputBg: "rgba(17,21,28,0.02)",
    danger: "#d94a4a",
  },
} as const satisfies Record<
  ThemeMode,
  {
    bg: string;
    surface: string;
    surface2: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
    hover: string;
    inputBg: string;
    danger: string;
  }
>;

export const taskColors = [
  "#5f99e8",
  "#8d9cff",
  "#66d19e",
  "#f2b46d",
  "#d97fb1",
] as const;