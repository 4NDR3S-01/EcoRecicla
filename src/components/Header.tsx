"use client";
import React, { useState } from "react";
import { useAppContext } from "./AppProvider";
import type { ThemeMode } from "./AppProvider";
import { Navigation, MobileNavigation } from "./ui/Navigation";

// Header principal con navegación y controles de tema/idioma
export default function Header() {
  const { lang, setLang, themeMode, setThemeMode, translations, isHydrated } = useAppContext();
  const t = translations[lang];
  const [menuOpen, setMenuOpen] = useState(false);
  const handleNavClick = () => setMenuOpen(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-foreground">EcoRecicla</span>
          </div>
          {/* Navegación desktop */}
          <Navigation items={t.menu} className="hidden md:flex" />
          {/* Controles de tema e idioma */}
          <div className="flex items-center space-x-4">
            {isHydrated && (
              <select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Cambiar tema"
              >
                <option value="system">🌐 Sistema</option>
                <option value="light">🌞 Claro</option>
                <option value="dark">🌙 Oscuro</option>
              </select>
            )}
            {isHydrated && (
              <button
                onClick={() => setLang(lang === "es" ? "en" : "es")}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3"
                aria-label="Cambiar idioma"
              >
                {lang === "es" ? "🇬🇧 EN" : "🇪🇸 ES"}
              </button>
            )}
            {/* Botón menú móvil */}
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-input hover:bg-accent hover:text-accent-foreground h-9 w-9 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menú"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Navegación móvil */}
      <MobileNavigation items={t.menu} isOpen={menuOpen} onItemClick={handleNavClick} />
    </header>
  );
}