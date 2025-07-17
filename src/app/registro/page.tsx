"use client";
import Link from "next/link";
import { useAppContext } from "@/components/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const registerTranslations = {
  es: {
    title: "Crear Cuenta",
    subtitle: "Únete a EcoRecicla y comienza a hacer la diferencia",
    personal: {
      title: "Información Personal",
      fullName: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono (opcional)",
      location: "Ciudad, País",
    },
    account: {
      title: "Información de Cuenta",
      password: "Contraseña",
      confirmPassword: "Confirmar contraseña",
    },
    goals: {
      title: "Metas Iniciales",
      monthlyGoal: "Meta mensual de reciclaje (kg)",
      weeklyGoal: "Meta semanal de reciclaje (kg)",
      dailyReminder: "Recibir recordatorios diarios",
    },
    preferences: {
      title: "Preferencias",
      emailUpdates: "Recibir actualizaciones por email",
      weeklyReport: "Reporte semanal de progreso",
      publicProfile: "Hacer mi perfil público",
    },
    register: "Crear cuenta",
    creating: "Creando cuenta...",
    haveAccount: "¿Ya tienes cuenta?",
    login: "Inicia sesión aquí",
    terms: "Al registrarte, aceptas nuestros términos y condiciones",
    error: "Ocurrió un error al crear la cuenta.",
    passwordMismatch: "Las contraseñas no coinciden.",
    passwordMinLength: "La contraseña debe tener al menos 6 caracteres.",
    emailInvalid: "Ingresa un email válido.",
    nameRequired: "El nombre es obligatorio.",
    success: "¡Cuenta creada exitosamente! Bienvenido a EcoRecicla.",
    redirecting: "Redirigiendo al dashboard...",
  },
  en: {
    title: "Create Account",
    subtitle: "Join EcoRecicla and start making a difference",
    personal: {
      title: "Personal Information",
      fullName: "Full name",
      email: "Email",
      phone: "Phone (optional)",
      location: "City, Country",
    },
    account: {
      title: "Account Information",
      password: "Password",
      confirmPassword: "Confirm password",
    },
    goals: {
      title: "Initial Goals",
      monthlyGoal: "Monthly recycling goal (kg)",
      weeklyGoal: "Weekly recycling goal (kg)",
      dailyReminder: "Receive daily reminders",
    },
    preferences: {
      title: "Preferences",
      emailUpdates: "Receive email updates",
      weeklyReport: "Weekly progress report",
      publicProfile: "Make my profile public",
    },
    register: "Create account",
    creating: "Creating account...",
    haveAccount: "Already have an account?",
    login: "Sign in here",
    terms: "By registering, you agree to our terms and conditions",
    error: "There was an error creating the account.",
    passwordMismatch: "Passwords do not match.",
    passwordMinLength: "Password must be at least 6 characters.",
    emailInvalid: "Enter a valid email.",
    nameRequired: "Name is required.",
    success: "Account created successfully! Welcome to EcoRecicla.",
    redirecting: "Redirecting to dashboard...",
  },
} as const;

interface RegisterForm {
  // Información personal
  fullName: string;
  email: string;
  phone: string;
  location: string;
  // Cuenta
  password: string;
  confirmPassword: string;
  // Metas
  monthlyGoal: number;
  weeklyGoal: number;
  dailyReminder: boolean;
  // Preferencias
  weeklyReport: boolean;
  publicProfile: boolean;
}

