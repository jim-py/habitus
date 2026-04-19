import { useEffect, useRef } from "react";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { features } from "@/features/home/features";

export const HomePage: React.FC = () => {
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("Detected timezone:", JSON.stringify({ timezone: tz }));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc] text-slate-900 dark:bg-[#0b0d10] dark:text-white">
      <main className="mx-auto flex-1 max-w-[1000px] px-4 pt-24">
        
        {/* Hero */}
        <section className="py-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-[#5f99e8]">
            Добро пожаловать в нашу экосистему приложений!
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Управляйте своими задачами, привычками и эффективностью в одном месте.
          </p>
        </section>

        {/* Features */}
        <section className="mb-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard
              key={f.id}
              title={f.title}
              desc={f.desc}
              locked={f.locked}
            />
          ))}
        </section>

        {/* About */}
        <section className="mx-auto mb-16 max-w-[800px] rounded-2xl border border-slate-200 bg-white p-10 shadow-sm dark:border-white/10 dark:bg-[#11151c]">
          <h2 className="mb-8 text-center text-2xl text-slate-900 dark:text-white">
            О компании Productivum
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <img
              src="/philosoph.png"
              alt="Фото Философа"
              className="h-auto w-full max-w-[300px] rounded-xl"
            />

            <div className="max-w-[600px] flex-1 space-y-4 text-slate-600 dark:text-slate-300">
              <p>Компания Productivum укрепляет мост между древней мудростью и современной технологией...</p>
              <p>Мы стремимся к гармонии в цифровом мире...</p>
              <p>Продуктивность — это искусство максимизации вашего потенциала...</p>
              <p>Присоединяйтесь к диалогу разумов с Productivum...</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#5f99e8]/30 bg-white py-4 text-center text-sm text-slate-900 dark:bg-black dark:text-white">
        <p>&copy; 2026</p>
      </footer>
    </div>
  );
};