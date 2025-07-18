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
import zxcvbn from "zxcvbn";

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
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Verificar si Supabase está configurado

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
    setFieldErrors({ ...fieldErrors, [name]: "" }); // Limpiar error al escribir
    // Barra de fortaleza de contraseña
    if (name === "password") {
      const result = zxcvbn(value);
      setPasswordScore(result.score);
      setPasswordFeedback(result.feedback.suggestions[0] || "");
    }
  };

  const validateForm = (): string | null => {
    const errors: { [key: string]: string } = {};
    if (!form.fullName.trim()) {
      errors.fullName = t.nameRequired;
    }
    if (!form.email.includes("@")) {
      errors.email = t.emailInvalid;
    }
    if (form.password.length < 6) {
      errors.password = t.passwordMinLength;
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = t.passwordMismatch;
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return "Por favor corrige los errores indicados.";
    }
    return null;
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
                {fieldErrors.fullName && (
                  <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.fullName}</div>
                )}
                <Input
                  type="email"
                  label={t.personal.email}
                  name="email"
                  placeholder="juan@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.email && (
                  <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.email}</div>
                )}
                <Input
                  type="tel"
                  label={t.personal.phone}
                  name="phone"
                  placeholder="+34 600 123 456"
                  value={form.phone}
                  onChange={handleChange}
                />
                {fieldErrors.phone && (
                  <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.phone}</div>
                )}
                <Input
                  type="text"
                  label={t.personal.location}
                  name="location"
                  placeholder="Madrid, España"
                  value={form.location}
                  onChange={handleChange}
                />
                {fieldErrors.location && (
                  <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.location}</div>
                )}
              </div>
            </div>

            {/* Información de Cuenta */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                🔐 {t.account.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="password"
                    label={t.account.password}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  {/* Reglas de contraseña */}
                  <ul className="text-xs text-muted-foreground mt-1 mb-1 pl-4 list-disc">
                    <li>Mínimo 6 caracteres</li>
                    <li>Evita usar datos personales</li>
                    <li>Mezcla mayúsculas, minúsculas, números y símbolos</li>
                  </ul>
                  {fieldErrors.password && (
                    <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.password}</div>
                  )}
                  {/* Barra de fortaleza de contraseña */}
                  {form.password && (
                    <div className="mt-2" aria-live="polite">
                      <div className="h-2 w-full rounded bg-muted flex">
                        <div
                          className={`h-2 rounded transition-all duration-300 ${
                            passwordScore === 0 ? "w-1/5 bg-red-500" :
                            passwordScore === 1 ? "w-2/5 bg-orange-500" :
                            passwordScore === 2 ? "w-3/5 bg-yellow-500" :
                            passwordScore === 3 ? "w-4/5 bg-green-400" :
                            "w-full bg-green-600"}
                          `}
                          style={{ minWidth: "8%" }}
                        />
                      </div>
                      <div className="text-xs mt-1 text-foreground">
                        {[
                          "Muy débil",
                          "Débil",
                          "Aceptable",
                          "Fuerte",
                          "Muy fuerte"
                        ][passwordScore]}
                        {passwordFeedback && (
                          <span className="ml-2 text-muted-foreground">- {passwordFeedback}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Input
                  type="password"
                  label={t.account.confirmPassword}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.confirmPassword && (
                  <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.confirmPassword}</div>
                )}
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
                {fieldErrors.monthlyGoal && (
                  <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.monthlyGoal}</div>
                )}
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
                {fieldErrors.weeklyGoal && (
                  <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.weeklyGoal}</div>
                )}
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
                {fieldErrors.weeklyReport && (
                  <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.weeklyReport}</div>
                )}
                <Checkbox
                  name="publicProfile"
                  checked={form.publicProfile}
                  onChange={handleChange}
                  label={t.preferences.publicProfile}
                />
                {fieldErrors.publicProfile && (
                  <div className="text-xs text-destructive mt-1" aria-live="polite">{fieldErrors.publicProfile}</div>
                )}
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