import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SunMedium,
  MoonStar,
  TimerReset,
  Settings2,
  Flame,
  Coffee,
  Focus,
} from "lucide-react";

type Mode = "focus" | "short" | "long";
type Theme = "dark" | "light";

type Preset = {
  label: string;
  minutes: number;
  icon: React.ReactNode;
  hint: string;
};

type CompletedSession = {
  id: string;
  mode: Mode;
  startedAt: number;
  durationMin: number;
};

const STORAGE_KEYS = {
  theme: "pomodoro.theme",
  durations: "pomodoro.durations",
  sessions: "pomodoro.sessions",
  stats: "pomodoro.stats",
};

const defaultDurations = {
  focus: 25,
  short: 5,
  long: 15,
};

const modeMeta: Record<Mode, { title: string; subtitle: string; accent: string; icon: React.ReactNode }> = {
  focus: {
    title: "Фокус",
    subtitle: "Глубокая работа без отвлечений",
    accent: "from-[#5f99e8] to-[#7fb0f8]",
    icon: <Focus className="h-5 w-5" />,
  },
  short: {
    title: "Короткий перерыв",
    subtitle: "Сбросить напряжение и вернуться в ритм",
    accent: "from-[#5f99e8] to-[#8bb7ff]",
    icon: <Coffee className="h-5 w-5" />,
  },
  long: {
    title: "Длинный перерыв",
    subtitle: "Полная перезагрузка перед следующим блоком",
    accent: "from-[#5f99e8] to-[#9cc2ff]",
    icon: <Flame className="h-5 w-5" />,
  },
};

const presets: Record<Mode, Preset> = {
  focus: {
    label: "Фокус",
    minutes: 25,
    icon: <Focus className="h-4 w-4" />,
    hint: "Рабочий спринт",
  },
  short: {
    label: "Перерыв",
    minutes: 5,
    icon: <Coffee className="h-4 w-4" />,
    hint: "Короткая пауза",
  },
  long: {
    label: "Длинный",
    minutes: 15,
    icon: <Flame className="h-4 w-4" />,
    hint: "Восстановление",
  },
};

