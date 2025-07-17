"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Lang = "es" | "en";
export type ThemeMode = "light" | "dark" | "system";

// Traducciones globales para la app
const translations = {
  es: {
    menu: [
      { href: "/", label: "Inicio", icon: "🏠" },
      { href: "/sobre-nosotros", label: "Sobre nosotros", icon: "ℹ️" },
      { href: "/ayuda", label: "Ayuda", icon: "❓" },
      { href: "/busqueda", label: "Búsqueda", icon: "🔍" },
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
      { href: "/ayuda", label: "Help", icon: "❓" },
      { href: "/busqueda", label: "Search", icon: "🔍" },
      { href: "/contacto", label: "Contact", icon: "✉️" },
      { href: "/login", label: "Sign in", icon: "🔑" },
      { href: "/registro", label: "Sign up", icon: "📝" },
    ],
    copyright: () => `© ${new Date().getFullYear()} EcoRecicla. All rights reserved.`,
  },
} as const;

// Tipos y contexto global para idioma, tema y preferencias
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

// Hook para consumir el contexto global
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

// Proveedor global de la app con lógica de idioma y tema
export function AppProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [lang, setLang] = useState<Lang>("es");
  
  // Inicializa themeMode desde localStorage si existe, para evitar el salto visual
  const getInitialTheme = (): ThemeMode => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eco-theme-mode") as ThemeMode | null;
      if (saved === "dark" || saved === "light" || saved === "system") return saved;
    }
    return "system";
  };
  
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Aplicar tema inicial inmediatamente
  useEffect(() => {
    const applyInitialTheme = () => {
      const initialTheme = getInitialTheme();
      let isDark = false;
      
      if (initialTheme === "dark") isDark = true;
      else if (initialTheme === "system") isDark = getSystemDark();
      
      setDarkMode(isDark);
      
      // Aplicar clase dark solo al html
      if (typeof document !== "undefined") {
        const html = document.documentElement;
        if (isDark) {
          html.classList.add("dark");
        } else {
          html.classList.remove("dark");
        }
      }
    };
    
    applyInitialTheme();
  }, []);

  // Inicializar estado después de la hidratación
  useEffect(() => {
    const savedLang = localStorage.getItem("eco-lang");
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
    else if (themeMode === "system") isDark = getSystemDark();
    
    setDarkMode(isDark);
    
    // Guarda siempre el valor actualizado
    localStorage.setItem("eco-theme-mode", themeMode);
    
    // Aplicar clase dark solo al html
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      if (isDark) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
  }, [themeMode, isHydrated]);

  // Guardar idioma en localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("eco-lang", lang);
  }, [lang, isHydrated]);

  // Si está en modo system, escuchar cambios del sistema
  useEffect(() => {
    if (themeMode !== "system" || !isHydrated) return;
    
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const isDark = mq.matches;
      setDarkMode(isDark);
      
      if (typeof document !== "undefined") {
        const html = document.documentElement;
        if (isDark) {
          html.classList.add("dark");
        } else {
          html.classList.remove("dark");
        }
      }
    };
    
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeMode, isHydrated]);

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