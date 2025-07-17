"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import DashboardLayout from "./DashboardLayout";

export default function LayoutWrapper({ 
  children 
}: Readonly<{ 
  children: React.ReactNode 
}>) {
  const pathname = usePathname();
  
  // Rutas que usan el layout del dashboard
  const dashboardRoutes = ['/dashboard', '/estadisticas', '/configuracion', '/comunidad', '/busqueda', '/ayuda'];
  const shouldUseDashboardLayout = dashboardRoutes.some(route => pathname?.startsWith(route));

  if (shouldUseDashboardLayout) {
    // Para rutas del dashboard, usar el DashboardLayout
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
