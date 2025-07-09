"use client";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const communityTranslations = {
  es: {
    title: "Comunidad EcoRecicla",
    subtitle: "Conecta con otros recicladores y comparte tus logros",
    challenges: {
      title: "Desafíos Activos",
      join: "Unirse",
      participants: "participantes",
      daysLeft: "días restantes",
    },
    leaders: {
      title: "Líderes del Mes",
      points: "puntos",
      recycled: "kg reciclados",
    },
    achievements: {
      title: "Logros Recientes",
      congratulation: "¡Felicitaciones!",
    },
    events: {
      title: "Próximos Eventos",
      register: "Registrarse",
      attendees: "asistentes",
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
    },
    leaders: {
      title: "Monthly Leaders",
      points: "points",
      recycled: "kg recycled",
    },
    achievements: {
      title: "Recent Achievements",
      congratulation: "Congratulations!",
    },
    events: {
      title: "Upcoming Events",
      register: "Register",
      attendees: "attendees",
    }
  },
} as const;

export default function CommunityPage() {
  const { lang } = useAppContext();
  const t = communityTranslations[lang];

  // Datos simulados
  const challenges = [
    {
      id: 1,
      title: "Desafío Semanal Verde",
      description: "Recicla 20 kg de materiales en 7 días",
      participants: 45,
      daysLeft: 3,
      progress: 75,
      reward: "500 puntos + Insignia Verde",
    },
    {
      id: 2,
      title: "Reto Plástico Cero",
      description: "Evita usar plásticos de un solo uso por 30 días",
      participants: 128,
      daysLeft: 15,
      progress: 60,
      reward: "1000 puntos + Insignia Eco",
    },
  ];

  const leaders = [
    { name: "María González", points: 3420, recycled: 156.8, avatar: "👩‍🦰" },
    { name: "Carlos López", points: 2980, recycled: 142.3, avatar: "👨‍🦱" },
    { name: "Ana Martínez", points: 2750, recycled: 128.7, avatar: "👩‍🦳" },
    { name: "Luis Rodríguez", points: 2510, recycled: 115.2, avatar: "👨‍🦲" },
    { name: "Tú", points: 3140, recycled: 145.6, avatar: "🌟" },
  ];

  const achievements = [
    { user: "María G.", achievement: "Primera Semana Completa", time: "Hace 2 horas" },
    { user: "Carlos L.", achievement: "Meta Mensual Alcanzada", time: "Hace 4 horas" },
    { user: "Ana M.", achievement: "Racha de 30 Días", time: "Hace 6 horas" },
    { user: "Luis R.", achievement: "1000 Puntos Ganados", time: "Hace 8 horas" },
  ];

  const events = [
    {
      title: "Taller de Compostaje",
      date: "15 de Diciembre",
      time: "10:00 AM",
      attendees: 23,
      description: "Aprende a hacer compost en casa",
    },
    {
      title: "Limpieza Comunitaria",
      date: "22 de Diciembre",
      time: "9:00 AM",
      attendees: 45,
      description: "Jornada de limpieza en el parque local",
    },
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
                <div className="space-y-4">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          {t.challenges.join}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{challenge.participants} {t.challenges.participants}</span>
                          <span>{challenge.daysLeft} {t.challenges.daysLeft}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${challenge.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Recompensa: {challenge.reward}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Líderes */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <CardTitle>{t.leaders.title}</CardTitle>
                <CardDescription>
                  Los recicladores más activos este mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaders.map((leader, index) => (
                    <div key={leader.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{leader.avatar}</div>
                        <div>
                          <p className="font-medium text-foreground">{leader.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {leader.recycled} {t.leaders.recycled}
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Logros recientes */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <CardHeader>
                <CardTitle>🏆 {t.achievements.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">🎉</div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{achievement.user}</p>
                          <p className="text-sm text-muted-foreground">{achievement.achievement}</p>
                          <p className="text-xs text-muted-foreground">{achievement.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Eventos */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <CardHeader>
                <CardTitle>📅 {t.events.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <Button size="sm" variant="outline">
                          {t.events.register}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{event.date} • {event.time}</span>
                        <span>{event.attendees} {t.events.attendees}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de la comunidad */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle>📊 Estadísticas Comunitarias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Miembros activos</span>
                    <span className="font-bold text-foreground">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total reciclado</span>
                    <span className="font-bold text-foreground">45.2 ton</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">CO₂ ahorrado</span>
                    <span className="font-bold text-foreground">12.8 ton</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Desafíos completados</span>
                    <span className="font-bold text-foreground">156</span>
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