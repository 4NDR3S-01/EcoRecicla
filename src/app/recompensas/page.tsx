"use client";
import { useEffect, useState } from "react";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { supabase } from "@/lib/supabaseClient";

const rewardsTranslations = {
  es: {
    title: "Mis Recompensas",
    subtitle: "Canjea tus puntos por increíbles recompensas",
    myPoints: "Mis Puntos",
    available: "Disponibles",
    redeem: "Canjear",
    redeemed: "Canjeado",
    notEnoughPoints: "Puntos insuficientes",
    success: "¡Recompensa canjeada exitosamente!",
    error: "Error al canjear la recompensa",
    noRewards: "No hay recompensas disponibles",
    myRewards: "Mis Recompensas Canjeadas",
    noRedeemedRewards: "No has canjeado recompensas aún",
    points: "puntos",
  },
  en: {
    title: "My Rewards",
    subtitle: "Redeem your points for amazing rewards",
    myPoints: "My Points",
    available: "Available",
    redeem: "Redeem",
    redeemed: "Redeemed",
    notEnoughPoints: "Insufficient points",
    success: "Reward redeemed successfully!",
    error: "Error redeeming reward",
    noRewards: "No rewards available",
    myRewards: "My Redeemed Rewards",
    noRedeemedRewards: "You haven't redeemed any rewards yet",
    points: "points",
  },
} as const;

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  discount_percentage?: number;
  discount_amount?: number;
  partner_name?: string;
  partner_url?: string;
  is_active: boolean;
}

interface RedeemedReward {
  id: number;
  reward: Reward;
  redemption_code: string;
  is_used: boolean;
  created_at: string;
}

export default function RewardsPage() {
  const { lang } = useAppContext();
  const t = rewardsTranslations[lang];
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Error de autenticación:', authError);
        return;
      }
      
      // Cargar puntos del usuario
      const { data: points } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', user.id)
        .single();
      
      setUserPoints(points?.total_points || 0);

      // Cargar recompensas disponibles
      const { data: rewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      // Si no hay recompensas, crear algunas de ejemplo
      if (!rewards || rewards.length === 0) {
        await createSampleRewards();
        // Volver a cargar después de crear las recompensas de ejemplo
        const { data: newRewards } = await supabase
          .from('rewards')
          .select('*')
          .eq('is_active', true)
          .order('points_required', { ascending: true });
        setAvailableRewards(newRewards || []);
      } else {
        setAvailableRewards(rewards);
      }

      // Cargar recompensas canjeadas
      const { data: userRewards } = await supabase
        .from('user_rewards')
        .select(`
          id,
          redemption_code,
          is_used,
          created_at,
          rewards!inner(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setRedeemedRewards(userRewards?.map(ur => ({
        id: ur.id,
        reward: ur.rewards as any,
        redemption_code: ur.redemption_code,
        is_used: ur.is_used,
        created_at: ur.created_at,
      })) || []);

    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleRewards = async () => {
    const sampleRewards = [
      {
        name: "Descuento 10% EcoTienda",
        description: "10% de descuento en productos ecológicos de nuestra tienda asociada",
        points_required: 500,
        discount_percentage: 10,
        partner_name: "EcoTienda Verde",
        partner_url: "https://ecotienda.com",
        is_active: true,
      },
      {
        name: "Bolsa Reutilizable Premium",
        description: "Bolsa de tela orgánica con el logo de EcoRecicla",
        points_required: 800,
        partner_name: "EcoRecicla",
        is_active: true,
      },
      {
        name: "Descuento 20% Restaurante Verde",
        description: "20% de descuento en el restaurante orgánico Vida Verde",
        points_required: 1200,
        discount_percentage: 20,
        partner_name: "Restaurante Vida Verde",
        partner_url: "https://vidaverde.com",
        is_active: true,
      },
      {
        name: "Kit de Jardinería Urbana",
        description: "Kit completo para comenzar tu huerto urbano en casa",
        points_required: 2000,
        partner_name: "Jardín Urbano",
        is_active: true,
      },
      {
        name: "Descuento 50% Bicicleta Ecológica",
        description: "50% de descuento en bicicletas de bambú de BikeEco",
        points_required: 5000,
        discount_percentage: 50,
        partner_name: "BikeEco",
        partner_url: "https://bikeeco.com",
        is_active: true,
      },
    ];

    try {
      await supabase.from('rewards').insert(sampleRewards);
    } catch (error) {
      console.error('Error creating sample rewards:', error);
    }
  };

  const redeemReward = async (reward: Reward) => {
    try {
      if (userPoints < reward.points_required) {
        setMessage(t.notEnoughPoints);
        return;
      }

      // Obtener usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setMessage(t.error);
        return;
      }

      // Generar código de canje único
      const redemptionCode = `ECO-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

      // Insertar recompensa canjeada
      const { error: redeemError } = await supabase
        .from('user_rewards')
        .insert({
          user_id: user.id,
          reward_id: reward.id,
          points_spent: reward.points_required,
          redemption_code: redemptionCode,
          is_used: false,
        });

      if (redeemError) throw redeemError;

      // Actualizar puntos del usuario
      await supabase
        .from('user_points')
        .update({
          total_points: userPoints - reward.points_required,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      // Actualizar perfil del usuario
      await supabase
        .from('user_profiles')
        .update({
          total_points: userPoints - reward.points_required,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      setMessage(t.success);
      
      // Recargar datos
      await loadRewardsData();

    } catch (error: any) {
      console.error('Error redeeming reward:', error);
      setMessage(t.error);
    }
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

        {/* Puntos del usuario */}
        <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t.myPoints}</h2>
                <p className="text-muted-foreground">{t.available}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">{userPoints}</div>
                <p className="text-muted-foreground">{t.points}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje */}
        {message && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recompensas disponibles */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-6">Recompensas Disponibles</h2>
            
            {availableRewards.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">{t.noRewards}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableRewards.map((reward, index) => (
                  <Card key={reward.id} className="animate-fade-in-up" style={{ animationDelay: `${200 + index * 100}ms` }}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{reward.name}</span>
                        <span className="text-primary font-bold">{reward.points_required} pts</span>
                      </CardTitle>
                      {reward.partner_name && (
                        <CardDescription>Por {reward.partner_name}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                      
                      {reward.discount_percentage && (
                        <div className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                          {reward.discount_percentage}% OFF
                        </div>
                      )}
                      
                      <Button
                        className="w-full"
                        disabled={userPoints < reward.points_required}
                        onClick={() => redeemReward(reward)}
                      >
                        {userPoints < reward.points_required ? t.notEnoughPoints : t.redeem}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recompensas canjeadas */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6">{t.myRewards}</h2>
            
            {redeemedRewards.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">{t.noRedeemedRewards}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {redeemedRewards.map((userReward, index) => (
                  <Card key={userReward.id} className="animate-fade-in-up" style={{ animationDelay: `${300 + index * 100}ms` }}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground">{userReward.reward.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Canjeado el {new Date(userReward.created_at).toLocaleDateString()}
                      </p>
                      <div className="bg-muted p-2 rounded text-xs">
                        <strong>Código:</strong> {userReward.redemption_code}
                      </div>
                      {userReward.reward.partner_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => window.open(userReward.reward.partner_url, '_blank')}
                        >
                          Visitar Tienda
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
