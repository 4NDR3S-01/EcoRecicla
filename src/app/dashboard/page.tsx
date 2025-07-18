"use client";
import { useEffect, useState } from "react";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { RecyclingModal } from "@/components/ui/RecyclingModal";
import { supabase } from "@/lib/supabaseClient";

const dashboardTranslations = {
  es: {
    title: "Panel de Control",
    subtitle: "Resumen de tu actividad de reciclaje",
    welcome: "¡Bienvenido de vuelta!",
    stats: {
      recycled: "Reciclado Hoy",
      points: "Puntos Totales",
      streak: "Racha Actual",
      co2Saved: "CO₂ Ahorrado",
    },
    goals: {
      title: "Progreso de Metas",
      monthly: "Meta Mensual",
      weekly: "Meta Semanal",
    },
    recyclingTypes: {
      title: "Reciclaje por Tipo",
      subtitle: "Distribución este mes",
    },
    recentActivity: {
      title: "Actividad Reciente",
      empty: "No tienes actividad reciente",
      add: "Registrar reciclaje",
    },
    quickActions: {
      title: "Acciones Rápidas",
      record: "Registrar Reciclaje",
      stats: "Ver Estadísticas",
      rewards: "Mis Recompensas",
      community: "Comunidad",
    },
    achievements: {
      title: "Logros",
      empty: "Aún no tienes logros",
    },
  },
  en: {
    title: "Dashboard",
    subtitle: "Summary of your recycling activity",
    welcome: "Welcome back!",
    stats: {
      recycled: "Recycled Today",
      points: "Total Points",
      streak: "Current Streak",
      co2Saved: "CO₂ Saved",
    },
    goals: {
      title: "Goal Progress",
      monthly: "Monthly Goal",
      weekly: "Weekly Goal",
    },
    recyclingTypes: {
      title: "Recycling by Type",
      subtitle: "Distribution this month",
    },
    recentActivity: {
      title: "Recent Activity",
      empty: "No recent activity",
      add: "Record recycling",
    },
    quickActions: {
      title: "Quick Actions",
      record: "Record Recycling",
      stats: "View Statistics",
      rewards: "My Rewards",
      community: "Community",
    },
    achievements: {
      title: "Achievements",
      empty: "No achievements yet",
    },
  },
} as const;

interface UserStats {
  recycled: number;
  points: number;
  streak: number;
  goalProgress: number;
  totalRecycled: number;
  co2Saved: number;
  rank: number;
  todayRecycled: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface RecyclingRecord {
  id: number;
  material_type: string;
  amount: number;
  points_earned: number;
  created_at: string;
}

interface RecyclingByType {
  type: string;
  amount: number;
  percentage: number;
  icon: string;
  color: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  progress?: number;
  unlocked_at?: string;
}

export default function DashboardPage() {
  const { lang } = useAppContext();
  const t = dashboardTranslations[lang];
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    recycled: 0,
    points: 0,
    streak: 0,
    goalProgress: 0,
    totalRecycled: 0,
    co2Saved: 0,
    rank: 0,
    todayRecycled: 0,
    weeklyGoal: 15,
    weeklyProgress: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecyclingRecord[]>([]);
  const [recyclingByType, setRecyclingByType] = useState<RecyclingByType[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showRecyclingModal, setShowRecyclingModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario autenticado
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Error de autenticación:', authError);
        return;
      }
      
      // Cargar datos en paralelo
      await Promise.all([
        loadUserStats(authUser.id),
        loadRecentActivity(authUser.id),
        loadRecyclingByType(authUser.id),
        loadAchievements(authUser.id)
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndNotifyMilestone = async (userId: string, userEmail: string, totalRecycled: number) => {
    // Consulta preferencias
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Notificación in-app
    if (prefs?.push_notifications && totalRecycled >= 10) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: "¡Nuevo logro!",
        body: "Has reciclado más de 10kg. ¡Sigue así! 🎉"
      });
    }
  };

