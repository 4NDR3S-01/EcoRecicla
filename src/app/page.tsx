"use client";
import Link from "next/link";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const homeTranslations = {
  es: {
    welcome: "Bienvenido a EcoRecicla",
    description: "El sistema moderno para controlar, incentivar y mejorar el reciclaje en tu comunidad. ¡Haz la diferencia hoy!",
    start: "Comenzar",
    benefits: [
      { icon: "♻️", title: "Fácil de usar", desc: "Interfaz intuitiva para todos los usuarios." },
      { icon: "🌍", title: "Impacto ambiental", desc: "Contribuye activamente al cuidado del planeta." },
      { icon: "🏆", title: "Recompensas", desc: "Gana puntos y premios por reciclar." },
    ],
    features: {
      title: "Características Principales",
      subtitle: "Todo lo que necesitas para una gestión eficiente del reciclaje",
      items: [
        { icon: "📊", title: "Estadísticas en Tiempo Real", desc: "Monitorea tu progreso de reciclaje con datos actualizados." },
        { icon: "🎯", title: "Metas Personalizadas", desc: "Establece objetivos y celebra tus logros." },
        { icon: "👥", title: "Comunidad", desc: "Conecta con otros recicladores y comparte experiencias." },
        { icon: "📱", title: "App Móvil", desc: "Accede desde cualquier dispositivo con nuestra app." },
        { icon: "🏆", title: "Sistema de Puntos", desc: "Gana recompensas por cada acción de reciclaje." },
        { icon: "🌱", title: "Impacto Ambiental", desc: "Visualiza tu contribución al medio ambiente." },
      ]
    },
    stats: {
      title: "Nuestro Impacto",
      subtitle: "Juntos estamos haciendo la diferencia",
      items: [
        { number: "10K+", label: "Usuarios Activos" },
        { number: "50K+", label: "Kg Reciclados" },
        { number: "100+", label: "Comunidades" },
        { number: "95%", label: "Satisfacción" },
      ]
    }
  },
  en: {
    welcome: "Welcome to EcoRecicla",
    description: "The modern system to control, incentivize and improve recycling in your community. Make a difference today!",
    start: "Get started",
    benefits: [
      { icon: "♻️", title: "Easy to use", desc: "Intuitive interface for all users." },
      { icon: "🌍", title: "Environmental impact", desc: "Actively contribute to caring for the planet." },
      { icon: "🏆", title: "Rewards", desc: "Earn points and prizes for recycling." },
    ],
    features: {
      title: "Key Features",
      subtitle: "Everything you need for efficient recycling management",
      items: [
        { icon: "📊", title: "Real-time Statistics", desc: "Monitor your recycling progress with updated data." },
        { icon: "🎯", title: "Personalized Goals", desc: "Set objectives and celebrate your achievements." },
        { icon: "👥", title: "Community", desc: "Connect with other recyclers and share experiences." },
        { icon: "📱", title: "Mobile App", desc: "Access from any device with our app." },
        { icon: "🏆", title: "Points System", desc: "Earn rewards for each recycling action." },
        { icon: "🌱", title: "Environmental Impact", desc: "Visualize your contribution to the environment." },
      ]
    },
    stats: {
      title: "Our Impact",
      subtitle: "Together we are making a difference",
      items: [
        { number: "10K+", label: "Active Users" },
        { number: "50K+", label: "Kg Recycled" },
        { number: "100+", label: "Communities" },
        { number: "95%", label: "Satisfaction" },
      ]
    }
  },
} as const;

export default function Home() {
  const { lang, translations } = useAppContext();
  const t = translations[lang];
  const h = homeTranslations[lang];

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/30" />
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Hero section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {h.welcome}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {h.description}
            </p>
            <Link href="/registro">
              <Button size="lg" className="text-lg px-8 py-4">
                {h.start}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
        </section>

        {/* Benefits section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {h.benefits.map((benefit, index) => (
              <Card
                key={benefit.title}
                className="group hover-lift transition-all duration-300 animate-fade-in-up text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {benefit.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-muted/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {h.features.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {h.features.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {h.features.items.map((feature, index) => (
              <Card
                key={feature.title}
                className="group hover-lift transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {h.stats.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {h.stats.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {h.stats.items.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-8 text-center text-muted-foreground bg-card border-t">
        <div className="container mx-auto px-4">
          <p className="text-sm">
            {t.copyright()}
          </p>
        </div>
      </footer>
    </div>
  );
}
