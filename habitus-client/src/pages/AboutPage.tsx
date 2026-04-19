import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UserRound,
  Sparkles,
  Code2,
  HeartHandshake,
  Mail,
  MapPin,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { InfoCard } from "../components/ui/InfoCard";

/**
 * Утилита расчета стажа (лет + месяцев)
 */
const calculateYearsMonths = (startDateStr: string): string => {
  const startDate = new Date(startDateStr);
  const now = new Date();

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const getYearWord = (y: number) => {
    if (y % 10 === 1 && y % 100 !== 11) return "год";
    if ([2, 3, 4].includes(y % 10) && ![12, 13, 14].includes(y % 100))
      return "года";
    return "лет";
  };

  const getMonthWord = (m: number) => {
    if (m % 10 === 1 && m % 100 !== 11) return "месяц";
    if ([2, 3, 4].includes(m % 10) && ![12, 13, 14].includes(m % 100))
      return "месяца";
    return "месяцев";
  };

  const yearsText = years > 0 ? `${years} ${getYearWord(years)}` : "";
  const monthsText = months > 0 ? `${months} ${getMonthWord(months)}` : "";

  if (yearsText && monthsText) return `${yearsText} ${monthsText}`;
  if (yearsText) return yearsText;
  return monthsText || "меньше месяца";
};

export const AboutPage: React.FC = () => {
  const [exp, setExp] = useState({
    oneC: "",
    django: "",
    self: "",
  });

  useEffect(() => {
    setExp({
      oneC: calculateYearsMonths("2023-09-13"),
      django: calculateYearsMonths("2022-10-01"),
      self: calculateYearsMonths("2022-01-01"),
    });
  }, []);

  const skills = [
    { label: "1С", icon: Code2 },
    { label: "Django", icon: Sparkles },
    { label: "Саморазвитие", icon: BookOpen },
  ];

  const stats = [
    {
      icon: MapPin,
      label: "Россия",
      value: "Ярославль",
    },
    {
      icon: GraduationCap,
      label: "Образование",
      value: "ЯГТУ · 09.03.02",
    },
    {
      icon: Code2,
      label: "1С-разработка",
      value: exp.oneC || "—",
    },
    {
      icon: Sparkles,
      label: "Django",
      value: exp.django || "—",
    },
  ];

  return (
    <PageShell>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-700 dark:text-sky-300">
            <UserRound className="h-4 w-4" />
            Обо мне
          </div>
        </motion.div>

        {/* Profile block */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-full bg-sky-500/15 blur-2xl" />
              <img
                src="/iam.jpg"
                alt="Аватар Дмитрия"
                className="h-44 w-44 rounded-full object-cover ring-4 ring-white shadow-lg dark:ring-slate-900 sm:h-52 sm:w-52"
              />
            </div>

            <div className="mt-5 space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Дмитрий
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Разработка, интерфейсы, автоматизация
              </p>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {skills.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard
            title="Обо мне"
            text={`Живу в Ярославле, окончил ЯГТУ (09.03.02).

1С-разработка — ${exp.oneC},
Django (хобби) — ${exp.django},
саморазвитие — ${exp.self}.`}
          />
          <InfoCard
            title="Благодарности"
            text="Всем участникам Простого Сообщества за тестирование и обратную связь. Отдельное спасибо Арине за помощь с дизайном."
          />
          <InfoCard
            title="Про Productivum"
            text="Началось с трекера привычек Habitus. Идея вдохновлена hwyd.me, но расширена кастомизацией и группировкой привычек."
          />
          <InfoCard
            title="Контакты"
            text={
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Написать мне в Telegram
                </p>

                <a
                  href="https://t.me/JimHoleInOne"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {/* Иконка */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-sky-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9.04 15.47l-.39 4.13c.56 0 .8-.24 1.09-.53l2.61-2.5 5.41 3.96c.99.55 1.7.26 1.96-.92l3.56-16.67h.01c.32-1.49-.54-2.07-1.5-1.71L1.9 9.3c-1.43.56-1.41 1.35-.24 1.72l5.08 1.58L18.2 5.6c.54-.33 1.03-.15.63.18" />
                  </svg>
                  Открыть Telegram
                </a>
              </div>
            }
          />{" "}
        </div>

        {/* Bottom stats strip */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span className="text-sm">{label}</span>
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                {value}
              </div>
            </div>
          ))}
        </motion.section>
      </div>
    </PageShell>
  );
};