export default function RegisterPage() {
  const { lang } = useAppContext();
  const t = registerTranslations[lang];
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    // Información personal
    fullName: "",
    email: "",
    phone: "",
    location: "",
    // Cuenta
    password: "",
    confirmPassword: "",
    // Metas (valores por defecto razonables)
    monthlyGoal: 60,
    weeklyGoal: 15,
    dailyReminder: true,
    // Preferencias (valores por defecto amigables)
    weeklyReport: false,
    publicProfile: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    let newValue: any;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      newValue = Number(value);
    } else {
      newValue = value;
    }
    
    setForm({
      ...form,
      [name]: newValue,
    });
  };

  const validateForm = (): string | null => {
    if (!form.fullName.trim()) {
      return t.nameRequired;
    }
    if (!form.email.includes("@")) {
      return t.emailInvalid;
    }
    if (form.password.length < 6) {
      return t.passwordMinLength;
    }
    if (form.password !== form.confirmPassword) {
      return t.passwordMismatch;
    }
    return null;
  };

  const updateOrCreateProfile = async (userId: string) => {
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: form.fullName,
          phone: form.phone || null,
          location: form.location || null,
        })
        .eq("id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("user_profiles").insert({
        id: userId,
        email: form.email,
        full_name: form.fullName,
        phone: form.phone || null,
        location: form.location || null,
      });
      if (error) throw error;
    }
  };

  const updateOrCreatePreferences = async (userId: string) => {
    const { data: existingPrefs } = await supabase
      .from("user_preferences")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    const prefsData = {
      weekly_report: form.weeklyReport,
      public_profile: form.publicProfile,
      show_stats: form.publicProfile,
    };

    if (existingPrefs) {
      const { error } = await supabase
        .from("user_preferences")
        .update(prefsData)
        .eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("user_preferences").insert({
        user_id: userId,
        ...prefsData,
        push_notifications: true,
        data_sharing: false,
      });
      if (error) throw error;
    }
  };

  const updateOrCreateGoals = async (userId: string) => {
    const { data: existingGoals } = await supabase
      .from("recycling_goals")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    const goalsData = {
      monthly_goal: form.monthlyGoal,
      weekly_goal: form.weeklyGoal,
      daily_reminder: form.dailyReminder,
    };

    if (existingGoals) {
      const { error } = await supabase
        .from("recycling_goals")
        .update(goalsData)
        .eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("recycling_goals").insert({
        user_id: userId,
        ...goalsData,
      });
      if (error) throw error;
    }
  };

  const ensureUserPoints = async (userId: string) => {
    const { data: existingPoints } = await supabase
      .from("user_points")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (!existingPoints) {
      const { error } = await supabase.from("user_points").insert({
        user_id: userId,
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
      });
      if (error) throw error;
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      console.log("🔍 Configurando perfil para usuario:", userId);
      
      // Esperar un poco para que el trigger automático termine
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Procesar cada sección por separado
      await updateOrCreateProfile(userId);
      console.log("✅ Perfil procesado");

      await updateOrCreatePreferences(userId);
      console.log("✅ Preferencias procesadas");

      await updateOrCreateGoals(userId);
      console.log("✅ Metas procesadas");

      await ensureUserPoints(userId);
      console.log("✅ Puntos verificados");

    } catch (error) {
      console.error("❌ Error configurando perfil:", error);
      throw error;
    }
  };

  const getErrorMessage = (error: any): string => {
    if (!error.message) return t.error;
    const message = error.message;

    // Errores de configuración de Supabase
    if (message.includes("Variables de entorno de Supabase no configuradas")) {
      return "❌ Error de configuración: Faltan las variables de entorno de Supabase. Revisa el archivo ENV_SETUP.md para configurar correctamente.";
    }
    if (message.includes("fetch") || message.includes("Failed to fetch")) {
      return "❌ Error de conexión: No se puede conectar a Supabase. Verifica tu conexión a internet y las credenciales.";
    }

    // Errores de autenticación
    if (message.includes("Email rate limit exceeded")) {
      return "⚠️ Demasiados intentos. Espera unos minutos antes de intentar de nuevo.";
    }
    if (message.includes("Invalid email")) {
      return "⚠️ El formato del email no es válido.";
    }
    if (message.includes("Password should be")) {
      return "⚠️ La contraseña debe tener al menos 6 caracteres.";
    }
    if (message.includes("User already registered")) {
      return "⚠️ Este email ya está registrado. ¿Quieres iniciar sesión?";
    }
    if (message.includes("Unable to validate email address")) {
      return "⚠️ No se pudo validar el email. Verifica que el email sea correcto.";
    }

    // Errores de base de datos
    if (message.includes("relation") && message.includes("does not exist")) {
      return "❌ Error de base de datos: Las tablas no están creadas. Ejecuta el script SQL en Supabase.";
    }
    if (message.includes("permission denied")) {
      return "❌ Error de permisos: Las políticas de seguridad no están configuradas correctamente.";
    }

    console.error("Error completo:", error);
    return `❌ Error: ${message}`;
  };

  const handleRegistrationSuccess = (authData: any) => {
    setSuccess(t.success);
    
    if (authData.session) {
      setTimeout(() => {
        setSuccess(t.redirecting);
        router.push("/dashboard");
      }, 2000);
    } else {
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      console.log("� Iniciando registro completo...");
      console.log("📧 Email:", form.email);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { 
            full_name: form.fullName,
            phone: form.phone,
            location: form.location,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      console.log("✅ Usuario creado:", authData.user.id);

      // Ya no llamamos a createUserProfile ni updateOrCreateProfile
      // El trigger de la base de datos se encarga de crear el perfil

      handleRegistrationSuccess(authData);

    } catch (error: any) {
      console.error("❌ Error en registro:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/30 p-4">
      <Card className="w-full max-w-2xl animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">🌱</div>
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                👤 {t.personal.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label={t.personal.fullName}
                  name="fullName"
                  placeholder="Juan Pérez"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="email"
                  label={t.personal.email}
                  name="email"
                  placeholder="juan@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="tel"
                  label={t.personal.phone}
                  name="phone"
                  placeholder="+34 600 123 456"
                  value={form.phone}
                  onChange={handleChange}
                />
                <Input
                  type="text"
                  label={t.personal.location}
                  name="location"
                  placeholder="Madrid, España"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Información de Cuenta */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                🔐 {t.account.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="password"
                  label={t.account.password}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="password"
                  label={t.account.confirmPassword}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Metas Iniciales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                🎯 {t.goals.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label={t.goals.monthlyGoal}
                  name="monthlyGoal"
                  placeholder="60"
                  value={form.monthlyGoal.toString()}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                />
                <Input
                  type="number"
                  label={t.goals.weeklyGoal}
                  name="weeklyGoal"
                  placeholder="15"
                  value={form.weeklyGoal.toString()}
                  onChange={handleChange}
                  min="1"
                  max="500"
                />
              </div>
              <Checkbox
                name="dailyReminder"
                checked={form.dailyReminder}
                onChange={handleChange}
                label={t.goals.dailyReminder}
              />
            </div>

            {/* Preferencias */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                ⚙️ {t.preferences.title}
              </h3>
              <div className="space-y-3">
                <Checkbox
                  name="weeklyReport"
                  checked={form.weeklyReport}
                  onChange={handleChange}
                  label={t.preferences.weeklyReport}
                />
                <Checkbox
                  name="publicProfile"
                  checked={form.publicProfile}
                  onChange={handleChange}
                  label={t.preferences.publicProfile}
                />
              </div>
            </div>

            {/* Botón de registro */}
            <Button 
              className="w-full" 
              size="lg" 
              type="submit" 
              disabled={loading}
            >
              {loading ? t.creating : t.register}
            </Button>

            {/* Mensajes */}
            {error && (
              <div className="text-destructive text-center text-sm mt-2 p-3 bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 dark:text-green-400 text-center text-sm mt-2 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                {success}
              </div>
            )}
          </form>

          <div className="text-center space-y-2 pt-4 border-t border-border">
            <Link href="/login" className="text-sm text-primary hover:underline">
              {t.haveAccount} {t.login}
            </Link>
            <p className="text-xs text-muted-foreground">
              {t.terms}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 