function clampMinutes(value: number, min = 1, max = 180) {
  return Math.min(max, Math.max(min, value));
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

function ThemeIcon({ theme }: { theme: Theme }) {
  return theme === "dark" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />;
}

export default function PomodoroPage() {
  const [theme, setTheme] = useState<Theme>(() => loadJson<Theme>(STORAGE_KEYS.theme, "dark"));
  const [durations, setDurations] = useState(() => loadJson(STORAGE_KEYS.durations, defaultDurations));
  const [mode, setMode] = useState<Mode>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(() => (loadJson(STORAGE_KEYS.durations, defaultDurations).focus ?? 25) * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [sessions, setSessions] = useState<CompletedSession[]>(() => loadJson(STORAGE_KEYS.sessions, []));
  const [ticks, setTicks] = useState(0);
  const timerRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const stats = useMemo(() => {
    const focusCount = sessions.filter((s) => s.mode === "focus").length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMin, 0);
    const breaks = sessions.filter((s) => s.mode !== "focus").length;
    return { focusCount, totalMinutes, breaks };
  }, [sessions]);

  const currentPreset = modeMeta[mode];
  const modeMinutes = clampMinutes((durations as Record<Mode, number>)[mode] ?? defaultDurations[mode]);
  const totalSeconds = modeMinutes * 60;
  const progress = Math.max(0, Math.min(1, 1 - secondsLeft / totalSeconds));
  const circumference = 2 * Math.PI * 132;
  const dashOffset = circumference * (1 - progress);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveJson(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    saveJson(STORAGE_KEYS.durations, durations);
  }, [durations]);

  useEffect(() => {
    saveJson(STORAGE_KEYS.sessions, sessions);
  }, [sessions]);

  useEffect(() => {
    if (mode === "focus" && secondsLeft === totalSeconds && !isRunning) return;
  }, [mode, secondsLeft, totalSeconds, isRunning]);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      endTimeRef.current = null;
      return;
    }

    endTimeRef.current = Date.now() + secondsLeft * 1000;
    timerRef.current = window.setInterval(() => {
      if (!endTimeRef.current) return;
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      setTicks((v) => v + 1);

      if (remaining <= 0) {
        window.clearInterval(timerRef.current!);
        timerRef.current = null;
        endTimeRef.current = null;
        setIsRunning(false);
        setSessions((prev) => [
          {
            id: generateId(),
            mode,
            startedAt: Date.now(),
            durationMin: modeMinutes,
          },
          ...prev,
        ].slice(0, 50));
      }
    }, 250);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const nextTotal = modeMinutes * 60;
    setSecondsLeft((prev) => Math.min(prev, nextTotal));
  }, [durations, modeMinutes, isRunning]);

    function generateId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // fallback
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

  function resetTimer(nextMode: Mode = mode) {
    setIsRunning(false);
    setMode(nextMode);
    setSecondsLeft(clampMinutes((durations as Record<Mode, number>)[nextMode] ?? defaultDurations[nextMode]) * 60);
    setTicks(0);
  }

  function toggleRun() {
    setIsRunning((v) => !v);
  }

  function skipMode() {
    const order: Mode[] = ["focus", "short", "focus", "long"];
    const next = mode === "focus" ? (sessions.filter((s) => s.mode === "focus").length + 1) % 4 === 0 ? "long" : "short" : "focus";
    const derived = next === "focus" ? "focus" : next;
    resetTimer(derived);
  }

  function applyPreset(nextMode: Mode) {
    resetTimer(nextMode);
  }

  function updateDuration(nextMode: Mode, value: number) {
    const safe = clampMinutes(value);
    setDurations((prev: any) => ({ ...prev, [nextMode]: safe }));
    if (mode === nextMode && !isRunning) {
      setSecondsLeft(safe * 60);
    }
  }

  const bgClass = theme === "dark"
    ? "bg-[#0b0d10] text-[#e0e0e0]"
    : "bg-[#f5f5f5] text-[#11151c]";

  const panelClass = theme === "dark"
    ? "border-white/10 bg-white/[0.03] shadow-[0_16px_80px_rgba(0,0,0,0.35)]"
    : "border-black/10 bg-white shadow-[0_16px_80px_rgba(17,21,28,0.08)]";

  const mutedClass = theme === "dark" ? "text-[#a0a0a0]" : "text-[#555555]";

  return (
    <div className={`min-h-screen overflow-hidden transition-colors duration-500 ${bgClass}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#5f99e8]/15 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -20, 0], y: [0, 35, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 top-40 h-96 w-96 rounded-full bg-[#5f99e8]/10 blur-3xl"
        />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className={`flex flex-col gap-4 rounded-3xl border p-5 backdrop-blur-xl ${panelClass}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#5f99e8]/25 bg-[#5f99e8]/10 px-3 py-1 text-xs font-medium text-[#5f99e8]">
                <TimerReset className="h-3.5 w-3.5" />
                Pomodoro Studio
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Минималистичный таймер для глубокой работы.
              </h1>
              <p className={`mt-2 max-w-2xl text-sm leading-6 ${mutedClass}`}>
                Всё работает во фронтенде: состояние, сохранение настроек, история сессий и визуальные эффекты без базы данных.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                onClick={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
              >
                <ThemeIcon theme={theme} />
                {theme === "dark" ? "Светлая" : "Тёмная"}
              </button>
              <button
                onClick={() => setShowSettings((v) => !v)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
              >
                <Settings2 className="h-4 w-4" />
                Настройки
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(["focus", "short", "long"] as Mode[]).map((item) => {
              const active = mode === item;
              return (
                <button
                  key={item}
                  onClick={() => applyPreset(item)}
                  className={`group rounded-2xl border p-4 text-left transition-all duration-300 ${
                    active
                      ? "border-[#5f99e8]/40 bg-[#5f99e8]/10 shadow-[0_0_0_1px_rgba(95,153,232,0.15)]"
                      : "border-white/10 bg-white/[0.02] hover:border-[#5f99e8]/25 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-xl p-2 ${active ? "bg-[#5f99e8]/20 text-[#5f99e8]" : "bg-white/5 text-inherit"}`}>
                        {modeMeta[item].icon}
                      </span>
                      <div>
                        <div className="font-medium">{presets[item].label}</div>
                        <div className={`text-xs ${mutedClass}`}>{presets[item].hint}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${active ? "text-[#5f99e8]" : mutedClass}`}>{durations[item]} мин</div>
                  </div>
                </button>
              );
            })}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            layout
            className={`relative rounded-3xl border p-6 backdrop-blur-xl ${panelClass}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5f99e8]/40 to-transparent" />

            <div className="flex flex-col items-center justify-center gap-6 py-4 sm:py-8">
              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 320 320" className="h-[280px] w-[280px] -rotate-90 sm:h-[320px] sm:w-[320px]">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#5f99e8" />
                      <stop offset="100%" stopColor="#7fb0f8" />
                    </linearGradient>
                  </defs>
                  <circle cx="160" cy="160" r="132" fill="none" stroke={theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(17,21,28,0.08)"} strokeWidth="14" />
                  <circle
                    cx="160"
                    cy="160"
                    r="132"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ filter: "drop-shadow(0 0 18px rgba(95,153,232,0.35))" }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${mode}-${secondsLeft}`}
                      initial={{ opacity: 0, scale: 0.94, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="text-6xl font-semibold tracking-tight sm:text-7xl"
                    >
                      {formatTime(secondsLeft)}
                    </motion.div>
                  </AnimatePresence>
                  <div className={`text-sm ${mutedClass}`}>{currentPreset.title} · {currentPreset.subtitle}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={toggleRun}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#5f99e8] px-6 py-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(95,153,232,0.28)] transition hover:bg-[#7fb0f8] hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isRunning ? "Пауза" : "Старт"}
                </button>

                <button
                  onClick={() => resetTimer(mode)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium transition hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Сброс
                </button>

                <button
                  onClick={skipMode}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium transition hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
                >
                  <SkipForward className="h-4 w-4" />
                  Пропустить
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Фокус‑сессий", value: stats.focusCount },
                { label: "Всего минут", value: stats.totalMinutes },
                { label: "Перерывов", value: stats.breaks },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className={`text-xs ${mutedClass}`}>{item.label}</div>
                  <div className="mt-2 text-2xl font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-6">
            <motion.aside
              layout
              className={`rounded-3xl border p-6 backdrop-blur-xl ${panelClass}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Быстрые настройки</h2>
                  <p className={`mt-1 text-sm ${mutedClass}`}>Длительности сохраняются в браузере.</p>
                </div>
                <div className="rounded-2xl bg-[#5f99e8]/10 p-3 text-[#5f99e8]">
                  <Settings2 className="h-5 w-5" />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-5 overflow-hidden"
                  >
                    <div className="space-y-4">
                      {(["focus", "short", "long"] as Mode[]).map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="mb-3 flex items-center justify-between gap-4">
                            <div>
                              <div className="font-medium">{modeMeta[item].title}</div>
                              <div className={`text-xs ${mutedClass}`}>{modeMeta[item].subtitle}</div>
                            </div>
                            <div className="min-w-14 text-right text-sm font-semibold text-[#5f99e8]">{durations[item]} мин</div>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={120}
                            value={durations[item]}
                            onChange={(e) => updateDuration(item, Number(e.target.value))}
                            className="w-full accent-[#5f99e8]"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.aside>

            <motion.aside
              layout
              className={`rounded-3xl border p-6 backdrop-blur-xl ${panelClass}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">История</h2>
                  <p className={`mt-1 text-sm ${mutedClass}`}>Последние завершённые сессии.</p>
                </div>
                <button
                  onClick={() => setSessions([])}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium transition hover:bg-white/10"
                >
                  Очистить
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {sessions.length === 0 ? (
                  <div className={`rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm ${mutedClass}`}>
                    Здесь появятся завершённые блоки работы.
                  </div>
                ) : (
                  sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div>
                        <div className="font-medium">{modeMeta[session.mode].title}</div>
                        <div className={`text-xs ${mutedClass}`}>{new Date(session.startedAt).toLocaleString("ru-RU")}</div>
                      </div>
                      <div className="text-sm font-semibold text-[#5f99e8]">{session.durationMin} мин</div>
                    </div>
                  ))
                )}
              </div>
            </motion.aside>
          </div>
        </section>

        <footer className={`rounded-3xl border px-5 py-4 text-sm backdrop-blur-xl ${panelClass} ${mutedClass}`}>
          Интерфейс полностью автономный: React state, localStorage, анимации и быстрые переключения без API и без БД.
        </footer>
      </main>
    </div>
  );
}