  const loadUserStats = async (userId: string) => {
    try {
      // Obtener perfil del usuario con estadísticas
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_points, total_recycled_kg, streak_days, email')
        .eq('id', userId)
        .single();

      // Obtener puntos del usuario
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('total_points, current_streak')
        .eq('user_id', userId)
        .single();

      // Obtener metas del usuario
      const { data: goals } = await supabase
        .from('recycling_goals')
        .select('monthly_goal, weekly_goal')
        .eq('user_id', userId)
        .single();

      // Calcular reciclaje de hoy
      const today = new Date().toISOString().split('T')[0];
      const { data: todayRecords } = await supabase
        .from('recycling_records')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', today + 'T00:00:00')
        .lt('created_at', today + 'T23:59:59');

      // Calcular reciclaje de esta semana
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { data: weekRecords } = await supabase
        .from('recycling_records')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', weekStart.toISOString());

      const todayRecycled = todayRecords?.reduce((sum, record) => sum + record.amount, 0) || 0;
      const weekRecycled = weekRecords?.reduce((sum, record) => sum + record.amount, 0) || 0;
      const weeklyGoal = goals?.weekly_goal || 15;
      const monthlyGoal = goals?.monthly_goal || 60;
      
      setStats({
        recycled: todayRecycled,
        points: userPoints?.total_points || profile?.total_points || 0,
        streak: userPoints?.current_streak || profile?.streak_days || 0,
        goalProgress: ((profile?.total_recycled_kg || 0) / monthlyGoal) * 100,
        totalRecycled: profile?.total_recycled_kg || 0,
        co2Saved: (profile?.total_recycled_kg || 0) * 0.5, // Aproximación
        rank: 0, // Calcular ranking después
        todayRecycled,
        weeklyGoal,
        weeklyProgress: (weekRecycled / weeklyGoal) * 100,
      });
      // Notificar si corresponde
      if (profile && userId && profile.email) {
        await checkAndNotifyMilestone(userId, profile.email, profile.total_recycled_kg || 0);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadRecentActivity = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('recycling_records')
        .select('id, material_type, amount, points_earned, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const loadRecyclingByType = async (userId: string) => {
    try {
      // Obtener reciclaje por tipo del mes actual
      const monthStart = new Date();
      monthStart.setDate(1);
      
      const { data } = await supabase
        .from('recycling_records')
        .select('material_type, amount')
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString());

      if (!data) return;

      // Agrupar por tipo de material
      const typeMap = new Map<string, number>();
      data.forEach(record => {
        const current = typeMap.get(record.material_type) || 0;
        typeMap.set(record.material_type, current + record.amount);
      });

      const total = Array.from(typeMap.values()).reduce((sum, amount) => sum + amount, 0);
      
      const typeIcons: Record<string, { icon: string; color: string }> = {
        'plastic': { icon: '🥤', color: 'bg-blue-500' },
        'paper': { icon: '📄', color: 'bg-green-500' },
        'glass': { icon: '🍷', color: 'bg-amber-500' },
        'metal': { icon: '🥫', color: 'bg-gray-500' },
        'organic': { icon: '🍃', color: 'bg-red-500' },
      };

      const recyclingData: RecyclingByType[] = Array.from(typeMap.entries()).map(([type, amount]) => ({
        type,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        icon: typeIcons[type.toLowerCase()]?.icon || '♻️',
        color: typeIcons[type.toLowerCase()]?.color || 'bg-gray-500',
      }));

      setRecyclingByType(recyclingData);
    } catch (error) {
      console.error('Error loading recycling by type:', error);
    }
  };

  const loadAchievements = async (userId: string) => {
    try {
      // Obtener logros reales del usuario
      const { data, error } = await supabase
        .from('user_achievements')
        .select('unlocked_at, achievement:achievement_id (id, name, description, icon)')
        .eq('user_id', userId);
      if (!error && data && data.length > 0) {
        // Mapear a formato esperado por el frontend
        const realAchievements = data.map((ua: any) => ({
          id: ua.achievement.id,
          title: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          completed: true,
          unlocked_at: ua.unlocked_at
        }));
        setAchievements(realAchievements);
      } else {
        setAchievements([]);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      setAchievements([]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Hoy";
    if (diffInDays === 1) return "Ayer";
    return `Hace ${diffInDays} días`;
  };

  const quickActions = [
    { 
      title: t.quickActions.record, 
      icon: "📝", 
      color: "bg-green-500", 
      action: () => setShowRecyclingModal(true)
    },
    { 
      title: t.quickActions.stats, 
      icon: "📊", 
      color: "bg-blue-500", 
      action: () => window.location.href = "/estadisticas"
    },
    { 
      title: t.quickActions.rewards, 
      icon: "🎁", 
      color: "bg-purple-500", 
      action: () => window.location.href = "/recompensas"
    },
    { 
      title: t.quickActions.community, 
      icon: "👥", 
      color: "bg-amber-500", 
      action: () => window.location.href = "/comunidad"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <p className="text-sm text-muted-foreground mt-1">
            {t.welcome}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <span className="mr-2">📈</span>
                {t.stats.recycled}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.todayRecycled.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">hoy</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <span className="mr-2">⭐</span>
                {t.stats.points}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.points}</div>
              <p className="text-xs text-muted-foreground">puntos</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <span className="mr-2">🔥</span>
                {t.stats.streak}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
              <p className="text-xs text-muted-foreground">días consecutivos</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <span className="mr-2">🌱</span>
                {t.stats.co2Saved}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.co2Saved.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">CO₂ ahorrado</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progreso de metas */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🎯</span>
                  {t.goals.title}
                </CardTitle>
                <CardDescription>
                  Tu progreso hacia las metas establecidas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meta mensual */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{t.goals.monthly}</span>
                    <span>{Math.min(100, stats.goalProgress).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, stats.goalProgress)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalRecycled.toFixed(1)} kg de {(stats.weeklyGoal * 4).toFixed(0)} kg este mes
                  </p>
                </div>

                {/* Meta semanal */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{t.goals.weekly}</span>
                    <span>{Math.min(100, stats.weeklyProgress).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, stats.weeklyProgress)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(stats.weeklyProgress * stats.weeklyGoal / 100).toFixed(1)} kg / {stats.weeklyGoal} kg esta semana
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Distribución por tipo de reciclaje */}
            {recyclingByType.length > 0 && (
              <Card className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">📊</span>
                    {t.recyclingTypes.title}
                  </CardTitle>
                  <CardDescription>
                    {t.recyclingTypes.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recyclingByType.map((item) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="font-medium text-foreground">{item.type}</p>
                            <p className="text-sm text-muted-foreground">{item.amount.toFixed(1)} kg</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className={`${item.color} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-10">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actividad reciente */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "700ms" }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">⏰</span>
                  {t.recentActivity.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t.recentActivity.empty}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowRecyclingModal(true)}
                    >
                      {t.recentActivity.add}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div>
                            <p className="font-medium text-foreground">{activity.material_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.amount} kg • {formatDate(activity.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-primary">+{activity.points_earned} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Acciones rápidas */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "800ms" }}>
              <CardHeader>
                <CardTitle>{t.quickActions.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-transform"
                      onClick={action.action}
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <span className="text-xs text-center">{action.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Logros */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "700ms" }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🏆</span>
                  {t.achievements.title}
                </CardTitle>
                <CardDescription>
                  {t.achievements.empty}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.length === 0 ? (
                  <div className="col-span-2 text-center text-muted-foreground py-6">
                    Aún no tienes logros desbloqueados.
                  </div>
                ) : (
                  achievements.map((a) => (
                    <div key={a.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg shadow-sm">
                      <span className="text-3xl">{a.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{a.title}</div>
                        <div className="text-xs text-muted-foreground mb-1">{a.description}</div>
                        {a.unlocked_at && (
                          <div className="text-xs text-green-600 dark:text-green-400">Desbloqueado: {new Date(a.unlocked_at).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de reciclaje */}
      <RecyclingModal
        isOpen={showRecyclingModal}
        onClose={() => setShowRecyclingModal(false)}
        onSuccess={() => {
          // Recargar datos después de registrar reciclaje exitosamente
          loadDashboardData();
        }}
      />
    </div>
  );
}
