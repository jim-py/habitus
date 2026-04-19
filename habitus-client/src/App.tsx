import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { LoginForm, RegisterForm, ForgotForm } from "@/components/forms/AuthForms";
import { Navbar } from "@/components/layout/NavBar";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import TimeTrackerPage from "@/pages/TimeTrackerPage";
import PomodoroPage from "@/pages/PomodoroPage";
import { ProfileContainer } from "@/context/ProfileContainer";
import { SectionPage } from "@/pages/SectionPage";
import { HabitusSection } from "@/features/habitus/HabitusSection";
import { registerSW } from "./pwa/registerSW";

import type { Page } from "@/types/pages";

const STORAGE_KEY = "app-state:v2";

const PUBLIC_PAGES = ["home", "login", "register", "forgot", "about"] as const;
const AUTH_PAGES = ["habitus", "todos", "pomodoro", "math", "profile", "about"] as const;

type PublicPage = (typeof PUBLIC_PAGES)[number];
type AuthPage = (typeof AUTH_PAGES)[number];

type StoredState = {
  publicPage: PublicPage;
  authPage: AuthPage;
};

const DEFAULT_STATE: StoredState = {
  publicPage: "home",
  authPage: "habitus",
};

function isPublicPage(value: string): value is PublicPage {
  return (PUBLIC_PAGES as readonly string[]).includes(value);
}

function isAuthPage(value: string): value is AuthPage {
  return (AUTH_PAGES as readonly string[]).includes(value);
}

function readStoredState(): StoredState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as Partial<StoredState>;

    return {
      publicPage:
        typeof parsed.publicPage === "string" && isPublicPage(parsed.publicPage)
          ? parsed.publicPage
          : DEFAULT_STATE.publicPage,
      authPage:
        typeof parsed.authPage === "string" && isAuthPage(parsed.authPage)
          ? parsed.authPage
          : DEFAULT_STATE.authPage,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveStoredState(state: StoredState) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage может быть недоступен или переполнен
  }
}

const pageTransition = {
  initial: { opacity: 0, y: 14, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, filter: "blur(4px)" },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

const loadingSteps = [
  "Инициализация",
  "Проверка сессии",
];

function LoadingScreen() {
  return (
    <div className="relative min-h-[100dvh] bg-[#f5f5f5] text-[#11151c] transition-colors duration-300 dark:bg-[#0b0d10] dark:text-[#e0e0e0]">
      
      {/* фон (очень лёгкий, почти незаметный) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-[#5f99e8]/10 blur-3xl dark:bg-[#5f99e8]/15" />
      </div>

      <div className="relative flex min-h-[100dvh] items-center justify-center px-4">
        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xs sm:max-w-sm"
        >
          
          {/* карточка */}
          <div className="rounded-2xl border border-black/5 bg-[#ffffff]/80 p-6 backdrop-blur-md transition-colors duration-300 dark:border-white/10 dark:bg-[#11151c]/80 sm:p-8">
            
            <div className="flex flex-col items-center text-center">
              
              {/* loader */}
              <div className="relative mb-6">
                <div className="h-12 w-12 rounded-full border border-black/10 dark:border-white/10" />

                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#5f99e8]"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              </div>

              {/* заголовок */}
              <h1 className="text-lg font-medium sm:text-xl">
                Загрузка
              </h1>

              {/* статус */}
              <motion.div
                className="mt-3 text-sm text-[#555555] dark:text-[#a0a0a0]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <LoadingText />
              </motion.div>

              {/* прогресс линия */}
              <div className="mt-6 w-full">
                <div className="h-[2px] w-full overflow-hidden bg-black/10 dark:bg-white/10">
                  <motion.div
                    className="h-full w-1/3 bg-[#5f99e8]"
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  />
                </div>
              </div>

            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}


/* отдельный компонент для смены текста */
function LoadingText() {
  return (
    <motion.span
      key="loading-text"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedSteps />
    </motion.span>
  );
}

function AnimatedSteps() {
  return (
    <motion.span
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      {loadingSteps.join(" • ")}
    </motion.span>
  );
}
export function App() {
  useEffect(() => {
    registerSW();
  }, []);
  
  const storedState = readStoredState();

  const [user, setUser] = useState<any | null>(null);

  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState<Page>(storedState.publicPage);
  const [stateCache, setStateCache] = useState<StoredState>(storedState);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setLoggedIn(true);
          setPage(stateCache.authPage);
        } else {
          setLoggedIn(false);
          setPage(stateCache.publicPage);
        }
      } catch {
        setLoggedIn(false);
        setPage(stateCache.publicPage);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;

    setStateCache((prev) => {
      const next: StoredState = { ...prev };

      if (loggedIn) {
        if (isAuthPage(page)) {
          next.authPage = page;
        }
      } else {
        if (isPublicPage(page)) {
          next.publicPage = page;
        }
      }

      saveStoredState(next);
      return next;
    });
  }, [page, loggedIn, loading]);

  const handleNavigate = (nextPage: Page, isLoggedIn?: boolean) => {
    if (isLoggedIn !== undefined) {
      setLoggedIn(isLoggedIn);
    }
    setPage(nextPage);
  };

  const renderPage = () => {
    if (!loggedIn) {
      switch (page) {
        case "home":
          return <HomePage />;

        case "login":
          return (
            <LoginForm
              key="login"
              onModeChange={(mode) => setPage(mode)}
              onSuccess={async () => {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (res.ok) {
    const data = await res.json();
    setUser(data.user);
    setLoggedIn(true);
    setPage("habitus");
  }
}}
            />
          );

        case "register":
          return (
            <RegisterForm
              key="register"
              onModeChange={(mode) => setPage(mode)}
              onSuccess={async () => {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (res.ok) {
    const data = await res.json();
    setUser(data.user);
    setLoggedIn(true);
    setPage("habitus");
  }
}}
            />
          );

        case "forgot":
          return <ForgotForm key="forgot" onModeChange={(mode) => setPage(mode)} />;

        case "about":
          return <AboutPage />;

        default:
          return <HomePage />;
      }
    }

    switch (page) {
      case "habitus":
        return <HabitusSection />;

      case "todos":
        return <SectionPage title="Actus" description="Раздел задач и ежедневных дел." />;

      case "pomodoro":
        return <PomodoroPage />;

      case "math":
        return <TimeTrackerPage />;

      case "profile":
        return <ProfileContainer user={user} loading={loading} onPageChange={handleNavigate} />;
        
      case "about":
        return <AboutPage />;

      default:
        return <HabitusSection />;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f5f5] text-[#11151c] transition-colors duration-300 dark:bg-[#0b0d10] dark:text-[#e0e0e0]">
      <Navbar loggedIn={loggedIn} currentPage={page} onNavigate={handleNavigate} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={page} {...pageTransition}>
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;