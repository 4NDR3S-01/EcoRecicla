"use client";
import { useAppContext } from "./AppProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "./ui/Button";
import Notifications from "./ui/Notifications";
import { RecyclingModal } from "./ui/RecyclingModal";

// Traducciones para el sidebar
const sidebarTranslations = {
  es: {
    dashboard: "Panel de Control",
    statistics: "Estadísticas", 
    community: "Comunidad",
    search: "Búsqueda",
    settings: "Configuración",
    help: "Ayuda",
    logout: "Cerrar Sesión",
    profile: "Mi Perfil",
    lightMode: "Modo Claro",
    darkMode: "Modo Oscuro",
    english: "English",
    spanish: "Español",
    rewards: "Recompensas",
  },
  en: {
    dashboard: "Dashboard",
    statistics: "Statistics",
    community: "Community", 
    search: "Search",
    settings: "Settings",
    help: "Help",
    logout: "Sign Out",
    profile: "My Profile",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    english: "English",
    spanish: "Español",
    rewards: "Rewards",
  },
} as const;

// Layout principal del dashboard con sidebar y accesibilidad mejorada
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Contexto global de idioma y tema
  const { lang, setLang, setThemeMode, themeMode } = useAppContext();
  const t = sidebarTranslations[lang];
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRecyclingModal, setShowRecyclingModal] = useState(false);

  // Detectar si la ruta es híbrida
  const hybridRoutes = ["/ayuda", "/busqueda"];
  const isHybrid = hybridRoutes.some(route => pathname?.startsWith(route));

  // Cerrar sidebar móvil al navegar
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Autenticación y carga de perfil
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user && !isHybrid) {
        router.push('/login');
        setLoading(false);
        return;
      }
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user?.id)
          .single();
        if (profile) setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
      setLoading(false);
    };
    getUser();
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === 'SIGNED_OUT' || !session) && !isHybrid) {
          router.push('/login');
        } else {
          setUser(session?.user ?? null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [router, isHybrid]);

  // Logout seguro
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // Redirige a home y fuerza recarga
  };

  // Ítems de navegación
  const navigationItems = [
    { href: "/dashboard", label: t.dashboard, icon: "📊" },
    { href: "/estadisticas", label: t.statistics, icon: "📈" },
    { href: "/comunidad", label: t.community, icon: "👥" },
    { href: "/busqueda", label: t.search, icon: "🔍" },
    { href: "/recompensas", label: t.rewards, icon: "🏆" },
    { href: "/configuracion", label: t.settings, icon: "⚙️" },
    { href: "/ayuda", label: t.help, icon: "❓" },
  ];

  // Loader accesible
  if (loading) {
    return (
      <output className="min-h-screen flex items-center justify-center" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </output>
    );
  }
  if (!user && !isHybrid) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Botón hamburguesa solo en móvil */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-card border border-border rounded-md p-2 shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay oscuro en móvil */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Cerrar menú"
          tabIndex={0}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') setSidebarOpen(false);
          }}
          style={{ cursor: 'pointer' }}
        />
      )}

      {/* Sidebar responsiva y siempre fixed en desktop */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-80 bg-card border-r border-border z-50
          transition-transform duration-300
          md:translate-x-0 md:block
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:!translate-x-0
        `}
        style={{ willChange: 'transform' }}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Cerrar en móvil */}
          <div className="flex justify-end md:hidden mb-2">
            <button
              className="p-2 rounded-md hover:bg-accent"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Logo/Brand */}
          <div className="flex items-center mb-5 p-2">
            <div className="text-2xl mr-3">♻️</div>
            <span className="text-xl font-bold text-primary">EcoRecicla</span>
          </div>

          {/* User Info Mejorado con notificaciones alineadas a la derecha */}
          <div className="mb-4 p-3 bg-muted rounded-xl flex items-center gap-3 shadow-sm border border-border">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow">
              {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground truncate">{userProfile?.full_name || user?.email || "Usuario"}</p>
                <p className="text-xs text-muted-foreground">{t.profile}</p>
              </div>
              <div className="flex-shrink-0">
                <Notifications />
              </div>
            </div>
          </div>

          {/* Navegación mejorada */}
          <nav className="flex flex-col gap-1 mb-2">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-foreground transition-colors group focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 hover:bg-accent hover:text-accent-foreground ${
                  pathname === item.href 
                    ? 'bg-accent text-accent-foreground font-bold shadow' 
                    : ''
                }`}
                tabIndex={0}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm truncate">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Sección de acciones: Registrar Reciclaje, Tema e Idioma */}
          <div className="mt-6 p-3 border-t border-border flex flex-col gap-2">
            <button
              className="flex items-center w-full p-2 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors group font-semibold"
              onClick={() => setShowRecyclingModal(true)}
              aria-label="Registrar reciclaje"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowRecyclingModal(true); }}
            >
              <span className="text-xl mr-3">♻️</span>
              <span className="ml-1">Registrar Reciclaje</span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center w-full justify-start p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            >
              <span className="text-xl mr-3">{themeMode === 'dark' ? '☀️' : '🌙'}</span>
              <span className="text-sm">{themeMode === 'dark' ? t.lightMode : t.darkMode}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center w-full justify-start p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            >
              <span className="text-xl mr-3">{lang === 'es' ? '🇬🇧' : '🇪🇸'}</span>
              <span className="text-sm">{lang === 'es' ? t.english : t.spanish}</span>
            </Button>
          </div>
          {/* Botón de cerrar sesión */}
          <div className="mt-2 p-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center w-full justify-start p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleLogout}
            >
              <span className="text-xl mr-3">📕</span>
              <span className="text-sm">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 min-h-screen md:ml-64">{/* md:ml-64 para dejar espacio a la sidebar en desktop */}
        {children}
      </main>

      {/* Modal global para registrar reciclaje */}
      {showRecyclingModal && (
        <RecyclingModal isOpen={showRecyclingModal} onClose={() => setShowRecyclingModal(false)} onSuccess={() => setShowRecyclingModal(false)} />
      )}
    </div>
  );
}
