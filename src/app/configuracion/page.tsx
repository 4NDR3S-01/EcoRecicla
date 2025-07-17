"use client";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import jsPDF from "jspdf";

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
      saving: "Guardando...",
      saved: "¡Guardado exitosamente!",
    },
    preferences: {
      title: "Preferencias",
      notifications: "Notificaciones",
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
      updating: "Actualizando...",
      updated: "¡Metas actualizadas!",
    },
    privacy: {
      title: "Privacidad y Seguridad",
      publicProfile: "Perfil público",
      showStats: "Mostrar estadísticas",
      dataSharing: "Compartir datos",
      deleteAccount: "Eliminar cuenta",
      confirmDelete: "¿Estás seguro de que quieres eliminar tu cuenta?",
      deleteConfirm: "ELIMINAR",
      cancel: "Cancelar",
    },
    export: {
      title: "Exportar Datos",
      subtitle: "Descarga tus datos de reciclaje",
      pdf: "Exportar como PDF",
      csv: "Exportar como CSV",
      json: "Exportar datos completos",
      exporting: "Exportando...",
    },
    messages: {
      error: "Error al guardar los cambios",
      loginRequired: "Debes iniciar sesión",
      profileRequired: "Completa tu perfil primero",
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
      saving: "Saving...",
      saved: "Successfully saved!",
    },
    preferences: {
      title: "Preferences",
      notifications: "Notifications",
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
      updating: "Updating...",
      updated: "Goals updated!",
    },
    privacy: {
      title: "Privacy & Security",
      publicProfile: "Public profile",
      showStats: "Show statistics",
      dataSharing: "Data sharing",
      deleteAccount: "Delete account",
      confirmDelete: "Are you sure you want to delete your account?",
      deleteConfirm: "DELETE",
      cancel: "Cancel",
    },
    export: {
      title: "Export Data",
      subtitle: "Download your recycling data",
      pdf: "Export as PDF",
      csv: "Export as CSV",
      json: "Export complete data",
      exporting: "Exporting...",
    },
    messages: {
      error: "Error saving changes",
      loginRequired: "You must be logged in",
      profileRequired: "Complete your profile first",
    }
  },
} as const;

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  user_id: string;
  push_notifications: boolean;
  weekly_report: boolean;
  public_profile: boolean;
  show_stats: boolean;
  data_sharing: boolean;
  created_at: string;
  updated_at: string;
}

interface RecyclingGoals {
  user_id: string;
  monthly_goal: number;
  weekly_goal: number;
  daily_reminder: boolean;
  created_at: string;
  updated_at: string;
}

