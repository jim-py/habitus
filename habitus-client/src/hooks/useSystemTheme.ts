import { useEffect, useState } from "react";
import type { ThemeMode } from "../types/tracker";
import { getSystemTheme } from "../utils/tracker";

export function useSystemTheme() {
  const [theme, setTheme] = useState<ThemeMode>(getSystemTheme());

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme(mq.matches ? "dark" : "light");

    onChange();
    mq.addEventListener?.("change", onChange);

    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return theme;
}