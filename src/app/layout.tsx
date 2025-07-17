import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "../components/AppProvider";
import LayoutWrapper from "../components/LayoutWrapper";

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
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
