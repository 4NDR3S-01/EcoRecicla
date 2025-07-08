"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useAppContext } from "./AppProvider";
import type { ThemeMode } from "./AppProvider";

export default function Header() {
  const { lang, setLang, themeMode, setThemeMode, translations, isHydrated } = useAppContext();
  const t = translations[lang];
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Cierra el menú móvil al navegar
  const handleNavClick = () => setMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-2 bg-white/70 dark:bg-gray-900/80 shadow-2xl backdrop-blur-2xl border-b border-green-100 dark:border-gray-800 transition-all duration-300">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold text-green-700 dark:text-green-300 tracking-tight drop-shadow select-none">🌱 EcoRecicla</span>
        </div>
        {/* Menú desktop */}
        <nav className="hidden md:flex gap-2 items-center bg-white/40 dark:bg-gray-800/70 shadow-lg rounded-full px-6 py-2 border border-green-100 dark:border-gray-700 backdrop-blur-xl transition-all duration-300">
          {t.menu.map((item: any, idx: number) => (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className="relative flex items-center gap-2 px-4 py-2 font-semibold text-green-800 transition-all duration-200 hover:text-green-900 focus:text-green-900 group hover:bg-green-100/70 rounded-full dark:text-green-200 dark:hover:text-green-100 dark:hover:bg-green-900/60 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-base">{item.label}</span>
                <span className="absolute left-1/2 -bottom-1 w-0 h-0.5 bg-green-500 rounded-full transition-all duration-300 group-hover:w-2/3 group-hover:left-1/6"></span>
              </Link>
              {idx < t.menu.length - 1 && (
                <span className="h-6 w-px bg-green-100 mx-2 dark:bg-green-800 opacity-60" aria-hidden="true"></span>
              )}
            </React.Fragment>
          ))}
          <span className="mx-2 h-6 w-px bg-green-100 dark:bg-green-800 opacity-40" aria-hidden="true"></span>
          {isHydrated && (
            <>
              <select
                value={themeMode}
                onChange={e => setThemeMode(e.target.value as ThemeMode)}
                className="mr-2 px-2 py-1 rounded bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-700 text-green-900 dark:text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="Seleccionar modo de tema"
              >
                <option value="system">🌐 Sistema</option>
                <option value="light">🌞 Claro</option>
                <option value="dark">🌙 Oscuro</option>
              </select>
              <button
                onClick={() => setLang(lang === "es" ? "en" : "es")}
                className="p-2 rounded-full bg-green-50/80 hover:bg-green-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 transition text-base font-bold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="Cambiar idioma"
              >
                {lang === "es" ? (
                  <><span role="img" aria-label="Inglés">🇬🇧</span> EN</>
                ) : (
                  <><span role="img" aria-label="Español">🇪🇸</span> ES</>
                )}
              </button>
            </>
          )}
        </nav>
        {/* Menú hamburguesa móvil */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-11 h-11 rounded-full border border-green-100 bg-white/80 shadow-lg hover:bg-green-100/80 transition-all duration-200 z-50 dark:bg-gray-800/80 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          <span className={`block w-7 h-0.5 bg-green-700 rounded transition-all duration-300 dark:bg-green-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-7 h-0.5 bg-green-700 rounded transition-all duration-300 dark:bg-green-200 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-7 h-0.5 bg-green-700 rounded transition-all duration-300 dark:bg-green-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </header>
      {/* Menú móvil */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-black/60 backdrop-blur-sm md:hidden transition-all">
          <nav className="flex flex-col gap-4 bg-white dark:bg-gray-900 rounded-b-3xl shadow-2xl mx-2 mt-2 p-6 animate-fade-in-up">
            {t.menu.map((item: any) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className="flex items-center gap-3 px-4 py-3 text-lg font-semibold text-green-800 dark:text-green-200 rounded-xl hover:bg-green-100 dark:hover:bg-green-800 transition-all duration-200"
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="flex gap-3 mt-4">
              {isHydrated && (
                <>
                
                  <select
                    value={themeMode}
                    onChange={e => setThemeMode(e.target.value as ThemeMode)} 
                    className="mr-2 px-2 py-1 rounded bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-700 text-green-900 dark:text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
                    aria-label="Seleccionar modo de tema"
                  >
                    <option value="system">🌐 Sistema</option>
                    <option value="light">🌞 Claro</option>
                    <option value="dark">🌙 Oscuro</option>
                  </select>
                  <button
                    onClick={() => setLang(lang === "es" ? "en" : "es")}
                    className="p-2 rounded-full bg-green-50/80 hover:bg-green-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 transition text-base font-bold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                    aria-label="Cambiar idioma"
                  >
                    {lang === "es" ? (
                      <><span role="img" aria-label="Inglés">🇬🇧</span> EN</>
                    ) : (
                      <><span role="img" aria-label="Español">🇪🇸</span> ES</>
                    )}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="mt-6 text-green-700 dark:text-green-200 font-bold underline"
            >
              {lang === "es" ? "Cerrar" : "Close"}
            </button>
          </nav>
        </div>
      )}
    </>
  );
}