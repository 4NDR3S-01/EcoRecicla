"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import DashboardLayout from "./DashboardLayout";
import { useAppContext } from "./AppProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// --- LayoutWrapper: elige el layout adecuado según la ruta ---
export default function LayoutWrapper({ 
  children 
}: Readonly<{ 
  children: React.ReactNode 
}>) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(undefined); // undefined: loading, null: no user, object: user
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);
  // Rutas que usan el layout del dashboard
  const dashboardRoutes = ['/dashboard', '/estadisticas', '/configuracion', '/comunidad'];
  const hybridRoutes = ['/ayuda', '/busqueda'];
  const shouldUseDashboardLayout = dashboardRoutes.some(route => pathname?.startsWith(route));
  const isHybrid = hybridRoutes.some(route => pathname?.startsWith(route));
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (shouldUseDashboardLayout || (isHybrid && user)) {
    // Para rutas del dashboard o híbridas con usuario, usar el DashboardLayout
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  // Para páginas informativas (home, login, registro, etc.), usar layout con header
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
