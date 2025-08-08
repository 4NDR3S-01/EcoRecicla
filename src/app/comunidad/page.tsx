"use client";
import { useEffect, useState, useRef } from "react";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { supabase } from "@/lib/supabaseClient";

const communityTranslations = {
  es: {
    title: "Comunidad EcoRecicla",
    subtitle: "Conecta con otros recicladores y comparte tus logros",
    challenges: {
      title: "Desafíos Activos",
      join: "Unirse",
      participants: "participantes",
      daysLeft: "días restantes",
      empty: "No hay desafíos activos",
    },
    leaders: {
      title: "Líderes del Mes",
      points: "puntos",
      recycled: "kg reciclados",
      empty: "Cargando ranking...",
    },
    achievements: {
      title: "Logros Recientes",
      congratulation: "¡Felicitaciones!",
      empty: "No hay logros recientes",
    },
    events: {
      title: "Próximos Eventos",
      register: "Registrarse",
      attendees: "asistentes",
      empty: "No hay eventos programados",
    }
  },
  en: {
    title: "EcoRecicla Community",
    subtitle: "Connect with other recyclers and share your achievements",
    challenges: {
      title: "Active Challenges",
      join: "Join",
      participants: "participants",
      daysLeft: "days left",
      empty: "No active challenges",
    },
    leaders: {
      title: "Monthly Leaders",
      points: "points",
      recycled: "kg recycled",
      empty: "Loading ranking...",
    },
    achievements: {
      title: "Recent Achievements",
      congratulation: "Congratulations!",
      empty: "No recent achievements",
    },
    events: {
      title: "Upcoming Events",
      register: "Register",
      attendees: "attendees",
      empty: "No scheduled events",
    }
  },
} as const;

interface Challenge {
  id: number;
  title: string;
  description: string;
  participants: number;
  daysLeft: number;
  progress: number;
  reward: string;
  alreadyJoined?: boolean;
}

interface Leader {
  id: string;
  name: string;
  points: number;
  recycled: number;
  avatar: string;
  isCurrentUser?: boolean;
}

interface Achievement {
  id: number;
  user: string;
  achievement: string;
  time: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  attendees: number;
  description: string;
  alreadyRegistered?: boolean;
}

