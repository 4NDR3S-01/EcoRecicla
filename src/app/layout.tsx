import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../components/AppProvider";
import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var darkMode = localStorage.getItem('eco-dark-mode');
                  if (darkMode === 'true') {
                    document.documentElement.classList.add('dark');
                  } else if (darkMode === 'false') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    // Si no hay configuración, no hacer nada (modo claro por defecto)
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // En caso de error, asegurar modo claro
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950 text-green-900 dark:text-green-100 transition-colors duration-500`}
      >
        <AppProvider>
          <Header />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
