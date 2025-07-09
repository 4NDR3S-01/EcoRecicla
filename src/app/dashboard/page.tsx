"use client";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const dashboardTranslations = {
  es: {
    title: "Panel de Control",
    subtitle: "Gestiona tu reciclaje y sigue tu progreso",
    stats: {
      title: "Estadísticas del Mes",
      recycled: "Kg Reciclados",
      points: "Puntos Ganados",
      streak: "Días Consecutivos",
      goal: "Meta Alcanzada",
    },
    recent: {
      title: "Actividad Reciente",
      empty: "No hay actividad reciente",
    },
    goals: {
      title: "Metas del Mes",
      current: "Meta Actual",
      progress: "Progreso",
      next: "Próxima Meta",
    },
    quickActions: {
      title: "Acciones Rápidas",
      addRecycling: "Agregar Reciclaje",
      viewStats: "Ver Estadísticas",
      setGoal: "Establecer Meta",
      community: "Ver Comunidad",
    }
  },
  en: {
    title: "Dashboard",
    subtitle: "Manage your recycling and track your progress",
    stats: {
      title: "Monthly Statistics",
      recycled: "Kg Recycled",
      points: "Points Earned",
      streak: "Consecutive Days",
      goal: "Goal Reached",
    },
    recent: {
      title: "Recent Activity",
      empty: "No recent activity",
    },
    goals: {
      title: "Monthly Goals",
      current: "Current Goal",
      progress: "Progress",
      next: "Next Goal",
    },
    quickActions: {
      title: "Quick Actions",
      addRecycling: "Add Recycling",
      viewStats: "View Statistics",
      setGoal: "Set Goal",
      community: "View Community",
    }
  },
} as const;

export default function DashboardPage() {
  const { lang } = useAppContext();
  const t = dashboardTranslations[lang];

  // Datos simulados
  const stats = {
    recycled: 45.2,
    points: 1250,
    streak: 12,
    goalProgress: 75,
  };

  const recentActivity = [
    { type: "Plástico", amount: "2.5 kg", date: "Hoy", points: 50 },
    { type: "Papel", amount: "1.8 kg", date: "Ayer", points: 36 },
    { type: "Vidrio", amount: "3.2 kg", date: "Hace 2 días", points: 64 },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Estadísticas principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cards de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.stats.recycled}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.recycled}</div>
                  <p className="text-xs text-muted-foreground">+12% vs mes pasado</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.stats.points}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.points}</div>
                  <p className="text-xs text-muted-foreground">+150 esta semana</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.stats.streak}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.streak}</div>
                  <p className="text-xs text-muted-foreground">🔥 Racha activa</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.stats.goal}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.goalProgress}%</div>
                  <p className="text-xs text-muted-foreground">Meta: 60 kg</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de progreso */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle>{t.goals.title}</CardTitle>
                <CardDescription>
                  {t.goals.current}: 45.2 kg / 60 kg
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>{t.goals.progress}</span>
                    <span>{stats.goalProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.goalProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.goals.next}: 60 kg - ¡Solo faltan 14.8 kg!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actividad reciente */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
              <CardHeader>
                <CardTitle>{t.recent.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {activity.type === "Plástico" ? "🥤" : 
                             activity.type === "Papel" ? "📄" : "🍷"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{activity.type}</p>
                            <p className="text-sm text-muted-foreground">{activity.amount} • {activity.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">+{activity.points}</p>
                          <p className="text-xs text-muted-foreground">puntos</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {t.recent.empty}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Acciones rápidas */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "700ms" }}>
              <CardHeader>
                <CardTitle>{t.quickActions.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <span className="mr-2">➕</span>
                  {t.quickActions.addRecycling}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <span className="mr-2">📊</span>
                  {t.quickActions.viewStats}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <span className="mr-2">🎯</span>
                  {t.quickActions.setGoal}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <span className="mr-2">👥</span>
                  {t.quickActions.community}
                </Button>
              </CardContent>
            </Card>

            {/* Logros */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "800ms" }}>
              <CardHeader>
                <CardTitle>🏆 Logros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-primary/10">
                    <span className="text-2xl">🥇</span>
                    <div>
                      <p className="font-medium text-foreground">Primera Semana</p>
                      <p className="text-xs text-muted-foreground">Completada</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                    <span className="text-2xl">🥈</span>
                    <div>
                      <p className="font-medium text-foreground">Meta Mensual</p>
                      <p className="text-xs text-muted-foreground">75% completado</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                    <span className="text-2xl">🥉</span>
                    <div>
                      <p className="font-medium text-foreground">Racha de 30 días</p>
                      <p className="text-xs text-muted-foreground">12/30 días</p>
                    </div>
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