export default function CommunityPage() {
  const { lang } = useAppContext();
  const t = communityTranslations[lang];
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [challengeFeedback, setChallengeFeedback] = useState<string>("");
  const [eventFeedback, setEventFeedback] = useState<string>("");
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCommunityData();
  }, []);

  useEffect(() => {
    if (userId) {
      loadChallenges();
      loadEvents();
    }
  }, [userId]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Error de autenticación:', authError);
        return;
      }
      
      // Cargar datos de la comunidad en paralelo
      await Promise.all([
        loadLeaders(user.id),
        loadRecentAchievements(),
      ]);
      
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChallenges = async () => {
    try {
      // Consultar desafíos reales
      const { data: challengesData } = await supabase
        .from('community_challenges')
        .select('id, title, description, start_date, end_date, goal_kg, reward, created_at');
      if (!challengesData) return setChallenges([]);
      // Para cada desafío, contar participantes y calcular días restantes
      const now = new Date();
      const challengesWithExtras = await Promise.all(challengesData.map(async (challenge: any) => {
        const { count: participants } = await supabase
          .from('challenge_participants')
          .select('id', { count: 'exact', head: true })
          .eq('challenge_id', challenge.id);
        const endDate = new Date(challenge.end_date);
        const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        // Progreso: suma de progress_kg de todos los participantes / goal_kg
        const { data: participantsData } = await supabase
          .from('challenge_participants')
          .select('progress_kg, user_id')
          .eq('challenge_id', challenge.id);
        const totalProgress = (participantsData || []).reduce((sum: number, p: any) => sum + (p.progress_kg || 0), 0);
        const progress = challenge.goal_kg > 0 ? Math.min(100, Math.round((totalProgress / challenge.goal_kg) * 100)) : 0;
        // Verificar si el usuario ya está inscrito
        const alreadyJoined = !!userId && (participantsData || []).some((p: any) => p.user_id === userId);
        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          participants: participants || 0,
          daysLeft,
          progress,
          reward: challenge.reward,
          alreadyJoined,
        };
      }));
      setChallenges(challengesWithExtras);
    } catch (error) {
      console.error('Error loading challenges:', error);
      setChallenges([]);
    }
  };

  const loadLeaders = async (currentUserId: string) => {
    try {
      // Obtener top usuarios por puntos totales
      const { data: topUsers } = await supabase
        .from('user_profiles')
        .select('id, full_name, total_points, total_recycled_kg')
        .order('total_points', { ascending: false })
        .limit(10);

      // Obtener información del usuario actual
      const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('id, full_name, total_points, total_recycled_kg')
        .eq('id', currentUserId)
        .single();

      if (!topUsers) return;

      const avatars = ["👩‍🦰", "👨‍🦱", "👩‍🦳", "👨‍🦲", "👩‍💼", "👨‍💼", "👩‍🔬", "👨‍🔬", "👩‍🎨", "👨‍🎨"];
      
      const leadersList: Leader[] = topUsers.map((user, index) => ({
        id: user.id,
        name: user.full_name || 'Usuario Anónimo',
        points: user.total_points || 0,
        recycled: user.total_recycled_kg || 0,
        avatar: avatars[index % avatars.length],
        isCurrentUser: user.id === currentUserId,
      }));

      // Agregar usuario actual si no está en el top 10
      if (currentUserProfile && !leadersList.find(l => l.id === currentUserId)) {
        leadersList.push({
          id: currentUserProfile.id,
          name: currentUserProfile.full_name ? currentUserProfile.full_name : 'Tú',
          points: currentUserProfile.total_points || 0,
          recycled: currentUserProfile.total_recycled_kg || 0,
          avatar: "🌟",
          isCurrentUser: true,
        });
      }

      setLeaders(leadersList);
    } catch (error) {
      console.error('Error loading leaders:', error);
    }
  };

  const loadRecentAchievements = async () => {
    try {
      // Obtener logros recientes de la comunidad
      const { data: recentAchievements } = await supabase
        .from('achievements')
        .select(`
          id,
          title,
          created_at,
          user_profiles!inner(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!recentAchievements) return;

      const achievementsList: Achievement[] = recentAchievements.map((ach) => ({
        id: ach.id,
        user: (ach.user_profiles as any)?.full_name || 'Usuario Anónimo',
        achievement: ach.title,
        time: formatTimeAgo(ach.created_at),
      }));

      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error loading achievements:', error);
      // Datos de muestra si hay error
      setAchievements([]);
    }
  };

  const loadEvents = async () => {
    try {
      // Consultar eventos reales
      const { data: eventsData } = await supabase
        .from('community_events')
        .select('id, title, description, event_date, event_time, location, created_at');
      if (!eventsData) return setEvents([]);
      // Para cada evento, contar asistentes
      const eventsWithExtras = await Promise.all(eventsData.map(async (event: any) => {
        const { count: attendees, data: attendeesData } = await supabase
          .from('event_attendees')
          .select('user_id', { count: 'exact', head: false })
          .eq('event_id', event.id);
        // Verificar si el usuario ya está inscrito
        const alreadyRegistered = !!userId && (attendeesData || []).some((a: any) => a.user_id === userId);
        return {
          id: event.id,
          title: event.title,
          date: event.event_date,
          time: event.event_time,
          attendees: attendees || 0,
          description: event.description,
          alreadyRegistered,
        };
      }));
      setEvents(eventsWithExtras);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Hace unos minutos";
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      if (!userId) return;
      const { error } = await supabase.from('challenge_participants').insert({
        challenge_id: challengeId,
        user_id: userId,
        progress_kg: 0,
        completed: false,
      });
      if (error) {
        setChallengeFeedback('Error al unirse al desafío.');
      } else {
        setChallengeFeedback('¡Te has unido al desafío!');
        await supabase.from('notifications').insert({
          user_id: userId,
          title: '¡Te has unido a un desafío!',
          body: 'Ahora participas en un desafío de la comunidad. ¡Suerte!',
        });
      }
      loadChallenges();
      setTimeout(() => setChallengeFeedback(''), 3000);
    } catch (error) {
      setChallengeFeedback('Error inesperado al unirse al desafío.');
      console.error('Error joining challenge:', error);
    }
  };

  const handleRegisterEvent = async (eventId: number) => {
    try {
      if (!userId) return;
      const { error } = await supabase.from('event_attendees').insert({
        event_id: eventId,
        user_id: userId,
      });
      if (error) {
        setEventFeedback('Error al registrarse al evento.');
      } else {
        setEventFeedback('¡Te has registrado al evento!');
        await supabase.from('notifications').insert({
          user_id: userId,
          title: '¡Te has registrado a un evento!',
          body: 'Has confirmado tu asistencia a un evento de la comunidad.',
        });
      }
      loadEvents();
      setTimeout(() => setEventFeedback(''), 3000);
    } catch (error) {
      setEventFeedback('Error inesperado al registrarse al evento.');
      console.error('Error registering for event:', error);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Desafíos */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle>{t.challenges.title}</CardTitle>
                <CardDescription>
                  Participa en desafíos y gana recompensas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {challenges.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t.challenges.empty}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleJoinChallenge(challenge.id)}
                            aria-label={`Unirse al desafío ${challenge.title}`}
                            tabIndex={0}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleJoinChallenge(challenge.id); }}
                            disabled={challenge.alreadyJoined}
                          >
                            {challenge.alreadyJoined ? 'Ya inscrito' : t.challenges.join}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{challenge.participants} {t.challenges.participants}</span>
                          <span>{challenge.daysLeft} {t.challenges.daysLeft}</span>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${challenge.progress}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-amber-600 mt-2">🎁 {challenge.reward}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Logros recientes */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <CardTitle>{t.achievements.title}</CardTitle>
                <CardDescription>
                  Celebra los logros de la comunidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t.achievements.empty}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <span className="text-2xl">🏆</span>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium text-primary">{achievement.user}</span>
                            <span className="text-muted-foreground"> logró </span>
                            <span className="font-medium text-foreground">{achievement.achievement}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{achievement.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Eventos */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <CardHeader>
                <CardTitle>{t.events.title}</CardTitle>
                <CardDescription>
                  Únete a eventos comunitarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t.events.empty}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRegisterEvent(event.id)}
                            aria-label={`Registrarse al evento ${event.title}`}
                            tabIndex={0}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleRegisterEvent(event.id); }}
                            disabled={event.alreadyRegistered}
                          >
                            {event.alreadyRegistered ? 'Ya inscrito' : t.events.register}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>📅 {event.date} a las {event.time}</span>
                          <span>👥 {event.attendees} {t.events.attendees}</span>
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
            {/* Líderes del mes */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <CardHeader>
                <CardTitle>{t.leaders.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {leaders.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">{t.leaders.empty}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaders.slice(0, 5).map((leader, index) => (
                      <div 
                        key={leader.id} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          leader.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {(() => {
                              if (index === 0) return '🥇';
                              if (index === 1) return '🥈';
                              if (index === 2) return '🥉';
                              return leader.avatar;
                            })()}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">
                              {leader.isCurrentUser ? 'Tú' : leader.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {leader.recycled.toFixed(1)} {t.leaders.recycled}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{leader.points}</p>
                          <p className="text-xs text-muted-foreground">{t.leaders.points}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {challengeFeedback && (
          <div ref={feedbackRef} className="mb-4 text-center text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 rounded-lg py-2 px-4" aria-live="polite">{challengeFeedback}</div>
        )}
        {eventFeedback && (
          <div ref={feedbackRef} className="mb-4 text-center text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 rounded-lg py-2 px-4" aria-live="polite">{eventFeedback}</div>
        )}
      </div>
    </div>
  );
}
