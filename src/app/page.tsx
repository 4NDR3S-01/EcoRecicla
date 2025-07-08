"use client";
import Link from "next/link";
import { useAppContext } from "@/components/AppProvider";

const homeTranslations = {
  es: {
    welcome: "Bienvenido a EcoRecicla",
    description: "El sistema moderno para controlar, incentivar y mejorar el reciclaje en tu comunidad. ¡Haz la diferencia hoy!",
    start: "Comenzar",
    benefits: [
      { icon: "♻️", title: "Fácil de usar", desc: "Interfaz intuitiva para todos los usuarios." },
      { icon: "🌍", title: "Impacto ambiental", desc: "Contribuye activamente al cuidado del planeta." },
      { icon: "🏆", title: "Recompensas", desc: "Gana puntos y premios por reciclar." },
    ],
  },
  en: {
    welcome: "Welcome to EcoRecicla",
    description: "The modern system to control, incentivize and improve recycling in your community. Make a difference today!",
    start: "Get started",
    benefits: [
      { icon: "♻️", title: "Easy to use", desc: "Intuitive interface for all users." },
      { icon: "🌍", title: "Environmental impact", desc: "Actively contribute to caring for the planet." },
      { icon: "🏆", title: "Rewards", desc: "Earn points and prizes for recycling." },
    ],
  },
} as const;

export default function Home() {
  const { lang, translations } = useAppContext();
  const t = translations[lang];
  const h = homeTranslations[lang];

  return (
    <main className="relative flex flex-col min-h-screen transition-colors duration-500 overflow-x-hidden" role="main">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-gradient-to-br from-green-200/30 via-transparent to-green-400/10 dark:from-green-900/30 dark:via-transparent dark:to-green-900/10" aria-hidden="true" />
      <section className="flex-1 flex flex-col items-center justify-center w-full px-2 sm:px-4 py-8 md:py-0" aria-labelledby="main-title">
        <div className="w-full max-w-4xl bg-white/80 dark:bg-gray-900/90 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center py-10 px-2 sm:px-6 md:px-10 animate-fade-in-up border border-white/30 dark:border-gray-800 transition-all duration-500">
          <h1 id="main-title" className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-green-800 mb-4 text-center tracking-tight dark:text-green-200 animate-fade-in drop-shadow-lg">
            {h.welcome}
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-green-900 mb-8 max-w-2xl text-center font-medium dark:text-green-100 animate-fade-in delay-100 drop-shadow">
            {h.description}
          </p>
          <Link href="/registro">
            <span className="inline-block bg-green-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold shadow-xl hover:bg-green-700 hover:scale-105 focus:scale-105 focus:ring-4 focus:ring-green-400/40 transition-all duration-200 mb-8 text-base sm:text-lg tracking-wide animate-pulse-glow outline-none focus:outline-none">
              {h.start}
            </span>
          </Link>
          <section className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-10" aria-label={lang === "es" ? "Beneficios" : "Benefits"}>
            {h.benefits.map((b, i) => (
              <article key={b.title} className={`flex flex-col items-center p-6 sm:p-7 bg-white/70 dark:bg-gray-800/80 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 dark:border-gray-700 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-fade-in-up delay-${200 + i * 100}`}> 
                <span className="text-4xl sm:text-5xl mb-3 drop-shadow-lg" aria-hidden="true">{b.icon}</span>
                <h2 className="font-bold text-lg sm:text-xl mb-2 text-green-900 dark:text-green-200 text-center drop-shadow">{b.title}</h2>
                <p className="text-sm sm:text-base font-semibold text-green-800 text-center dark:text-green-100 opacity-90">{b.desc}</p>
              </article>
            ))}
          </section>
        </div>
      </section>
      <footer className="w-full text-center py-6 text-green-800 bg-white/90 dark:bg-gray-900/90 dark:text-green-200 border-t border-green-100 dark:border-gray-800 mt-auto">
        {t.copyright()}
      </footer>
    </main>
  );
}
