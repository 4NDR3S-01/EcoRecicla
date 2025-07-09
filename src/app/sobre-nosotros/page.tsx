"use client";
import { useAppContext } from "@/components/AppProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const aboutTranslations = {
  es: {
    title: "Sobre Nosotros",
    subtitle: "Conoce más sobre EcoRecicla y nuestra misión",
    mission: {
      title: "Nuestra Misión",
      description: "Promover el reciclaje y la sostenibilidad a través de tecnología innovadora y participación comunitaria.",
    },
    vision: {
      title: "Nuestra Visión",
      description: "Crear un mundo donde el reciclaje sea accesible, gratificante y parte de la vida cotidiana de todos.",
    },
    values: {
      title: "Nuestros Valores",
      items: [
        { icon: "🌱", title: "Sostenibilidad", desc: "Comprometidos con el cuidado del medio ambiente." },
        { icon: "🤝", title: "Comunidad", desc: "Fomentamos la colaboración y el apoyo mutuo." },
        { icon: "💡", title: "Innovación", desc: "Utilizamos tecnología para crear soluciones efectivas." },
        { icon: "🎯", title: "Impacto", desc: "Buscamos generar cambios positivos medibles." },
      ]
    },
    team: {
      title: "Nuestro Equipo",
      description: "Un grupo apasionado por la tecnología y el medio ambiente.",
    }
  },
  en: {
    title: "About Us",
    subtitle: "Learn more about EcoRecicla and our mission",
    mission: {
      title: "Our Mission",
      description: "Promote recycling and sustainability through innovative technology and community participation.",
    },
    vision: {
      title: "Our Vision",
      description: "Create a world where recycling is accessible, rewarding, and part of everyone's daily life.",
    },
    values: {
      title: "Our Values",
      items: [
        { icon: "🌱", title: "Sustainability", desc: "Committed to environmental care." },
        { icon: "🤝", title: "Community", desc: "We foster collaboration and mutual support." },
        { icon: "💡", title: "Innovation", desc: "We use technology to create effective solutions." },
        { icon: "🎯", title: "Impact", desc: "We seek to generate measurable positive changes." },
      ]
    },
    team: {
      title: "Our Team",
      description: "A group passionate about technology and the environment.",
    }
  },
} as const;

export default function AboutPage() {
  const { lang } = useAppContext();
  const t = aboutTranslations[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <div className="text-3xl mb-4">🎯</div>
                <CardTitle>{t.mission.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {t.mission.description}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <div className="text-3xl mb-4">🔮</div>
                <CardTitle>{t.vision.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {t.vision.description}
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              {t.values.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.values.items.map((value, index) => (
                <Card
                  key={value.title}
                  className="text-center group hover-lift transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {value.icon}
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {value.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t.team.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.team.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 