export default function SettingsPage() {
  const { lang, setLang, themeMode, setThemeMode } = useAppContext();
  const t = settingsTranslations[lang];
  const router = useRouter();

  // Estados
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [goals, setGoals] = useState<RecyclingGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Estados de formularios
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    location: ''
  });

  const [preferencesForm, setPreferencesForm] = useState({
    push_notifications: true,
    weekly_report: false,
    public_profile: true,
    show_stats: true,
    data_sharing: false
  });

  const [goalsForm, setGoalsForm] = useState({
    monthly_goal: 60,
    weekly_goal: 15,
    daily_reminder: true
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Obtener usuario autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      setUser(user);
      
      // Cargar todos los datos en paralelo
      await Promise.all([
        loadUserProfile(user.id, user.email!),
        loadUserPreferences(user.id),
        loadRecyclingGoals(user.id)
      ]);

    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage({ type: 'error', text: t.messages.error });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string, email: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profileError && profileData) {
      setProfile(profileData);
      setProfileForm({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        location: profileData.location || ''
      });
    } else {
      // Crear perfil si no existe
      const newProfile = {
        id: userId,
        email: email,
        full_name: '',
        phone: '',
        location: ''
      };
      
      const { data: createdProfile } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();
      
      if (createdProfile) {
        setProfile(createdProfile);
      }
    }
  };

  const loadUserPreferences = async (userId: string) => {
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!preferencesError && preferencesData) {
      setPreferences(preferencesData);
      setPreferencesForm({
        push_notifications: preferencesData.push_notifications,
        weekly_report: preferencesData.weekly_report,
        public_profile: preferencesData.public_profile,
        show_stats: preferencesData.show_stats,
        data_sharing: preferencesData.data_sharing
      });
    } else {
      // Crear preferencias por defecto si no existen
      const defaultPreferences = {
        user_id: userId,
        email_updates: true,
        push_notifications: true,
        weekly_report: false,
        public_profile: true,
        show_stats: true,
        data_sharing: false
      };
      
      const { data: createdPreferences } = await supabase
        .from('user_preferences')
        .insert(defaultPreferences)
        .select()
        .single();
      
      if (createdPreferences) {
        setPreferences(createdPreferences);
      }
    }
  };

  const loadRecyclingGoals = async (userId: string) => {
    const { data: goalsData, error: goalsError } = await supabase
      .from('recycling_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!goalsError && goalsData) {
      setGoals(goalsData);
      setGoalsForm({
        monthly_goal: goalsData.monthly_goal,
        weekly_goal: goalsData.weekly_goal,
        daily_reminder: goalsData.daily_reminder
      });
    } else {
      // Crear metas por defecto si no existen
      const defaultGoals = {
        user_id: userId,
        monthly_goal: 60,
        weekly_goal: 15,
        daily_reminder: true
      };
      
      const { data: createdGoals } = await supabase
        .from('recycling_goals')
        .insert(defaultGoals)
        .select()
        .single();
      
      if (createdGoals) {
        setGoals(createdGoals);
      }
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          location: profileForm.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Insertar notificación real
      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          title: 'Perfil actualizado',
          body: 'Tu perfil se actualizó correctamente.',
        },
      ]);

      showMessage('success', t.profile.saved);
      await loadUserData(); // Recargar datos
      
    } catch (error) {
      console.error('Error saving profile:', error);
      showMessage('error', t.messages.error);
    } finally {
      setSaving(false);
    }
  };

  const saveGoals = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('recycling_goals')
        .update({
          monthly_goal: goalsForm.monthly_goal,
          weekly_goal: goalsForm.weekly_goal,
          daily_reminder: goalsForm.daily_reminder,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      showMessage('success', t.goals.updated);
      await loadUserData(); // Recargar datos
      
    } catch (error) {
      console.error('Error saving goals:', error);
      showMessage('error', t.messages.error);
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<typeof preferencesForm>) => {
    if (!user) return;
    
    try {
      const updatedPreferences = { ...preferencesForm, ...newPreferences };
      setPreferencesForm(updatedPreferences);
      
      const { error } = await supabase
        .from('user_preferences')
        .update({
          ...updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Insertar notificación real
      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          title: 'Preferencias actualizadas',
          body: 'Tus preferencias han sido actualizadas correctamente.',
        },
      ]);
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      showMessage('error', t.messages.error);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    
    try {
      // Eliminar datos del usuario
      await supabase.from('user_preferences').delete().eq('user_id', user.id);
      await supabase.from('recycling_goals').delete().eq('user_id', user.id);
      await supabase.from('user_profiles').delete().eq('id', user.id);
      
      // Eliminar cuenta de autenticación
      await supabase.auth.signOut();
      
      router.push('/');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      showMessage('error', t.messages.error);
    }
  };

  const exportData = async (format: 'pdf' | 'csv' | 'json') => {
    if (!user) return;
    try {
      setSaving(true);
      // Obtener registros de reciclaje del usuario
      const { data: recyclingRecords, error: recyclingError } = await supabase
        .from('recycling_records')
        .select('created_at, material_type, amount, points_earned')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (recyclingError) throw recyclingError;
      const data = {
        profile,
        preferences,
        goals,
        recyclingRecords,
        exportDate: new Date().toISOString()
      };
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecorecicla-data.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Preprocesar los datos para encabezados amigables
        const csvData = (recyclingRecords || []).map((rec: any) => ({
          'Fecha': (rec.created_at || '').split('T')[0],
          'Material': rec.material_type || '',
          'Cantidad (kg)': rec.amount ?? '',
          'Puntos': rec.points_earned ?? ''
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecorecicla-reciclaje.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text('Registros de Reciclaje', 10, 10);
        let y = 20;
        // Encabezados de tabla
        doc.setFontSize(11);
        doc.text('Fecha', 10, y);
        doc.text('Material', 55, y);
        doc.text('Cantidad (kg)', 100, y);
        doc.text('Puntos', 150, y);
        y += 7;
        doc.setLineWidth(0.1);
        doc.line(10, y, 200, y);
        y += 3;
        doc.setFontSize(10);
        (recyclingRecords || []).forEach((rec: any) => {
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text((rec.created_at || '').split('T')[0], 10, y);
          doc.text(rec.material_type || '', 55, y);
          doc.text(String(rec.amount ?? ''), 100, y);
          doc.text(String(rec.points_earned ?? ''), 150, y);
          y += 7;
        });
        doc.save('ecorecicla-reciclaje.pdf');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showMessage('error', t.messages.error);
    } finally {
      setSaving(false);
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {t.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Perfil */}
        <div className="space-y-6">
          <Card>
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
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
              />
              <Input
                type="email"
                label={t.profile.email}
                placeholder="tu@email.com"
                value={user?.email || ''}
                disabled
              />
              <Input
                type="tel"
                label={t.profile.phone}
                placeholder="+1 (555) 123-4567"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
              />
              <Input
                type="text"
                label={t.profile.location}
                placeholder="Ciudad, País"
                value={profileForm.location}
                onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
              />
              <Button 
                className="w-full" 
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? t.profile.saving : t.profile.save}
              </Button>
            </CardContent>
          </Card>

          {/* Metas */}
          <Card>
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
                value={goalsForm.monthly_goal.toString()}
                onChange={(e) => setGoalsForm({...goalsForm, monthly_goal: Number(e.target.value)})}
              />
              <Input
                type="number"
                label={t.goals.weeklyGoal}
                placeholder="15"
                value={goalsForm.weekly_goal.toString()}
                onChange={(e) => setGoalsForm({...goalsForm, weekly_goal: Number(e.target.value)})}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="dailyReminder"
                  checked={goalsForm.daily_reminder}
                  onChange={(e) => setGoalsForm({...goalsForm, daily_reminder: e.target.checked})}
                  className="rounded border-input"
                />
                <label htmlFor="dailyReminder" className="text-sm text-foreground">
                  {t.goals.dailyReminder}
                </label>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={saveGoals}
                disabled={saving}
              >
                {saving ? t.goals.updating : t.goals.update}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preferencias y Privacidad */}
        <div className="space-y-6">
          {/* Preferencias */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ {t.preferences.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{t.preferences.pushNotifications}</p>
                    <p className="text-sm text-muted-foreground">Notificaciones en tiempo real</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferencesForm.push_notifications}
                    onChange={(e) => savePreferences({ push_notifications: e.target.checked })}
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
                    checked={preferencesForm.weekly_report}
                    onChange={(e) => savePreferences({ weekly_report: e.target.checked })}
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
          <Card>
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
                    checked={preferencesForm.public_profile}
                    onChange={(e) => savePreferences({ public_profile: e.target.checked })}
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
                    checked={preferencesForm.show_stats}
                    onChange={(e) => savePreferences({ show_stats: e.target.checked })}
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
                    checked={preferencesForm.data_sharing}
                    onChange={(e) => savePreferences({ data_sharing: e.target.checked })}
                    className="rounded border-input"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  🗑️ {t.privacy.deleteAccount}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Exportar datos */}
          <Card>
            <CardHeader>
              <CardTitle>📊 {t.export.title}</CardTitle>
              <CardDescription>
                {t.export.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => exportData('pdf')}
                disabled={saving}
              >
                📄 {saving ? t.export.exporting : t.export.pdf}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => exportData('csv')}
                disabled={saving}
              >
                📊 {saving ? t.export.exporting : t.export.csv}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => exportData('json')}
                disabled={saving}
              >
                📱 {saving ? t.export.exporting : t.export.json}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-foreground mb-4">
              {t.privacy.confirmDelete}
            </h3>
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={deleteAccount}
                className="flex-1"
              >
                {t.privacy.deleteConfirm}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                {t.privacy.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 