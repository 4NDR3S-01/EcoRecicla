"use client";
import { useEffect, useState } from "react";
import { useAppContext } from "@/components/AppProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { supabase } from "@/lib/supabaseClient";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
    },
  },
  en: {
    title: "Detailed Statistics",
    subtitle: "Complete analysis of your recycling activity",
    overview: {
      title: "Overview",
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
    },
  },
} as const;

interface OverviewData {
  totalRecycled: number;
  totalPoints: number;
  averagePerDay: number;
  bestDay: string;
  bestDayAmount: number;
}

interface MaterialData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface ImpactData {
  co2Saved: number;
  treesSaved: number;
  waterSaved: number;
  energySaved: number;
}

export default function StatisticsPage() {
  const { lang } = useAppContext();
  const t = statsTranslations[lang];
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<OverviewData>({
    totalRecycled: 0,
    totalPoints: 0,
    averagePerDay: 0,
    bestDay: "N/A",
    bestDayAmount: 0,
  });
  const [materialsData, setMaterialsData] = useState<MaterialData[]>([]);
  const [impactData, setImpactData] = useState<ImpactData>({
    co2Saved: 0,
    treesSaved: 0,
    waterSaved: 0,
    energySaved: 0,
  });
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [trendData, setTrendData] = useState<number[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadStatistics();
    loadRanking();
    loadTrends();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Error de autenticación:', authError);
        return;
      }
      
      // Cargar todas las estadísticas en paralelo
      await Promise.all([
        loadOverviewData(user.id),
        loadMaterialsData(user.id),
        loadImpactData(user.id)
      ]);
      
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewData = async (userId: string) => {
    try {
      // Obtener datos del perfil
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_recycled_kg')
        .eq('id', userId)
        .single();

      // Obtener puntos totales
      const { data: points } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      // Obtener todos los registros para calcular estadísticas
      const { data: records } = await supabase
        .from('recycling_records')
        .select('amount, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!records || records.length === 0) {
        return;
      }

      // Calcular días activos
      const uniqueDays = new Set(
        records.map(record => record.created_at.split('T')[0])
      );
      const activeDays = uniqueDays.size;

      // Encontrar el mejor día
      const dailyTotals = new Map<string, number>();
      records.forEach(record => {
        const day = record.created_at.split('T')[0];
        const current = dailyTotals.get(day) || 0;
        dailyTotals.set(day, current + record.amount);
      });

      let bestDay = "N/A";
      let bestDayAmount = 0;
      for (const [day, amount] of dailyTotals.entries()) {
        if (amount > bestDayAmount) {
          bestDayAmount = amount;
          bestDay = formatDateForBestDay(day);
        }
      }

      setOverviewData({
        totalRecycled: profile?.total_recycled_kg || 0,
        totalPoints: points?.total_points || 0,
        averagePerDay: activeDays > 0 ? (profile?.total_recycled_kg || 0) / activeDays : 0,
        bestDay,
        bestDayAmount,
      });

    } catch (error) {
      console.error('Error loading overview data:', error);
    }
  };

  const loadMaterialsData = async (userId: string) => {
    try {
      const { data: records } = await supabase
        .from('recycling_records')
        .select('material_type, amount')
        .eq('user_id', userId);

      if (!records || records.length === 0) {
        return;
      }

      // Agrupar por tipo de material
      const materialTotals = new Map<string, number>();
      records.forEach(record => {
        const current = materialTotals.get(record.material_type) || 0;
        materialTotals.set(record.material_type, current + record.amount);
      });

      const total = Array.from(materialTotals.values()).reduce((sum, amount) => sum + amount, 0);

      const colors = {
        'plastic': 'bg-blue-500',
        'paper': 'bg-green-500',
        'glass': 'bg-purple-500',
        'metal': 'bg-yellow-500',
        'organic': 'bg-red-500',
      };

      const materialNames = {
        'plastic': t.materials.plastic,
        'paper': t.materials.paper,
        'glass': t.materials.glass,
        'metal': t.materials.metal,
        'organic': t.materials.organic,
      };

      const materials: MaterialData[] = Array.from(materialTotals.entries()).map(([type, amount]) => ({
        name: materialNames[type as keyof typeof materialNames] || type,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: colors[type as keyof typeof colors] || 'bg-gray-500',
      }));

      // Ordenar por cantidad (mayor a menor)
      materials.sort((a, b) => b.amount - a.amount);

      setMaterialsData(materials);

    } catch (error) {
      console.error('Error loading materials data:', error);
    }
  };

  const loadImpactData = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_recycled_kg')
        .eq('id', userId)
        .single();

      const totalRecycled = profile?.total_recycled_kg || 0;

      // Cálculos aproximados del impacto ambiental
      const impact: ImpactData = {
        co2Saved: totalRecycled * 0.5, // Aproximación: 0.5 kg CO2 por kg reciclado
        treesSaved: Math.floor(totalRecycled * 0.05), // Aproximación: 1 árbol por 20 kg
        waterSaved: totalRecycled * 10, // Aproximación: 10 litros por kg
        energySaved: totalRecycled * 3.8, // Aproximación: 3.8 kWh por kg
      };

      setImpactData(impact);

    } catch (error) {
      console.error('Error loading impact data:', error);
    }
  };

  const loadRanking = async () => {
    try {
      // Obtener top 3 y la posición del usuario actual
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, total_recycled_kg')
        .order('total_recycled_kg', { ascending: false });
      if (!profiles) return;
      setRanking(profiles.slice(0, 3));
      // Buscar posición del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const idx = profiles.findIndex((p: any) => p.id === user.id);
        setUserRank(idx >= 0 ? idx + 1 : null);
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
    }
  };

  const loadTrends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Obtener registros de las últimas 8 semanas
      const { data: records } = await supabase
        .from('recycling_records')
        .select('amount, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (!records || records.length === 0) {
        setTrendLabels([]);
        setTrendData([]);
        return;
      }
      // Agrupar por semana
      const weekMap = new Map<string, number>();
      records.forEach((rec: any) => {
        const date = new Date(rec.created_at);
        // Obtener año-semana
        const week = `${date.getFullYear()}-W${getWeekNumber(date)}`;
        weekMap.set(week, (weekMap.get(week) || 0) + rec.amount);
      });
      // Ordenar por semana
      const sortedWeeks = Array.from(weekMap.entries()).sort(([a], [b]) => a.localeCompare(b));
      setTrendLabels(sortedWeeks.map(([w]) => w));
      setTrendData(sortedWeeks.map(([, v]) => v));
    } catch (error) {
      console.error('Error loading trends:', error);
    }
  };

  function getWeekNumber(date: Date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  const formatDateForBestDay = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
  };

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
                  <div className="text-2xl font-bold text-foreground">{overviewData.totalRecycled.toFixed(1)} kg</div>
                  <p className="text-xs text-muted-foreground">acumulado</p>
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
                  <p className="text-xs text-muted-foreground">puntos ganados</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.overview.averagePerDay}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{overviewData.averagePerDay.toFixed(1)} kg</div>
                  <p className="text-xs text-muted-foreground">promedio diario</p>
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
                  <p className="text-xs text-muted-foreground">{overviewData.bestDayAmount.toFixed(1)} kg máximo</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de materiales */}
            {materialsData.length > 0 && (
              <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
                <CardHeader>
                  <CardTitle>{t.materials.title}</CardTitle>
                  <CardDescription>
                    Distribución de materiales reciclados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {materialsData.map((material) => (
                      <div key={material.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{material.name}</span>
                          <span>{material.amount.toFixed(1)} kg ({material.percentage}%)</span>
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
            )}

            {/* Tendencias reales */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
              <CardHeader>
                <CardTitle>{t.trends.title}</CardTitle>
                <CardDescription>
                  Evolución semanal de tu reciclaje
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trendLabels.length > 0 ? (
                  <Bar
                    data={{
                      labels: trendLabels,
                      datasets: [
                        {
                          label: 'Kg reciclados',
                          data: trendData,
                          backgroundColor: 'rgba(34,197,94,0.7)',
                          borderRadius: 8,
                          maxBarThickness: 32,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        x: { grid: { display: false } },
                        y: { beginAtZero: true, grid: { color: '#eee' } },
                      },
                    }}
                    height={220}
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">Sin datos suficientes para mostrar tendencias.</div>
                )}
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
                    <p className="font-bold text-green-600">{impactData.co2Saved.toFixed(1)}</p>
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
                    <p className="font-bold text-cyan-600">{impactData.waterSaved.toFixed(0)}</p>
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
                    <p className="font-bold text-yellow-600">{impactData.energySaved.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ranking real */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "800ms" }}>
              <CardHeader>
                <CardTitle>🏆 Ranking</CardTitle>
                <CardDescription>Top 3 usuarios y tu posición</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ranking.map((user, idx) => (
                    <div key={user.id} className={`flex items-center justify-between p-2 rounded-lg ${idx === 0 ? 'bg-yellow-200/40' : idx === 1 ? 'bg-gray-200/40' : 'bg-amber-100/30'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                        <span className="font-medium">{user.full_name || 'Usuario'}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{user.total_recycled_kg} kg</span>
                    </div>
                  ))}
                  {userRank && userRank > 3 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border-t border-border mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{userRank}º</span>
                        <span className="font-medium">Tú</span>
                      </div>
                      {/* Aquí podrías mostrar el total reciclado del usuario actual si lo deseas */}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
