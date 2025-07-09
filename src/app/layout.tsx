import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "../components/AppProvider";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "EcoRecicla",
  description: "Sistema moderno de control de reciclaje",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head />
      <body className="antialiased bg-background text-foreground font-sans transition-colors">
        <AppProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
