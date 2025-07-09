"use client";
import { useAppContext } from "@/components/AppProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const statsTranslations = {
  es: {
    title: "Estadísticas Detalladas",
    subtitle: "Análisis completo de tu actividad de reciclaje",
    overview: {
      title: "Resumen General",
      totalRecycled: "Total Reciclado",
      totalPoints: "Puntos Totales",
      averagePerDay: "Promedio por Día",
      bestDay: "Mejor Día",
    },
    materials: {
      title: "Por Tipo de Material",
      plastic: "Plástico",
      paper: "Papel",
      glass: "Vidrio",
      metal: "Metal",
      organic: "Orgánico",
    },
    trends: {
      title: "Tendencias",
      weekly: "Semanal",
      monthly: "Mensual",
      yearly: "Anual",
    },
    impact: {
      title: "Impacto Ambiental",
      co2Saved: "CO₂ Ahorrado",
      treesSaved: "Árboles Salvados",
      waterSaved: "Agua Ahorrada",
      energySaved: "Energía Ahorrada",
    }
  },
  en: {
    title: "Detailed Statistics",
    subtitle: "Complete analysis of your recycling activity",
    overview: {
      title: "General Overview",
      totalRecycled: "Total Recycled",
      totalPoints: "Total Points",
      averagePerDay: "Average per Day",
      bestDay: "Best Day",
    },
    materials: {
      title: "By Material Type",
      plastic: "Plastic",
      paper: "Paper",
      glass: "Glass",
      metal: "Metal",
      organic: "Organic",
    },
    trends: {
      title: "Trends",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
    },
    impact: {
      title: "Environmental Impact",
      co2Saved: "CO₂ Saved",
      treesSaved: "Trees Saved",
      waterSaved: "Water Saved",
      energySaved: "Energy Saved",
    }
  },
} as const;

export default function StatisticsPage() {
  const { lang } = useAppContext();
  const t = statsTranslations[lang];

  // Datos simulados
  const overviewData = {
    totalRecycled: 156.8,
    totalPoints: 3140,
    averagePerDay: 2.1,
    bestDay: "Martes",
  };

  const materialsData = [
    { name: t.materials.plastic, amount: 45.2, percentage: 29, color: "bg-blue-500" },
    { name: t.materials.paper, amount: 38.5, percentage: 25, color: "bg-green-500" },
    { name: t.materials.glass, amount: 32.1, percentage: 20, color: "bg-purple-500" },
    { name: t.materials.metal, amount: 28.4, percentage: 18, color: "bg-yellow-500" },
    { name: t.materials.organic, amount: 12.6, percentage: 8, color: "bg-red-500" },
  ];

  const impactData = {
    co2Saved: 234.5,
    treesSaved: 12,
    waterSaved: 1560,
    energySaved: 890,
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumen general */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cards de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.overview.totalRecycled}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{overviewData.totalRecycled} kg</div>
                  <p className="text-xs text-muted-foreground">+15% vs mes pasado</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.overview.totalPoints}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{overviewData.totalPoints}</div>
                  <p className="text-xs text-muted-foreground">+320 este mes</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.overview.averagePerDay}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{overviewData.averagePerDay} kg</div>
                  <p className="text-xs text-muted-foreground">Consistente</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.overview.bestDay}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{overviewData.bestDay}</div>
                  <p className="text-xs text-muted-foreground">4.2 kg promedio</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de materiales */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle>{t.materials.title}</CardTitle>
                <CardDescription>
                  Distribución de materiales reciclados este mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materialsData.map((material, index) => (
                    <div key={material.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{material.name}</span>
                        <span>{material.amount} kg ({material.percentage}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`${material.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${material.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tendencias */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
              <CardHeader>
                <CardTitle>{t.trends.title}</CardTitle>
                <CardDescription>
                  Evolución de tu reciclaje en el tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
                      {t.trends.weekly}
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-accent">
                      {t.trends.monthly}
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-accent">
                      {t.trends.yearly}
                    </button>
                  </div>
                  <div className="h-48 bg-muted/50 rounded-lg flex items-end justify-center space-x-1 p-4">
                    {/* Gráfico de barras simulado */}
                    {[2, 4, 3, 5, 2, 4, 6].map((height, index) => (
                      <div
                        key={index}
                        className="bg-primary rounded-t"
                        style={{ 
                          height: `${height * 20}px`,
                          width: '20px'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Progreso semanal - Tendencia positiva 📈
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Impacto ambiental */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "700ms" }}>
              <CardHeader>
                <CardTitle>🌍 {t.impact.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <p className="font-medium text-foreground">{t.impact.co2Saved}</p>
                      <p className="text-sm text-muted-foreground">kg de CO₂</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{impactData.co2Saved}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🌳</span>
                    <div>
                      <p className="font-medium text-foreground">{t.impact.treesSaved}</p>
                      <p className="text-sm text-muted-foreground">equivalente</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{impactData.treesSaved}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💧</span>
                    <div>
                      <p className="font-medium text-foreground">{t.impact.waterSaved}</p>
                      <p className="text-sm text-muted-foreground">litros</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-600">{impactData.waterSaved}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-medium text-foreground">{t.impact.energySaved}</p>
                      <p className="text-sm text-muted-foreground">kWh</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">{impactData.energySaved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparación con otros */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "800ms" }}>
              <CardHeader>
                <CardTitle>🏆 Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🥇</span>
                      <span className="font-medium">Tú</span>
                    </div>
                    <span className="text-sm text-muted-foreground">156.8 kg</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🥈</span>
                      <span className="font-medium">María G.</span>
                    </div>
                    <span className="text-sm text-muted-foreground">142.3 kg</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🥉</span>
                      <span className="font-medium">Carlos L.</span>
                    </div>
                    <span className="text-sm text-muted-foreground">128.7 kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 