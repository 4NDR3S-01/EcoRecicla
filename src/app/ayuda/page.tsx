"use client";
import { useEffect, useState } from "react";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { supabase } from "@/lib/supabaseClient";

const helpTranslations = {
  es: {
    title: "Centro de Ayuda",
    subtitle: "Encuentra respuestas a tus preguntas y aprende más sobre reciclaje",
    faq: {
      title: "Preguntas Frecuentes",
      loading: "Cargando preguntas...",
      error: "No se pudieron cargar las preguntas frecuentes.",
      empty: "No hay preguntas frecuentes disponibles.",
    },
    guides: {
      title: "Guías de Reciclaje",
      subtitle: "Aprende a reciclar correctamente",
    },
    support: {
      title: "Soporte Técnico",
      contact: "Contactar Soporte",
      email: "soporte@ecorecicla.com",
      response: "Respuesta en 24 horas",
    }
  },
  en: {
    title: "Help Center",
    subtitle: "Find answers to your questions and learn more about recycling",
    faq: {
      title: "Frequently Asked Questions",
      loading: "Loading questions...",
      error: "Could not load FAQs.",
      empty: "No FAQs available.",
    },
    guides: {
      title: "Recycling Guides",
      subtitle: "Learn to recycle correctly",
    },
    support: {
      title: "Technical Support",
      contact: "Contact Support",
      email: "support@ecorecicla.com",
      response: "Response in 24 hours",
    }
  },
} as const;

export default function HelpPage() {
  const { lang } = useAppContext();
  const t = helpTranslations[lang];
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFaqs() {
      setLoading(true);
      setError("");
      const { data, error } = await supabase.from("faqs").select("question, answer").order("id");
      if (error) setError(t.faq.error);
      else setFaqs(data || []);
      setLoading(false);
    }
    fetchFaqs();
  }, [lang]);

  const recyclingGuides = [
    {
      title: "Plástico",
      icon: "🥤",
      tips: [
        "Lava y seca antes de reciclar",
        "Retira etiquetas y tapas",
        "Aplasta para ahorrar espacio",
        "Verifica el código de reciclaje"
      ]
    },
    {
      title: "Papel",
      icon: "📄",
      tips: [
        "Separa por tipo (periódico, cartón, etc.)",
        "Mantén seco y limpio",
        "No incluyas papel con cera o plástico",
        "Retira grapas y clips"
      ]
    },
    {
      title: "Vidrio",
      icon: "🍷",
      tips: [
        "Lava completamente",
        "Separa por color",
        "No rompas las botellas",
        "Retira tapas y etiquetas"
      ]
    },
    {
      title: "Metal",
      icon: "🥫",
      tips: [
        "Lava latas de comida",
        "Aplasta para ahorrar espacio",
        "Separa aluminio de acero",
        "Retira etiquetas"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ */}
          <div className="space-y-6">
            <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle>{t.faq.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>{t.faq.loading}</p>
                ) : error ? (
                  <p>{t.faq.error}</p>
                ) : faqs.length === 0 ? (
                  <p>{t.faq.empty}</p>
                ) : (
                  <div className="space-y-4">
                    {faqs.map((item, index) => (
                      <div key={index} className="border-b border-border pb-4 last:border-b-0">
                        <h3 className="font-semibold text-foreground mb-2">
                          {item.question}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Soporte */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <CardTitle>🛠️ {t.support.title}</CardTitle>
                <CardDescription>
                  ¿Necesitas ayuda adicional? Estamos aquí para ayudarte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">📧</span>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">{t.support.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.support.response}</p>
                </div>
                <Button className="w-full" asChild>
                  <a href="mailto:soporte@ecorecicla.com">
                    {t.support.contact}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Guías de reciclaje */}
          <div className="space-y-6">
            <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <CardHeader>
                <CardTitle>{t.guides.title}</CardTitle>
                <CardDescription>{t.guides.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recyclingGuides.map((guide, index) => (
                    <div key={guide.title} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{guide.icon}</span>
                        <h3 className="font-semibold text-foreground">{guide.title}</h3>
                      </div>
                      <ul className="space-y-1">
                        {guide.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-muted-foreground flex items-start space-x-2">
                            <span className="text-primary">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Consejos adicionales */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <CardHeader>
                <CardTitle>💡 Consejos Útiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-500/10">
                    <span className="text-2xl">♻️</span>
                    <div>
                      <p className="font-medium text-foreground">Reduce y Reutiliza</p>
                      <p className="text-sm text-muted-foreground">
                        Antes de reciclar, considera si puedes reducir el consumo o reutilizar el material.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-500/10">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="font-medium text-foreground">Usa la App</p>
                      <p className="text-sm text-muted-foreground">
                        Registra tu reciclaje en tiempo real para obtener puntos y seguir tu progreso.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-purple-500/10">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="font-medium text-foreground">Involucra a Otros</p>
                      <p className="text-sm text-muted-foreground">
                        Comparte tus logros y motiva a familiares y amigos a reciclar.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sección de contacto adicional */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle>¿No encontraste lo que buscabas?</CardTitle>
              <CardDescription>
                Nuestro equipo está aquí para ayudarte con cualquier pregunta o problema
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="flex items-center space-x-2 mx-auto" asChild>
                <a href="mailto:soporte@ecorecicla.com">
                  <span>📧</span>
                  <span>Enviar Email</span>
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 