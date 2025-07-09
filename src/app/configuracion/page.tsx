"use client";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const settingsTranslations = {
  es: {
    title: "Configuración",
    subtitle: "Gestiona tu perfil y preferencias",
    profile: {
      title: "Perfil de Usuario",
      name: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono",
      location: "Ubicación",
      save: "Guardar cambios",
    },
    preferences: {
      title: "Preferencias",
      notifications: "Notificaciones",
      emailUpdates: "Actualizaciones por email",
      pushNotifications: "Notificaciones push",
      weeklyReport: "Reporte semanal",
      language: "Idioma",
      theme: "Tema",
    },
    goals: {
      title: "Metas de Reciclaje",
      monthlyGoal: "Meta mensual (kg)",
      weeklyGoal: "Meta semanal (kg)",
      dailyReminder: "Recordatorio diario",
      update: "Actualizar metas",
    },
    privacy: {
      title: "Privacidad y Seguridad",
      publicProfile: "Perfil público",
      showStats: "Mostrar estadísticas",
      dataSharing: "Compartir datos",
      deleteAccount: "Eliminar cuenta",
    }
  },
  en: {
    title: "Settings",
    subtitle: "Manage your profile and preferences",
    profile: {
      title: "User Profile",
      name: "Full name",
      email: "Email",
      phone: "Phone",
      location: "Location",
      save: "Save changes",
    },
    preferences: {
      title: "Preferences",
      notifications: "Notifications",
      emailUpdates: "Email updates",
      pushNotifications: "Push notifications",
      weeklyReport: "Weekly report",
      language: "Language",
      theme: "Theme",
    },
    goals: {
      title: "Recycling Goals",
      monthlyGoal: "Monthly goal (kg)",
      weeklyGoal: "Weekly goal (kg)",
      dailyReminder: "Daily reminder",
      update: "Update goals",
    },
    privacy: {
      title: "Privacy & Security",
      publicProfile: "Public profile",
      showStats: "Show statistics",
      dataSharing: "Data sharing",
      deleteAccount: "Delete account",
    }
  },
} as const;

export default function SettingsPage() {
  const { lang, setLang, themeMode, setThemeMode } = useAppContext();
  const t = settingsTranslations[lang];

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
          {/* Perfil */}
          <div className="space-y-6">
            <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle>{t.profile.title}</CardTitle>
                <CardDescription>
                  Actualiza tu información personal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  label={t.profile.name}
                  placeholder="Tu nombre completo"
                  defaultValue="Juan Pérez"
                />
                <Input
                  type="email"
                  label={t.profile.email}
                  placeholder="tu@email.com"
                  defaultValue="juan@email.com"
                />
                <Input
                  type="tel"
                  label={t.profile.phone}
                  placeholder="+1 (555) 123-4567"
                  defaultValue="+1 (555) 123-4567"
                />
                <Input
                  type="text"
                  label={t.profile.location}
                  placeholder="Ciudad, País"
                  defaultValue="Madrid, España"
                />
                <Button className="w-full">
                  {t.profile.save}
                </Button>
              </CardContent>
            </Card>

            {/* Metas */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <CardTitle>🎯 {t.goals.title}</CardTitle>
                <CardDescription>
                  Establece tus metas de reciclaje
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="number"
                  label={t.goals.monthlyGoal}
                  placeholder="60"
                  defaultValue="60"
                />
                <Input
                  type="number"
                  label={t.goals.weeklyGoal}
                  placeholder="15"
                  defaultValue="15"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dailyReminder"
                    defaultChecked
                    className="rounded border-input"
                  />
                  <label htmlFor="dailyReminder" className="text-sm text-foreground">
                    {t.goals.dailyReminder}
                  </label>
                </div>
                <Button className="w-full" variant="outline">
                  {t.goals.update}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preferencias y Privacidad */}
          <div className="space-y-6">
            {/* Preferencias */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <CardHeader>
                <CardTitle>⚙️ {t.preferences.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{t.preferences.emailUpdates}</p>
                      <p className="text-sm text-muted-foreground">Recibe actualizaciones por email</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-input"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{t.preferences.pushNotifications}</p>
                      <p className="text-sm text-muted-foreground">Notificaciones en tiempo real</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-input"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{t.preferences.weeklyReport}</p>
                      <p className="text-sm text-muted-foreground">Reporte semanal de progreso</p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-input"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">{t.preferences.language}</label>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value as "es" | "en")}
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">{t.preferences.theme}</label>
                    <select
                      value={themeMode}
                      onChange={(e) => setThemeMode(e.target.value as "light" | "dark" | "system")}
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="system">Sistema</option>
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacidad */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <CardHeader>
                <CardTitle>🔒 {t.privacy.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{t.privacy.publicProfile}</p>
                      <p className="text-sm text-muted-foreground">Permitir que otros vean tu perfil</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-input"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{t.privacy.showStats}</p>
                      <p className="text-sm text-muted-foreground">Mostrar estadísticas en el ranking</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-input"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{t.privacy.dataSharing}</p>
                      <p className="text-sm text-muted-foreground">Compartir datos para investigación</p>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-input"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="destructive" className="w-full">
                    🗑️ {t.privacy.deleteAccount}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exportar datos */}
            <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <CardHeader>
                <CardTitle>📊 Exportar Datos</CardTitle>
                <CardDescription>
                  Descarga tus datos de reciclaje
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  📄 Exportar como PDF
                </Button>
                <Button variant="outline" className="w-full">
                  📊 Exportar como CSV
                </Button>
                <Button variant="outline" className="w-full">
                  📱 Exportar para otras apps
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 