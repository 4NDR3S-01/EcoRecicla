"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Lang = "es" | "en";
type ThemeMode = "light" | "dark" | "system";

const translations = {
  es: {
    menu: [
      { href: "/", label: "Inicio", icon: "🏠" },
      { href: "/sobre-nosotros", label: "Sobre nosotros", icon: "ℹ️" },
      { href: "/contacto", label: "Contacto", icon: "✉️" },
      { href: "/login", label: "Inicio de sesión", icon: "🔑" },
      { href: "/registro", label: "Registrarse", icon: "📝" },
    ],
    copyright: () => `© ${new Date().getFullYear()} EcoRecicla. Todos los derechos reservados.`,
  },
  en: {
    menu: [
      { href: "/", label: "Home", icon: "🏠" },
      { href: "/sobre-nosotros", label: "About us", icon: "ℹ️" },
      { href: "/contacto", label: "Contact", icon: "✉️" },
      { href: "/login", label: "Sign in", icon: "🔑" },
      { href: "/registro", label: "Sign up", icon: "📝" },
    ],
    copyright: () => `© ${new Date().getFullYear()} EcoRecicla. All rights reserved.`,
  },
} as const;

export type Translations = typeof translations;

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  darkMode: boolean;
  translations: Translations;
  isHydrated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext debe usarse dentro de AppProvider");
  return ctx;
}

function getSystemDark() {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

export function AppProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [lang, setLang] = useState<Lang>("es");
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Inicializar estado después de la hidratación
  useEffect(() => {
    const savedTheme = localStorage.getItem("eco-theme-mode") as ThemeMode | null;
    const savedLang = localStorage.getItem("eco-lang");
    if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") {
      setThemeMode(savedTheme);
    }
    if (savedLang === "en" || savedLang === "es") {
      setLang(savedLang);
    }
    setIsHydrated(true);
  }, []);

  // Sincroniza darkMode según themeMode
  useEffect(() => {
    if (!isHydrated) return;
    let isDark = false;
    if (themeMode === "dark") isDark = true;
    else if (themeMode === "light") isDark = false;
    else isDark = getSystemDark();
    setDarkMode(isDark);
    localStorage.setItem("eco-theme-mode", themeMode);
  }, [themeMode, isHydrated]);

  // Aplica la clase 'dark' en <html> cuando cambia darkMode
  useEffect(() => {
    if (!isHydrated) return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode, isHydrated]);

  // Guardar idioma en localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("eco-lang", lang);
  }, [lang, isHydrated]);

  // Si está en modo system, escuchar cambios del sistema
  useEffect(() => {
    if (themeMode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setDarkMode(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeMode]);

  const contextValue = React.useMemo(() => ({
    lang,
    setLang,
    themeMode,
    setThemeMode,
    darkMode,
    translations,
    isHydrated,
  }), [lang, themeMode, darkMode, isHydrated]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
} 